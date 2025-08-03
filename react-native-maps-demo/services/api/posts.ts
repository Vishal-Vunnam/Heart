// const BASE_URL =  "http://10.0.0.53:4000/api";
const BASE_URL =  "http://192.168.1.94:4000/api";
// Get all posts
export async function getAllPosts() {
  const res = await fetch(`${BASE_URL}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

// Create a new post
export async function createPost(postData: any, tags?: string[], allowedMembers?: string[]) {
  const body = {
    ...postData,
    tags: tags || [],
    invitees: allowedMembers || [],
  };
  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

// Add images to a post
export async function addImagesToPost(postId: string, userId: string, imageUris: string[]) {
  const res = await fetch(`${BASE_URL}/posts/images`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ postId, userId, imageUrls: imageUris }),
  });
  if (!res.ok) throw new Error("Failed to upload images");
  return res.json();
}

// Get posts by authorId
import { getCurrentUser } from '@/services/auth/fireAuth';

export async function getPostsByAuthorId(authorId: string) {
  // Get current user info (assume getCurrentUser returns a user object with uid)
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;

  // Send current user as a query param (if available)
  const url = new URL(`${BASE_URL}/posts/by-author`);
  url.searchParams.append('authorId', authorId);
  if (currentUserId) {
    url.searchParams.append('currentUserId', currentUserId);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch posts by authorId");
  const data = await res.json();
  return data;
}

export async function getPost(postId: string) {
    const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;
  const url = new URL(`${BASE_URL}/post/by-id`);
  url.searchParams.append('postId', postId);
  if(currentUserId) {
      url.searchParams.append('currentUserId', currentUserId); 
  }
  const res = await fetch(url.toString());
  if(!res.ok) throw new Error("Failed to fetch post by Id"); 
  const data = await res.json();
  return data; 
}

export async function getMarkerPostsByAuthorId(authorId: string){ 
    const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;

  // Send current user as a query param (if available)
  const url = new URL(`${BASE_URL}/markerposts/by-author`);
  url.searchParams.append('authorId', authorId);
  if (currentUserId) {
    url.searchParams.append('currentUserId', currentUserId);
  }

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch posts by authorId");
  const data = await res.json();
  return data;
}
// Get posts by tag
export async function getPostsByTag(tag: string) {
  const res = await fetch(`${BASE_URL}/posts/by-tag?tag=${encodeURIComponent(tag)}`);
  if (!res.ok) throw new Error("Failed to fetch posts by tag");
  return res.json();
}

export async function deletePostById(postId: string) {
    const res = await fetch(`${BASE_URL}/post?id=${encodeURIComponent(postId)}`, {
      method: "DELETE",
    });
}

export async function likePost(postId: string, userId: string) {
  console.log("Liking post:", postId, "by user:", userId);
  const url = `${BASE_URL}/like_post?postId=${encodeURIComponent(postId)}&userId=${encodeURIComponent(userId)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}