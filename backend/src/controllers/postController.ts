import { getFirestore, updateDoc, getDocs, doc, deleteDoc, getDoc, query, where, collection, addDoc } from 'firebase/firestore';
import { uploadToAzureBlob, deleteFromAzureBlob } from '../utils/blobStorage';
import type { PostInfo, EventInfo, UserInfo, PolisType } from '../types/types';
import { executeQuery } from '../utils/dbUtils';
import { v4 as uuidv4 } from 'uuid';


export async function addPost(postInfo: PostInfo, tags?: []) {
  try {
    // Validate required fields
    if (!postInfo) {
      throw new Error('Missing postInfo object.');
    }
    if (!postInfo.userId) {
      throw new Error('Missing required field: authorId.');
    }
    if (!postInfo.title) {
      throw new Error('Missing required field: title.');
    }
    if (!postInfo.description) {
      throw new Error('Missing required field: description.');
    }
    if (
      typeof postInfo.latitude !== 'number' ||
      typeof postInfo.longitude !== 'number' ||
      typeof postInfo.latitudeDelta !== 'number' ||
      typeof postInfo.longitudeDelta !== 'number'
    ) {
      throw new Error('Missing or invalid location fields.');
    }

    const uniquePostId = uuidv4();
    const query = `
      INSERT INTO posts (id, userId, title, description, latitude, longitude, latitudeDelta, longitudeDelta, createdAt, updatedAt)
      VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9)
    `;
    const params = [
      uniquePostId,
      postInfo.userId,
      postInfo.title,
      postInfo.description,
      postInfo.latitude,
      postInfo.longitude,
      postInfo.latitudeDelta,
      postInfo.longitudeDelta,
      new Date(),
      new Date()
    ];

    const result = await executeQuery(query, params);
    try {
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
              return {
                success: false,
                error: `Failed to insert tag '${tag}': ${tagError.message || tagError}`
              };
            }
          }
        }
        return { success: true, postId: uniquePostId };
      } else {
        throw new Error('Failed to insert post into database.');
      }
    } catch (err: any) {
      // Catch any error in the block above
      return {
        success: false,
        error: err.message || 'Unknown error occurred while adding post and tags.'
      };
    }

  } catch (error: any) {
    // Return a meaningful error object
    return {
      success: false,
      error: error.message || 'Unknown error occurred while adding post.'
    };
  }
}

export async function addEvent(eventInfo: EventInfo, tags?: []){
    try {
        // Validate required fields
        if (!eventInfo) {
          throw new Error('Missing postInfo object.');
        }
        if (!eventInfo.userId) {
          throw new Error('Missing required field: authorId.');
        }
        if (!eventInfo.title) {
          throw new Error('Missing required field: title.');
        }
        if (!eventInfo.description) {
          throw new Error('Missing required field: description.');
        }
        if (
          typeof eventInfo.latitude !== 'number' ||
          typeof eventInfo.longitude !== 'number' ||
          typeof eventInfo.latitudeDelta !== 'number' ||
          typeof eventInfo.longitudeDelta !== 'number'
        ) {
          throw new Error('Missing or invalid location fields.');
        }
    
        const uniquePostId = uuidv4();
        const query = `
          INSERT INTO posts (id, userId, title, description, latitude, longitude, latitudeDelta, longitudeDelta, createdAt, updatedAt)
          VALUES (@param0, @param1, @param2, @param3, @param4, @param5, @param6, @param7, @param8, @param9)
        `;
        const params = [
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

        const result = await executeQuery(query, params);

        const eventResult = await executeQuery(eventQuery, eventParams);
        try {
          if (result.rowsAffected && result.rowsAffected[0] === 1 && eventResult.rowsAffected && eventResult.rowsAffected[0] === 1) {
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
                  return {
                    success: false,
                    error: `Failed to insert tag '${tag}': ${tagError.message || tagError}`
                  };
                }
              }
            }
            return { success: true, postId: uniquePostId };
          } else {
            throw new Error('Failed to insert post into database.');
          }
        } catch (err: any) {
          // Catch any error in the block above
          return {
            success: false,
            error: err.message || 'Unknown error occurred while adding post and tags.'
          };
        }
    
      } catch (error: any) {
        // Return a meaningful error object
        return {
          success: false,
          error: error.message || 'Unknown error occurred while adding post.'
        };
      }
}


