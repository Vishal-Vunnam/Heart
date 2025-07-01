import { getFirestore } from 'firebase/firestore';
import { app } from './firebgi aseConfig';

export const db = getFirestore(app);

const postLocation = {
    latitude: 0,
    latitudeDelta: 0,
    longitude: 0,
    longitudeDelta: 0,
}

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
import { collection, addDoc } from 'firebase/firestore';

// Generates a unique postId using current timestamp and random string
function generateUniquePostId() {
    return `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export async function addPost(postInfo: any) {
    try {
        // Generate a unique postId for this post
        const uniquePostId = generateUniquePostId();
        const postWithId = {
            ...postInfo,
            postId: uniquePostId,
            likes: 0,
            comments: 0,
            views: 0,

        };
        const postRef = await addDoc(collection(db, "posts"), postWithId);
        return postRef;
    } catch (error) {
        console.error("Error adding post: ", error);
        throw error;
    }
}

import { getDocs, doc, getDoc } from 'firebase/firestore';

const postPopulate = {
    postId: "Post ID",
    location: postLocation,
};

export async function getAllPosts() {
    const postsRef = collection(db, "posts");
    const postsSnap = await getDocs(postsRef);
    // Only return postId and location for each post
    return postsSnap.docs.map((doc) => {
        const data = doc.data();
        return {
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