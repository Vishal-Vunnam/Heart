const BASE_URL =  "http://10.0.0.53:4000/api";
// const BASE_URL =  "http://192.168.1.94:4000/api";

export async function getImageUrlWithSAS(url: string) {
    const res = await fetch(`${BASE_URL}/safeimage?url=${encodeURIComponent(url)}`);
    if (!res.ok) throw new Error("Failed to fetch safe image URL");
    return res.json();
}

/**
 * Upload an image to the backend and associate it with a post.
 * @param image The image data (uri or base64 string)
 * @param postId The ID of the post to associate the image with
 * @returns The backend response (uploaded image URL, etc.)
 */
export async function uploadImageToPost(image: string, postId: string) {
    const res = await fetch(`${BASE_URL}/image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, postId }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to upload image: ${errorText}`);
    }
    return res.json();
}


/**
 * Upload an image to the backend, meant for user creation.
 * @param image The image data (uri or base64 string)
 * @returns The backend response (uploaded image URL, etc.)
 */
export async function uploadImageForUser(image: string, uid: string) {
    console.log("Uploading image for user:",uid);
    const res = await fetch(`${BASE_URL}/image-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image, uid }),
    });
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to upload image: ${errorText}`);
    }
    return res.json();
}

