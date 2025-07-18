import { Router, Request, Response } from 'express';
import { uploadToAzureBlob, deleteFromAzureBlob } from '../utils/blobStorage';
import type { PostInfo, EventInfo, UserInfo, PolisType } from '../types/types';
import { executeQuery } from '../utils/dbUtils';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
function toSqlDateString(date: Date) {
  // Returns 'YYYY-MM-DD HH:mm:ss.SSS'
  return date.toISOString().replace('T', ' ').replace('Z', '');
}
/**
 * Route: POST /posts
 * Adds a new post.
 */
router.post('/posts', async (req: Request, res: Response) => {
  console.log("Received POST /posts with body:", req.body);
  try {
    const postInfo: PostInfo = req.body.postInfo || req.body;
    const tags: string[] = req.body.tags || [];

    // Validate required fields
    if (!postInfo) {
      return res.status(400).json({ success: false, error: 'Missing postInfo object.' });
    }
    if (!postInfo.userId) {
      return res.status(400).json({ success: false, error: 'Missing required field: userId.' });
    }
    if (!postInfo.title) {
      return res.status(400).json({ success: false, error: 'Missing required field: title.' });
    }
    if (!postInfo.description) {
      return res.status(400).json({ success: false, error: 'Missing required field: description.' });
    }
    if (
      typeof postInfo.latitude !== 'number' ||
      typeof postInfo.longitude !== 'number' ||
      typeof postInfo.latitudeDelta !== 'number' ||
      typeof postInfo.longitudeDelta !== 'number'
    ) {
      return res.status(400).json({ success: false, error: 'Missing or invalid location fields. Received: ' + JSON.stringify({ latitude: postInfo.latitude, longitude: postInfo.longitude, latitudeDelta: postInfo.latitudeDelta, longitudeDelta: postInfo.longitudeDelta }) });
    }

    const uniquePostId = uuidv4();
    const now = new Date()
    const query = `
      INSERT INTO posts (id, userId, title, description, latitude, longitude, latitudeDelta, longitudeDelta, createdAt, updatedAt)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9)
    `;
    const params = [
      uniquePostId,
      postInfo.userId,
      postInfo.title,
      postInfo.description,
      postInfo.latitude.toString(),      // <-- convert to string
      postInfo.longitude.toString(),     // <-- convert to string
      postInfo.latitudeDelta.toString(),
      postInfo.longitudeDelta.toString(),
      toSqlDateString(now),
      toSqlDateString(now)
    ];
    console.log("Params for SQL query:", params);

    const result = await executeQuery(query, params);

    if (result.rowsAffected && result.rowsAffected[0] === 1) {
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tag of tags) {
          try {
            // Insert tag into tags table if it doesn't exist, then insert into post_tags
            const tagId = require('crypto').createHash('sha256').update(tag).digest('hex');
            // Insert tag if not exists
            await executeQuery(
              `
              IF NOT EXISTS (SELECT 1 FROM tags WHERE name = @param0)
              BEGIN
                INSERT INTO tags (id, name) VALUES (@param1, @param0)
              END
              `,
              [tag, tagId]
            );

            await executeQuery(
              `
                IF NOT EXISTS (
                  SELECT 1 FROM post_tags WHERE postId = @param0 AND tagId = @param1
                )
                BEGIN
                  INSERT INTO post_tags (postId, tagId)
                  VALUES (@param0, @param1)
                END
              `,
              [uniquePostId, tagId]
            );
          } catch (tagError: any) {
            // If a tag insert fails, log and return error
            return res.status(500).json({
              success: false,
              error: `Failed to insert tag '${tag}': ${tagError.message || tagError}`
            });
          }
        }
      }
      return res.status(201).json({ success: true, postId: uniquePostId });
    } else {
      return res.status(500).json({ success: false, error: 'Failed to insert post into database.' });
    }
  } catch (error: any) {
    // Return a meaningful error object
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred while adding post.'
    });
  }
});

/**
 * Route: POST /events
 * Adds a new event (and its post).
 */
