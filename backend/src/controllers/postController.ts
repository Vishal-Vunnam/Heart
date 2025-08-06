import { Router, Request, Response } from 'express';
import { uploadToAzureBlob, deleteFromAzureBlob } from '../utils/blobStorage';
import type { PostInfo, EventInfo, UserInfo, PolisType } from '../types/types';
import { executeQuery } from '../utils/dbUtils';
import { v4 as uuidv4 } from 'uuid';
import { getRandomColor } from '../functions/getRandomColor';

const router = Router();
function toSqlDateString(date: Date) {
  // Returns 'YYYY-MM-DD HH:mm:ss.SSS'
  return date.toISOString().replace('T', ' ').replace('Z', '');
}

/**
 * Adds users to a private post (stub function).
 * @param invitees Array of user IDs to invite to the private post.
 * @returns Promise<void>
 */
async function addUsersToPrivatePost(invitees: string[], postId: string, userId: string): Promise<void> {
  if (!(invitees.length > 0 ) ||  !postId) {
    return Promise.reject();
  }
  // Insert all invitees into post_viewer in a single query
  if (invitees.length > 0) {
    // Build a VALUES list for bulk insert
    const param_count = invitees.length +1; 
    const values = invitees.map((userId, idx) => `(@param0, @param${idx + 1}, @param${param_count})`).join(', ');
    const params = [postId, ...invitees, userId];
    await executeQuery(
      `
      INSERT INTO post_viewer (post_id, user_id, created_by)
      VALUES ${values}
      `,
      params
    );
  }
  return Promise.resolve();
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
    const allowedMembers: string[] = req.body.allowedMembers

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
      INSERT INTO posts (id, userId, title, description, latitude, longitude, latitudeDelta, longitudeDelta, createdAt, updatedAt, private)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9, @param10)
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
      toSqlDateString(now),
      (postInfo.private ?? false) ? '1' : '0'
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
            console.log('adding tag', tag);
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

      if (postInfo.private && Array.isArray(allowedMembers) && allowedMembers.length > 0) { 
        await addUsersToPrivatePost(allowedMembers, uniquePostId, postInfo.userId);
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

// `IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='post_viewer' AND xtype='U')
// CREATE TABLE post_viewer (
//   post_id NVARCHAR(255) NOT NULL,         -- ID of the post being viewed
//   user_id NVARCHAR(255) NOT NULL,         -- ID of the user who viewed the post
//   created_by NVARCHAR(255) NOT NULL,      -- Who created the view record (usually same as user_id)
//   PRIMARY KEY (post_id, user_id),
//   FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
//   FOREIGN KEY (user_id) REFERENCES users(id)  -- No cascade to avoid multiple cascade paths
// )`,


/**
 * Route: GET /posts/by-author
 * Gets all posts by a specific authorId.
 * Query param: authorId
 *
 * This function should work as intended, assuming:
 * - The executeQuery utility is correctly implemented and returns a result with a .recordset property.
 * - The database supports the FOR JSON PATH subquery (SQL Server).
 * - The images table and posts table are set up as expected.
 */
router.get('/posts/by-author', async (req: Request, res: Response) => {
  console.log('GET /posts/by-author called');
  const authorId = req.query.authorId as string;
  
  if (!authorId) {
    return res.status(400).json({ success: false, error: "Missing required query parameter: authorId" });
  }

  // Assume req.user.uid is set by auth middleware
  const currentUserId = req.query.currentUserId;

  // Query to get posts by author, including images as a JSON array and the private field

  console.log("THIS IS THE ID" , currentUserId);
  const query = `
    SELECT 
      p.id as postId,
      p.userId,
      u.displayName as userDisplayName,
      u.photoURL as userPhotoURL,
      p.title,
      p.description,
      p.createdAt,
      p.latitude,
      p.latitudeDelta,
      p.longitude,
      p.longitudeDelta,
      p.private,
      (
        SELECT 
          i.imageUrl
        FROM images i
        WHERE i.postId = p.id
        FOR JSON PATH
      ) as images
    FROM posts p
    LEFT JOIN post_viewer pv 
      ON p.id = pv.post_id AND pv.user_id = @param1
    LEFT JOIN users u ON p.userId = u.id
    WHERE p.userId = @param0
      AND (p.private = 0 OR p.userId = @param1 OR pv.post_id IS NOT NULL);
  `;
  /*SELECT 
    p.*,
    (
      SELECT 
        i.imageUrl
      FROM images i
      WHERE i.postId = p.id
      FOR JSON PATH
    ) as images
  FROM posts p
  LEFT JOIN post_viewer pv 
    ON p.id = pv.post_id AND pv.user_id = @param1
  WHERE p.userId = @param0
    AND (p.private = 0 OR p.userId = @param1 OR pv.post_id IS NOT NULL);
  */
  const params = [authorId, currentUserId];



  try {
    const result = await executeQuery(query, params);

    // Do not filter based on private; return all posts as-is
    const posts = (result.recordset || []).map((row: any) => {
      let images: any[] = [];
      try {
        images = row.images ? JSON.parse(row.images) : [];
      } catch {
        images = [];
      }

      const postInfo = {
        postId: row.postId,
        userId: row.userId,
        userDisplayName: row.userDisplayName, 
        userPhotoURL: row.userPhotoURL,
        type: 'post',
        title: row.title,
        description: row.description,
        date: row.createdAt,
        latitude: row.latitude,
        latitudeDelta: row.latitudeDelta,
        longitude: row.longitude,
        longitudeDelta: row.longitudeDelta,
        private: !!row.private,
        markerColor: getRandomColor(), 
      };

      return {
        postInfo,
        images
      };
    });
    return res.status(200).json({ success: true, posts });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred while fetching posts by authorId."
    });
  }
});

