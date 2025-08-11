// const BASE_URL =  "http://10.0.0.53:4000/api";
const BASE_URL =  "http://192.168.1.94:4000/api";
// Get all posts
import { PostInfo } from '@/types/types';
export async function getAllPosts() {
  const res = await fetch(`${BASE_URL}/posts`);
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

// Create a new post
export async function createPost(postData: any, tag?: string, allowedMembers?: string[]) {
  const body = {
    ...postData,
    tag: tag || null,
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

// Edit an existing post
export async function editPost(
  postInfo: any,
  tags?: string[],
  allowedMembers?: string[],
) {
  console.log(postInfo);
  console.log("here?")
    const body = {
      postInfo,
      ...(tags && { tags }),
      ...(allowedMembers && { allowedMembers }),
    };

  const res = await fetch(`${BASE_URL}/edit-post`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    console.log(res);
    throw new Error("Failed to edit post");
  }

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
  console.log("Fetching marker posts by authorId:", authorId, "for user:", currentUserId);
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
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;

  const url = new URL(`${BASE_URL}/posts/by-tag`);
  url.searchParams.append('tag', tag);
  if (currentUserId) {
    url.searchParams.append('currentUserId', currentUserId);
  }
  console.log("Fetching posts by tag:", url.toString());
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch posts by tag");
  return res.json();
}

export async function getMarkerPostsByTag(tag: string){ 
  const url = new URL(`${BASE_URL}/markerposts/by-tag`);
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;
   url.searchParams.append('tag', tag);

  if (currentUserId) {
    url.searchParams.append('currentUserId', currentUserId);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Failed to fetch marker posts by tag");
  return res.json();
}

export async function deletePostById(postId: string) {
    const res = await fetch(`${BASE_URL}/post?id=${encodeURIComponent(postId)}`, {
      method: "DELETE",
    });
}


export async function getExplore(limit: number, offset: number) {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;
  const url = `${BASE_URL}/explore?limit=${limit.toString()}&offset=${offset.toString()}&currentUserId=${currentUserId}`;

  const res = await fetch(url, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to fetch explore posts: ${errText}`);
  }

  const data = await res.json();
  return data.posts;
}


export async function likePost(postId: string) {
    const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;
  if (!currentUserId) {
    throw new Error("User not authenticated");
  }

  console.log("Liking post:", postId, "by user:", currentUserId);
  const url = `${BASE_URL}/like_post?postId=${encodeURIComponent(postId)}&userId=${encodeURIComponent(currentUserId)}`;
  const res = await fetch(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to like post");
  return res.json();
}

export async function unlikePost(postId: string) {
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.uid;
  if (!currentUserId) {
    throw new Error("User not authenticated");
  }

  const url = `${BASE_URL}/unlike_post?postId=${encodeURIComponent(postId)}&userId=${encodeURIComponent(currentUserId)}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    console.log('Raw response:', data);


    if (!response.ok) {
      throw new Error(data.error || 'Failed to unlike post');
    }

    return data; // { success: true, message: "Post liked successfully" }
  } catch (error: any) {
    console.error('Error in unlikePost:', error);
    throw error;
  }
}