router.post('/events', async (req: Request, res: Response) => {
  try {
    const eventInfo: EventInfo = req.body.eventInfo;
    const tags: string[] = req.body.tags || [];

    // Validate required fields
    if (!eventInfo) {
      return res.status(400).json({ success: false, error: 'Missing eventInfo object.' });
    }
    if (!eventInfo.userId) {
      return res.status(400).json({ success: false, error: 'Missing required field: userId.' });
    }
    if (!eventInfo.title) {
      return res.status(400).json({ success: false, error: 'Missing required field: title.' });
    }
    if (!eventInfo.description) {
      return res.status(400).json({ success: false, error: 'Missing required field: description.' });
    }
    if (
      typeof eventInfo.latitude !== 'number' ||
      typeof eventInfo.longitude !== 'number' ||
      typeof eventInfo.latitudeDelta !== 'number' ||
      typeof eventInfo.longitudeDelta !== 'number'
    ) {
      return res.status(400).json({ success: false, error: 'Missing or invalid location fields.' });
    }

    const uniquePostId = uuidv4();
    const postQuery = `
      INSERT INTO posts (id, userId, title, description, latitude, longitude, latitudeDelta, longitudeDelta, createdAt, updatedAt)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9)
    `;
    const postParams = [
      uniquePostId,
      eventInfo.userId,
      eventInfo.title,
      eventInfo.description,
      eventInfo.latitude,
      eventInfo.longitude,
      eventInfo.latitudeDelta,
      eventInfo.longitudeDelta,
      new Date(),
      new Date()
    ];

    // Insert the event into the events table after creating the post
    const eventQuery = `
      INSERT INTO events (postId, eventStart, eventEnd)
      VALUES (@param0, @param1, @param2)
    `;
    const eventParams = [
      uniquePostId,
      eventInfo.event_start ? new Date(eventInfo.event_start) : null,
      eventInfo.event_end ? new Date(eventInfo.event_end) : null
    ];

    const postResult = await executeQuery(postQuery, postParams);
    const eventResult = await executeQuery(eventQuery, eventParams);

    if (
      postResult.rowsAffected && postResult.rowsAffected[0] === 1 &&
      eventResult.rowsAffected && eventResult.rowsAffected[0] === 1
    ) {
      // Handle tags if provided
      if (Array.isArray(tags) && tags.length > 0) {
        for (const tag of tags) {
          try {
            // Insert tag into tags table if it doesn't exist, then insert into post_tags
            const tagId = require('crypto').createHash('sha256').update(tag).digest('hex');
            // Insert tag if not exists
            await executeQuery(
              `
              IF NOT EXISTS (SELECT 1 FROM tags WHERE name = @param0)
              BEGIN
                INSERT INTO tags (id, name) VALUES (@param1, @param0)
              END
              `,
              [tag, tagId]
            );

            await executeQuery(
              `
                IF NOT EXISTS (
                  SELECT 1 FROM post_tags WHERE postId = @param0 AND tagId = @param1
                )
                BEGIN
                  INSERT INTO post_tags (postId, tagId)
                  VALUES (@param0, @param1)
                END
              `,
              [uniquePostId, tagId]
            );
          } catch (tagError: any) {
            // If a tag insert fails, log and return error
            return res.status(500).json({
              success: false,
              error: `Failed to insert tag '${tag}': ${tagError.message || tagError}`
            });
          }
        }
      }
      return res.status(201).json({ success: true, postId: uniquePostId });
    } else {
      return res.status(500).json({ success: false, error: 'Failed to insert event into database.' });
    }
  } catch (error: any) {
    // Return a meaningful error object
    return res.status(500).json({
      success: false,
      error: error.message || 'Unknown error occurred while adding event.'
    });
  }
});

/**
 * Route: POST /posts/images
 * Adds pictures to a post.
 */
router.post('/posts/images', async (req: Request, res: Response) => {
  const { postId, userId, imageUrls } = req.body;

  if (!postId || !userId || !Array.isArray(imageUrls) || imageUrls.length === 0) {
    return res.status(400).json({
      success: false,
      error: "Missing required fields: postId, userId, or imageUrls."
    });
  }

  try {
    // Upload images to Blob Storage and get their URLs
    let imagesBlobUrls: string[];
    try {
      imagesBlobUrls = await uploadImagesAndGetUrls(imageUrls, userId);
    } catch (error) {
      console.error("Error uploading picture to blob storage: ", error);
      return res.status(500).json({
        success: false,
        error: "Error uploading images to blob storage."
      });
    }

    // Insert each image URL into the images table
    const insertedImages: string[] = [];
    for (const imageUrl of imagesBlobUrls) {
      const image_id = uuidv4();
      const query = `
        INSERT INTO images (id, postId, imageUrl)
        VALUES (@param0, @param1, @param2)
      `;
      const params = [
        image_id,
        postId,
        imageUrl,
      ];
      try {
        await executeQuery(query, params);
        insertedImages.push(imageUrl);
        console.log(`Added image URL to post ${postId}: ${imageUrl}`);
      } catch (err) {
        console.error(`Failed to add image URL to post ${postId}: ${imageUrl}`, err);
        // Optionally, continue to next image or return error
      }
    }

    return res.status(201).json({
      success: true,
      postId,
      images: insertedImages
    });
  } catch (error) {
    console.error("Error adding pictures to post: ", error);
    return res.status(500).json({
      success: false,
      error: "Error adding pictures to post."
    });
  }
});

/**
 * Helper function for uploading images and getting their URLs.
 */