router.get('/markerposts/by-author', async (req: Request, res: Response) =>  { 
  console.log('GET /posts/by-author called');
  const authorId = req.query.authorId as string;
  
  if (!authorId) {
    return res.status(400).json({ success: false, error: "Missing required query parameter: authorId" });
  }

  // Assume req.user.uid is set by auth middleware
  const currentUserId = req.query.currentUserId;

  // Query to get posts by author, including images as a JSON array and the private field

  const query = `
    SELECT 
      p.id as postId,
      p.userId,
      p.latitude,
      p.latitudeDelta,
      p.longitude,
      p.longitudeDelta,
      p.private
    FROM posts p
    LEFT JOIN post_viewer pv 
      ON p.id = pv.post_id AND pv.user_id = @param1
    WHERE p.userId = @param0
      AND (p.private = 0 OR p.userId = @param1 OR pv.post_id IS NOT NULL);
  `;
  /*SELECT 
    p.*,
    (
      SELECT 
        i.imageUrl
      FROM images i
      WHERE i.postId = p.id
      FOR JSON PATH
    ) as images
  FROM posts p
  LEFT JOIN post_viewer pv 
    ON p.id = pv.post_id AND pv.user_id = @param1
  WHERE p.userId = @param0
    AND (p.private = 0 OR p.userId = @param1 OR pv.post_id IS NOT NULL);
  */
  const params = [authorId, currentUserId];



  try {
    const result = await executeQuery(query, params);

    // Do not filter based on private; return all posts as-is
    const posts = (result.recordset || []).map((row: any) => {

        return {
        postId: row.postId,
        userId: row.userId, 
        latitude: row.latitude,
        latitudeDelta: row.latitudeDelta,
        longitude: row.longitude,
        longitudeDelta: row.longitudeDelta,
        private: !!row.private,
        markerColor: getRandomColor(), 
      };
    });

    return res.status(200).json({ success: true, posts });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred while fetching posts by authorId."
    });
  }
})

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

