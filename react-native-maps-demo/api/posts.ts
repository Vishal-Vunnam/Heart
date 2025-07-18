const BASE_URL = "http://localhost:4000/api"; // Change to your backend URL

// Get all posts
export async function getAllPosts() {
  const res = await fetch(`${BASE_URL}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

// Create a new post
export async function createPost(postData: any) {
  const res = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(postData),
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
export async function getPostsByAuthorId(authorId: string) {
  const res = await fetch(`${BASE_URL}/posts/by-author?authorId=${encodeURIComponent(authorId)}`);
  if (!res.ok) throw new Error("Failed to fetch posts by authorId");
  return res.json();
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