async function uploadImagesAndGetUrls(localUris: string[], userId: string): Promise<string[]> {
  console.log('Uploading images:', localUris);
  const uploadPromises = localUris.map(async (uri, idx) => {
    const ext = uri.split('.').pop() || 'jpg';
    const blobName = `${userId}_${Date.now()}_${idx}.${ext}`;
    try {
      console.log(`Uploading image ${uri} as ${blobName}`);
      const url = await uploadToAzureBlob(uri, blobName, 'post-images');
      console.log(`Successfully uploaded ${uri} to ${url}`);
      return url;
    } catch (err) {
      console.error(`Error uploading image ${uri}:`, err);
      throw err;
    }
  });
  return await Promise.all(uploadPromises);
}

/**
 * Route: GET /posts/by-author
 * Gets all posts by a specific authorId.
 * Query param: authorId
 */
router.get('/posts/by-author', async (req: Request, res: Response) => {
  const authorId = req.query.authorId as string;
  if (!authorId) {
    return res.status(400).json({ success: false, error: "Missing required query parameter: authorId" });
  }

  const query = `
      SELECT 
          id as postId,
          userId,
          title,
          description,
          date,
          latitude,
          latitudeDelta,
          longitude,
          longitudeDelta
      FROM posts
      WHERE userId = @param0
  `;
  const params = [authorId];

  try {
    const result = await executeQuery(query, params);

    const posts = (result.recordset || []).map((row: any) => ({
      postId: row.postId,
      userId: row.userId,
      type: 'post',
      title: row.title,
      description: row.description,
      descrtiption: row.description, // typo kept for compatibility with type
      date: row.date,
      latitude: row.latitude,
      latitudeDelta: row.latitudeDelta,
      longitude: row.longitude,
      longitudeDelta: row.longitudeDelta,
    }));

    return res.status(200).json({ success: true, posts });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred while fetching posts by authorId."
    });
  }
});

/**
 * Route: GET /posts/by-tag
 * Gets all posts that contain a specific tag.
 * Query param: tag
 */
router.get('/posts/by-tag', async (req: Request, res: Response) => {
  const tag = req.query.tag as string;
  if (!tag) {
    return res.status(400).json({ success: false, error: "Missing required query parameter: tag" });
  }

  try {
    // First, get the tagId for the given tag name
    const tagIdQuery = `
        SELECT id FROM tags WHERE name = @param0
    `;
    const tagIdResult = await executeQuery(tagIdQuery, [tag]);
    if (!tagIdResult.recordset || tagIdResult.recordset.length === 0) {
      return res.status(200).json({ success: true, posts: [] });
    }
    const tagId = tagIdResult.recordset[0].id;

    // Get all postIds that have the tagId in the post_tags join table
    const postTagQuery = `
        SELECT pt.postId
        FROM post_tags pt
        WHERE pt.tagId = @param0
    `;
    const postTagResult = await executeQuery(postTagQuery, [tagId]);
    const postIds = (postTagResult.recordset || []).map((row: any) => row.postId);

    if (postIds.length === 0) {
      return res.status(200).json({ success: true, posts: [] });
    }

    // Now, fetch all posts with those postIds
    const placeholders = postIds.map((_: string, idx: number) => `@param${idx}`).join(', ');
    const postQuery = `
        SELECT 
            id as postId,
            userId,
            title,
            description,
            date,
            latitude,
            latitudeDelta,
            longitude,
            longitudeDelta
        FROM posts
        WHERE id IN (${placeholders})
    `;
    const postResult = await executeQuery(postQuery, postIds);

    const posts = (postResult.recordset || []).map((row: any) => ({
      postId: row.postId,
      userId: row.userId,
      type: 'post',
      title: row.title,
      description: row.description,
      descrtiption: row.description, // typo kept for compatibility with type
      date: row.date,
      latitude: row.latitude,
      latitudeDelta: row.latitudeDelta,
      longitude: row.longitude,
      longitudeDelta: row.longitudeDelta,
    }));

    return res.status(200).json({ success: true, posts });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred while fetching posts by tag."
    });
  }
});


router.delete('/post', async (req: Request, res: Response) => {
  const postId = req.query.id as string;
  if ( !postId) {
    return res.status(400).json({ success: false, error: "Missing required query parameter: id" });
  }
  try {
    // Delete the post from the posts table
    const postImagesQuery = `SELECT imageUrl FROM images WHERE postId = @param0`;
    const postImagesResult = await executeQuery(postImagesQuery, [postId]);
    const deletePostQuery = `DELETE FROM posts WHERE id = @param0`;
    await executeQuery(deletePostQuery, [postId] );

    // Delete images from Azure Blob Storage if any exist for this post
    if (postImagesResult && postImagesResult.recordset && postImagesResult.recordset.length > 0) {
      for (const imageRow of postImagesResult.recordset) {
        if (imageRow.imageUrl) {
          try {
            await deleteFromAzureBlob(imageRow.imageUrl);
          } catch (err) {
            // Log error but continue deleting other images
            console.error(`Failed to delete image from Azure Blob: ${imageRow.imageUrl}`, err);
          }
        }
      }
    }

    return res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || "Failed to delete post" });
  }

})
export default router;