router.get('/post/by-id', async (req: Request, res: Response) =>  { 
  const postId = req.query.postId as string; 
  const currentUserId = req.query.currentUserId as string;
  if (!postId) {
    return res.status(400).json({ success: false, error: "Missing required query parameter: id" });
  }

  const query = `
  SELECT 
    p.id AS postId,
    p.userId,
    u.displayName as userDisplayName,
    u.photoURL as userPhotoURL,
    p.title,
    p.description,
    p.createdAt,
    p.latitude,
    p.latitudeDelta,
    p.longitude,
    p.longitudeDelta,
    p.private,
    (
      SELECT 
        i.imageUrl
      FROM images i
      WHERE i.postId = p.id
      FOR JSON PATH
    ) AS images,  -- ✅ Comma added here
    l.likesCount,
    l.likedByCurrentUser
  FROM posts p
  LEFT JOIN post_viewer pv 
    ON p.id = pv.post_id AND pv.user_id = @param1
  LEFT JOIN (
    SELECT
      post_id AS postId,
      COUNT(*) AS likesCount,
      MAX(CASE WHEN user_liked_id = @param1 THEN 1 ELSE 0 END) AS likedByCurrentUser
    FROM post_likes
    GROUP BY post_id
  ) l ON p.id = l.postId
  LEFT JOIN users u ON p.userId = u.id
  WHERE p.id = @param0
    AND (p.private = 0 OR p.userId = @param1 OR pv.post_id IS NOT NULL);
`;

  const params = [postId, currentUserId];
  try {
    const result = await executeQuery(query, params);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, error: "Post not found or you do not have permission to view it." });
    }

    const row = result.recordset[0];
    let images: any[] = [];
    try {
      images = row.images ? JSON.parse(row.images) : [];
    } catch {
      images = [];
    }

    const postInfo = {
      postId: row.postId,
      userId: row.userId,
      userDisplayName: row.userDisplayName, 
      userPhotoURL: row.userPhotoURL,
      type: 'post',
      title: row.title,
      description: row.description,
      date: row.createdAt,
      latitude: row.latitude,
      latitudeDelta: row.latitudeDelta,
      longitude: row.longitude,
      longitudeDelta: row.longitudeDelta,
      private: !!row.private,
      likesCount: row.likesCount || 0,
      likedByCurrentUser: row.likedByCurrentUser ? true : false
    };

    return res.status(200).json({ success: true, postInfo, images });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred while fetching post by id."
    });
  }

})

router.get('/explore', async (req: Request, res: Response) => {
  const currentUserId = req.query.currentUserId as string;
  const offset = parseInt(req.query.offset as string);
  const limit = parseInt(req.query.limit as string); // Optional limit

  console.log(offset);
  console.log(limit)
  if (!currentUserId) {
    return res.status(400).json({ success: false, error: "Missing required parameter: currentUserId" });
  }

  const query = `
    WITH userFriends AS (
      SELECT followee_id 
      FROM friendships 
      WHERE follower_id = @param0
    )
    SELECT 
      p.id AS postId,
      p.userId,
      u.displayName AS userDisplayName,
      u.photoURL AS userPhotoURL,
      p.title,
      p.description,
      p.createdAt,
      p.latitude,
      p.latitudeDelta,
      p.longitude,
      p.longitudeDelta,
      p.private,
      (
        SELECT 
          i.imageUrl
        FROM images i
        WHERE i.postId = p.id
        FOR JSON PATH
      ) AS images
    FROM posts p
    LEFT JOIN post_viewer pv ON p.id = pv.post_id AND pv.user_id = @param0
    LEFT JOIN users u ON p.userId = u.id
    WHERE p.userId IN (SELECT followee_id FROM userFriends)
      AND (p.private = 0 OR p.userId = @param0 OR pv.post_id IS NOT NULL)
    ORDER BY p.createdAt DESC
    OFFSET @param1 ROWS FETCH NEXT @param2 ROWS ONLY;
  `;

  const params = [currentUserId, offset, limit];

  try {
    const result = await executeQuery(query, params);

    const posts = result.recordset.map((row: any) => {
      let images: any[] = [];
      try {
        images = row.images ? JSON.parse(row.images) : [];
      } catch {
        images = [];
      }

      const postInfo =  {
        postId: row.postId,
        userId: row.userId,
        userDisplayName: row.userDisplayName,
        userPhotoURL: row.userPhotoURL,
        type: 'post',
        title: row.title,
        description: row.description,
        date: row.createdAt,
        latitude: row.latitude,
        latitudeDelta: row.latitudeDelta,
        longitude: row.longitude,
        longitudeDelta: row.longitudeDelta,
        private: !!row.private,
        images,
      };

      return {
        postInfo,
        images
      };
    });

    return res.status(200).json({ success: true, posts });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Unknown error occurred while fetching explore posts.",
    });
  }
});

