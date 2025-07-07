import { getFirestore } from 'firebase/firestore';
import { app } from './firebaseConfig';
import { getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { collection, addDoc } from 'firebase/firestore';
import { uploadToAzureBlob } from './blob-storage';
import type { PostRequestInfo, UserInfo } from '@/types';

export const db = getFirestore(app);

const postLocation = {
    latitude: 0,
    latitudeDelta: 0,
    longitude: 0,
    longitudeDelta: 0,
}
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
    // tags: ["Tag 1", "Tag 2", "Tag 3"],
}

// Generates a unique postId using current timestamp and random string
function generateUniquePostId() {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}


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

// [{"author": "Test", "authorId": "test", "comments": 0, "date": "2025-07-04T00:45:48.862Z", "description": "This is a test", "images": ["Image 1", "Image 2", "Image 3"], "likes": 0, "location": {"latitude": 37.4219999, "latitudeDelta": 0.01, "longitude": -122.0840575, "longitudeDelta": 0.01}, "postId": "post_1751589948869_qz19bdexu", "tags": ["Tag 1", "Tag 2", "Tag 3"], "title": "Test", "views": 0, "visibility": "Public"}]

export async function getAllPosts() {
    const postsRef = collection(db, "posts");
    const postsSnap = await getDocs(postsRef);
    // Only return postId and location for each post
    return postsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
            author: data.author,
            authorId: data.authorId,
            date: data.date,
            description: data.description,
            title: data.title,
            images: data.images || [],
            postId: data.postId,
            location: data.location,
        };
    });
}

export async function getPost(postId: string) {
    const postRef = doc(db, "posts", postId);
    const postSnap = await getDoc(postRef);
    return postSnap.data();
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

export async function getPostbyAuthorID(authorId: string) { 
    const querySnapshot = await getDocs(query(collection(db, "posts"), where("authorId", "==", authorId)));
    return querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {            
            author: data.author,
            authorId: data.authorId,
            date: data.date,
            description: data.description,
            title: data.title,
            images: data.images || [],
            postId: data.postId,
            location: data.location,
        };
    });
}