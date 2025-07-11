import { getFirestore } from 'firebase/firestore';
import { app } from './firebaseConfig';
import { getDocs, doc, deleteDoc, getDoc, query, where } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { uploadToAzureBlob, deleteFromAzureBlob } from './blob-storage';
import type { PostDBInfo, PostRequestInfo, UserInfo } from '@/types';

export const db = getFirestore(app);

// -----------------------------
// JSON STRUCTURE COMMENTS
// -----------------------------

/**
 * User JSON structure (in "users" collection):
 * {
 *   displayName: string,
 *   email: string,
 *   uid: string,
 *   // ...other optional fields
 * }
 */

/**
 * Post JSON structure (in "posts" collection):
 * {
 *   postId: string,
 *   title: string,
 *   description: string,
 *   author: string,
 *   authorId: string,
 *   date: number | string, // timestamp or ISO string
 *   images: string[],      // array of image URLs
 *   location: {
 *     latitude: number,
 *     longitude: number,
 *     latitudeDelta: number,
 *     longitudeDelta: number
 *   },
 *   // Optional fields:
 *   // tags: string[],
 *   // comments: number,
 *   // likes: number,
 *   // views: number,
 *   // visibility: string
 * }
 */

// Example post location structure
const postLocation = {
    latitude: 0,
    latitudeDelta: 0,
    longitude: 0,
    longitudeDelta: 0,
}

// Example post structure
const postPopulate = {
    postId: "Post ID",
    location: postLocation,
};

const postInfo = {
    title: "Post Title",
    postId: "Post ID",
    location: postLocation,
    authorId: "Post Author ID",
    images: ["Image 1", "Image 2", "Image 3"],
    date: "Post Date",
    description: "Post Description",
    author: "Post Author",
    tags: ["Tag 1", "Tag 2", "Tag 3"],
}