// export async function editPost(oldPostInfo: PostDBInfo, newPostInfo: PostDBInfo, newImages: string[]) {
//     // Find the Firestore document with the correct postId field (not doc id)
//     if (oldPostInfo == newPostInfo) return; 
//     if (!oldPostInfo || !oldPostInfo.postId) {
//         console.error("No post or postId provided to editPost");
//         return;
//     }
//     // Check for things that should not change while editing a post
//     if (
//         oldPostInfo.postId !== newPostInfo.postId ||
//         oldPostInfo.authorId !== newPostInfo.authorId ||
//         oldPostInfo.author !== newPostInfo.author ||
//         oldPostInfo.date !== newPostInfo.date
//     ) {
//         console.error("Attempted to change immutable post fields (postId, authorId, author, or date) during editPost");
//         return;
//     }
//     if (oldPostInfo.images_url_blob !== newPostInfo.images_url_blob){
//         console.error("Incorrect format for changing images");
//         return;
//     }
//     try {
//         const postsRef = collection(db, 'posts');
//         const q = query(postsRef, where('postId', '==', oldPostInfo.postId));
//         const querySnapshot = await getDocs(q);

//         if (querySnapshot.empty) {
//             console.warn(`No Firestore post found with postId: ${oldPostInfo.postId}`);
//             return;
//         }

//         // Update all matching docs (should only be one, but just in case)
//         for (const docSnap of querySnapshot.docs) {
//             await updateDoc(docSnap.ref, {
//                 title: newPostInfo.title,
//                 description: newPostInfo.description,
//                 location: newPostInfo.location,
//                 tags: newPostInfo.tags,
//                 // images: newPostInfo.images, // Don't worry about new images, handled elsewhere
//             });
//             console.log(`Edited Firestore post with doc id: ${docSnap.id}`);
//         }
//     } catch (error) {
//         console.error("Error editing post: ", error);
//         throw error;
//     }
//     if (Array.isArray(newImages) && newImages.length > 0) {
//         // Add new images to the post using addPicturesToPost
//         await addPicturesToPost(newPostInfo, newImages);
//     }
// }

/**
 * Adds a picture URL to the images array of a post in Firestore.
 * @param postInfo PostDBInfo - The post object (must contain postId).
 * @param imageUrl string - The image URL to add.
 * @returns Promise<void>
 */
export async function addPicturesToPost(postInfo: PostInfo, imageUrls: string[]) {
    if (!postInfo || !postInfo.postId) {
        console.error("No post or postId provided to addPictureToPost");
        return;
    }
    try {

        // Add image to Blob
        let imagesBlobUrls = imageUrls
        try {
            imagesBlobUrls = await uploadImagesAndGetUrls(imageUrls, postInfo.authorId);
        }
        catch (error){
            console.error("Error uploading picture to blob storage: ", error);
            throw error;
        }
        // Update all matching docs (should only be one, but just in case)
        for (const docSnap of querySnapshot.docs) {
            const data = docSnap.data();
            const currentImages: string[] = Array.isArray(data.images) ? data.images : [];
            const updatedImages = [...currentImages, ...imagesBlobUrls];
            await updateDoc(docSnap.ref, { images: updatedImages });
            console.log(`Added image to Firestore post with doc id: ${docSnap.id}`);
        }
    } catch (error) {
        console.error("Error adding picture to post: ", error);
        throw error;
    }
}

// /**
//  * Deletes a post from the "posts" collection by its postId.
//  * @param post PostDBInfo - The post object to delete.
//  * @returns Promise<void>
//  */

// export async function deletePost(post: PostDBInfo) {
//   if (!post || !post.postId) {
//     console.error("No post or postId provided to deletePost");
//     return;
//   }

//   try {
//     // Find the Firestore document with the correct postId field (not doc id)
//     const postsRef = collection(db, 'posts');
//     const q = query(postsRef, where('postId', '==', post.postId));
//     const querySnapshot = await getDocs(q);

//     if (querySnapshot.empty) {
//       console.warn(`No Firestore post found with postId: ${post.postId}`);
//     }

//     // Delete all matching docs (should only be one, but just in case)
//     for (const docSnap of querySnapshot.docs) {
//       await deleteDoc(docSnap.ref);
//       console.log(`Deleted Firestore post with doc id: ${docSnap.id}`);
//     }

//     // Delete all images associated with the post from Azure Blob Storage
//     const tmp_images = post.images_url_blob || [];
//     if (Array.isArray(tmp_images) && tmp_images.length > 0) {
//       for (const imageUrl of tmp_images) {
//         try {
//           await deleteFromAzureBlob(imageUrl);
//           console.log(`Deleted image from Azure: ${imageUrl}`);
//         } catch (err) {
//           console.error(`Failed to delete image from Azure: ${imageUrl}`, err);
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Error deleting post: ", error);
//     throw error;
//   }
// }




