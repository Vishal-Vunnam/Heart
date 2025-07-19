const BASE_URL = "http://localhost:4000/api"; // Change to your backend URL
// Get all posts
export async function getAllPosts() {
  const res = await fetch(`${BASE_URL}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

// Create a new post
export async function createPost(postData: any) {
  console.log("adding post", postData)
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
  const data = await res.json();
  // Return only the posts array (post info)
  // This will throw if posts is empty or postInfo is undefined, so check first
  if (data.posts && data.posts.length > 0 && data.posts[0].postInfo) {
    console.log(data.posts[0].postInfo);
  } else {
    console.log("No posts or postInfo found in response:", data);
  }
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