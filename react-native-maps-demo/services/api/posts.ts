const BASE_URL = "http://localhost:4000/api"; // Change to your backend URL
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