// /**
//  * Uploads local image URIs to Azure Blob Storage and returns their URLs.
//  * @param localUris Array of local image URIs
//  * @param userId User ID to use in blob naming
//  * @returns Promise<string[]> Array of uploaded image URLs
//  */
// async function uploadImagesAndGetUrls(localUris: string[], userId: string): Promise<string[]> {
//     console.log('Uploading images:', localUris);
//     const uploadPromises = localUris.map(async (uri, idx) => {
//         const ext = uri.split('.').pop() || 'jpg';
//         const blobName = `${userId}_${Date.now()}_${idx}.${ext}`;
//         try {
//             console.log(`Uploading image ${uri} as ${blobName}`);
//             const url = await uploadToAzureBlob(uri, blobName, 'post-images');
//             console.log(`Successfully uploaded ${uri} to ${url}`);
//             return url;
//         } catch (err) {
//             console.error(`Error uploading image ${uri}:`, err);
//             throw err;
//         }
//     });
//     return await Promise.all(uploadPromises);
// }


// /**
//  * Gets all posts from the "posts" collection.
//  * @returns Array of post objects
//  *
//  * Post JSON structure:
//  * {
//  *   author: string,
//  *   authorId: string,
//  *   date: number | string,
//  *   description: string,
//  *   title: string,
//  *   images: string[],
//  *   postId: string,
//  *   location: { latitude, longitude, latitudeDelta, longitudeDelta }
//  * }
//  */


// /**
//  * Gets all posts from the "posts" collection.
//  * @returns Promise<PostDBInfo[]>
//  */
// export async function getAllPosts(): Promise<PostDBInfo[]> {
//     const postsRef = collection(db, "posts");
//     const postsSnap = await getDocs(postsRef);
//     return postsSnap.docs.map((doc) => {
//         const data = doc.data();
//         return {
//             author: data.author,
//             authorId: data.authorId,
//             date: data.date,
//             description: data.description,
//             title: data.title,
//             images_url_blob: data.images || [],
//             postId: data.postId,
//             location: data.location,
//             tags: data.tags || [],
//         } as PostDBInfo;
//     });
// }

// /**
//  * Gets a single post by postId.
//  * @param postId string
//  * @returns Post object or undefined
//  *
//  * Post JSON structure: see above
//  */
// export async function getPost(postId: string): Promise<PostDBInfo | undefined> {
//     const postRef = doc(db, "posts", postId);
//     const postSnap = await getDoc(postRef);
//     const data = postSnap.data();
//     if (!data) return undefined;
//     return {
//         author: data.author,
//         authorId: data.authorId,
//         date: data.date,
//         description: data.description,
//         title: data.title,
//         images_url_blob: data.images || [],
//         postId: data.postId,
//         location: data.location,
//         tags: data.tags || [],
//     } as PostDBInfo;
// }

// /**
//  * Fetches an image from a given URL and returns it as a Blob.
//  * Useful for downloading images stored in Azure Blob Storage or any public URL.
//  * @param imageURL The URL of the image to fetch.
//  * @returns A Blob representing the image data.
//  */
// export async function getImagesbyUrl(imageURL: string): Promise<Blob> {
//     try {
//         const response = await fetch(imageURL);
//         if (!response.ok) {
//             throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
//         }
//         const blob = await response.blob();
//         return blob;
//     } catch (error) {
//         console.error("Error fetching image by URL:", error);
//         throw error;
//     }
// }

// /**
//  * Gets all posts by a specific authorId.
//  * @param authorId string
//  * @returns Array of post objects
//  *
//  * Post JSON structure: see above
//  */
// export async function getPostbyAuthorID(authorId: string): Promise<PostDBInfo[]> { 
//     const querySnapshot = await getDocs(query(collection(db, "posts"), where("authorId", "==", authorId)));
//     return querySnapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {            
//             author: data.author,
//             authorId: data.authorId,
//             date: data.date,
//             description: data.description,
//             title: data.title,
//             images_url_blob: data.images || [],
//             postId: data.postId,
//             location: data.location,
//             tags: data.tags || [],
//         } as PostDBInfo;
//     });
// }

// export async function getPostbyTag(tag: string): Promise<PostDBInfo[]> {
//     const querySnapshot = await getDocs(
//         query(collection(db, "posts"), where("tags", "array-contains", tag))
//     );
//     return querySnapshot.docs.map((doc) => {
//         const data = doc.data();
//         return {
//             author: data.author,
//             authorId: data.authorId,
//             date: data.date,
//             description: data.description,
//             title: data.title,
//             images_url_blob: data.images || [],
//             postId: data.postId,
//             location: data.location,
//             tags: data.tags || [],
//         } as PostDBInfo;
//     });
// }