router.put('/edit-post', async (req: Request, res: Response) => {
  // Accept postInfo in the request body (not query)
  const postInfo = req.body.postInfo;
  const tags: string[] | null = req.body.tags; 
  const allowedMembers: string[] | null = req.body.allowedMembers; 
  console.log(postInfo);
  if (!postInfo) {
    return res.status(400).json({ success: false, error: "Missing post information" });
  }

  try {
    // Parse postInfo if it's a string (in case client sends as JSON string)
    const parsedPostInfo = typeof postInfo === "string" ? JSON.parse(postInfo) : postInfo;

    const {
      postId,
      title,
      description,
    } = parsedPostInfo;

    if (!postId) {
      return res.status(400).json({ success: false, error: "Missing postId in postInfo" });
    }

    //INSERT INTO posts (id, userId, title, description, latitude, longitude, latitudeDelta, longitudeDelta, createdAt, updatedAt, private)

    // Update the post in the database
    const updateQuery = `
      UPDATE posts
      SET
        title = @param0,
        description = @param1,
        updatedAt = @param2
      WHERE id = @param3
    `;

    const now = new Date()

    await executeQuery(updateQuery, [
      title,
      description,
      toSqlDateString(now),
      postId
    ]);

    // Optionally, update tags or images here if needed

    return res.status(200).json({ success: true, message: "Post updated successfully" });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error.message || "Failed to update post"
    });
  }
});

router.put('/like_post', async (req: Request, res: Response) => { 
  const postId = req.query.postId as string;
  const userId = req.query.userId as string;
  if (!postId || !userId) {
    console.warn('[like_post] Missing required query parameters:', { postId, userId });
    return res.status(400).json({ success: false, error: "Missing required query parameters: id or userId" });
  }
  try {
    // Check if the like already exists
    const checkLikeQuery = `
      SELECT 1 FROM post_likes WHERE post_id = @param0 AND user_liked_id = @param1
    `;
    console.log('[like_post] Executing checkLikeQuery:', checkLikeQuery, [postId, userId]);
    const checkResult = await executeQuery(checkLikeQuery, [postId, userId]);

    if (checkResult.recordset.length > 0) {
      console.log(`[like_post] Like already exists for postId=${postId}, userId=${userId}`);
      return res.status(200).json({ success: true, message: "Post already liked" });
    }

    // Insert the like into the post_likes table
    const insertLikeQuery = `
      INSERT INTO post_likes (post_id, user_liked_id)
      VALUES (@param0, @param1)
    `;
    console.log('[like_post] Inserting like:', insertLikeQuery, [postId, userId]);
    await executeQuery(insertLikeQuery, [postId, userId]);

    console.log(`[like_post] Post liked successfully: postId=${postId}, userId=${userId}`);
    return res.status(200).json({ success: true, message: "Post liked successfully" });
  } catch (error: any) {
    console.error('[like_post] Error liking post:', error);
    return res.status(500).json({ success: false, error: error.message || "Failed to like post" });
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