// Generates a unique postId using current timestamp and random string
function generateUniquePostId() {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Uploads local image URIs to Azure Blob Storage and returns their URLs.
 * @param localUris Array of local image URIs
 * @param userId User ID to use in blob naming
 * @returns Promise<string[]> Array of uploaded image URLs
 */
async function uploadImagesAndGetUrls(localUris: string[], userId: string): Promise<string[]> {
    console.log('Uploading images:', localUris);
    const uploadPromises = localUris.map(async (uri, idx) => {
        const ext = uri.split('.').pop() || 'jpg';
        const blobName = `${userId}_${Date.now()}_${idx}.${ext}`;
        try {
            console.log(`Uploading image ${uri} as ${blobName}`);
            const url = await uploadToAzureBlob(uri, blobName);
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
 * Adds a new post to the "posts" collection.
 * @param postInfo PostRequestInfo
 * @returns Firestore DocumentReference
 *
 * Post JSON structure:
 * {
 *   postId: string,
 *   title: string,
 *   description: string,
 *   author: string,
 *   authorId: string,
 *   date: number,
 *   images: string[],
 *   location: { latitude, longitude, latitudeDelta, longitudeDelta }
 * }
 */
export async function addPost(postInfo: PostRequestInfo) {
    try {
        console.log('addPost called with:', postInfo);
        // Generate a unique postId for this post
        const uniquePostId = generateUniquePostId();
        let imagesBlobUrls = postInfo.images;
        if (postInfo.images && postInfo.images.length > 0) {
            try {
                imagesBlobUrls = await uploadImagesAndGetUrls(postInfo.images, postInfo.authorId);
            } catch (uploadError) {
                console.error('Error during image upload in addPost:', uploadError);
                throw uploadError;
            }
        }
        const postWithId = {
            ...postInfo,
            images: imagesBlobUrls,
            date: Date.now(),
            postId: uniquePostId,
        };
        console.log('Adding post to Firestore:', postWithId);
        const postRef = await addDoc(collection(db, "posts"), postWithId);
        console.log('Post successfully added with ref:', postRef);
        return postRef;
    } catch (error) {
        console.error("Error adding post: ", error);
        throw error;
    }
}

/**
 * Deletes a post from the "posts" collection by its postId.
 * @param post PostDBInfo - The post object to delete.
 * @returns Promise<void>
 */

export async function deletePost(post: PostDBInfo) {
  if (!post || !post.postId) {
    console.error("No post or postId provided to deletePost");
    return;
  }

  try {
    // Find the Firestore document with the correct postId field (not doc id)
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('postId', '==', post.postId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.warn(`No Firestore post found with postId: ${post.postId}`);
    }

    // Delete all matching docs (should only be one, but just in case)
    for (const docSnap of querySnapshot.docs) {
      await deleteDoc(docSnap.ref);
      console.log(`Deleted Firestore post with doc id: ${docSnap.id}`);
    }

    // Delete all images associated with the post from Azure Blob Storage
    const tmp_images = post.images_url_blob || [];
    if (Array.isArray(tmp_images) && tmp_images.length > 0) {
      for (const imageUrl of tmp_images) {
        try {
          await deleteFromAzureBlob(imageUrl);
          console.log(`Deleted image from Azure: ${imageUrl}`);
        } catch (err) {
          console.error(`Failed to delete image from Azure: ${imageUrl}`, err);
        }
      }
    }
  } catch (error) {
    console.error("Error deleting post: ", error);
    throw error;
  }
}


/**
 * Adds a new user to the "users" collection.
 * @param userInfo UserInfo
 * @returns Firestore DocumentReference
 *
 * User JSON structure:
 * {
 *   displayName: string,
 *   email: string,
 *   uid: string
 * }
 */
export async function addUser(userInfo: UserInfo){
    try {
        const userWithId = { 
            ...userInfo,
        }
        const userRef = await addDoc(collection(db, "users"), userWithId);
        return userRef;
    } catch (error) {
        console.error("Error adding user: ", error);
        throw error;
    }
}

/**
 * Gets all users from the "users" collection.
 * @returns Array<{ displayName, email, uid }>
 *
 * User JSON structure:
 * {
 *   displayName: string,
 *   email: string,
 *   uid: string
 * }
 */
export async function getAllUsers() {
    console.log("getting users")
    const usersRef = collection(db, "users")
    const usersSnap = await getDocs(usersRef);
    return usersSnap.docs.map((doc) => {
        const data = doc.data();
        return {
            displayName: data.displayName,
            email: data.email,
            uid: data.uid,
        };
    });
}

/**
 * Gets all posts from the "posts" collection.
 * @returns Array of post objects
 *
 * Post JSON structure:
 * {
 *   author: string,
 *   authorId: string,
 *   date: number | string,
 *   description: string,
 *   title: string,
 *   images: string[],
 *   postId: string,
 *   location: { latitude, longitude, latitudeDelta, longitudeDelta }
 * }
 */


/**
 * Gets all posts from the "posts" collection.
 * @returns Promise<PostDBInfo[]>
 */
export async function getAllPosts(): Promise<PostDBInfo[]> {
    const postsRef = collection(db, "posts");
    const postsSnap = await getDocs(postsRef);
    return postsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
            author: data.author,
            authorId: data.authorId,
            date: data.date,
            description: data.description,
            title: data.title,
            images_url_blob: data.images || [],
            postId: data.postId,
            location: data.location,
            tags: data.tags || [],
        } as PostDBInfo;
    });
}

/**
 * Gets a single post by postId.
 * @param postId string
 * @returns Post object or undefined
 *
 * Post JSON structure: see above
 */
export async function getPost(postId: string): Promise<PostDBInfo | undefined> {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    const data = postSnap.data();
    if (!data) return undefined;
    return {
        author: data.author,
        authorId: data.authorId,
        date: data.date,
        description: data.description,
        title: data.title,
        images_url_blob: data.images || [],
        postId: data.postId,
        location: data.location,
        tags: data.tags || [],
    } as PostDBInfo;
}

/**
 * Fetches an image from a given URL and returns it as a Blob.
 * Useful for downloading images stored in Azure Blob Storage or any public URL.
 * @param imageURL The URL of the image to fetch.
 * @returns A Blob representing the image data.
 */
export async function getImagesbyUrl(imageURL: string): Promise<Blob> {
    try {
        const response = await fetch(imageURL);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        const blob = await response.blob();
        return blob;
    } catch (error) {
        console.error("Error fetching image by URL:", error);
        throw error;
    }
}

/**
 * Gets all posts by a specific authorId.
 * @param authorId string
 * @returns Array of post objects
 *
 * Post JSON structure: see above
 */
export async function getPostbyAuthorID(authorId: string): Promise<PostDBInfo[]> { 
    const querySnapshot = await getDocs(query(collection(db, "posts"), where("authorId", "==", authorId)));
    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {            
            author: data.author,
            authorId: data.authorId,
            date: data.date,
            description: data.description,
            title: data.title,
            images_url_blob: data.images || [],
            postId: data.postId,
            location: data.location,
            tags: data.tags || [],
        } as PostDBInfo;
    });
}

export async function getPostbyTag(tag: string): Promise<PostDBInfo[]> {
    const querySnapshot = await getDocs(
        query(collection(db, "posts"), where("tags", "array-contains", tag))
    );
    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
            author: data.author,
            authorId: data.authorId,
            date: data.date,
            description: data.description,
            title: data.title,
            images_url_blob: data.images || [],
            postId: data.postId,
            location: data.location,
            tags: data.tags || [],
        } as PostDBInfo;
    });
}