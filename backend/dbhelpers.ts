/**
 * Given an image string (e.g., a filename or blob reference), returns the full image URI.
 * This is a helper for rendering images in the app.
 * 
 * @param imageString - The image identifier (e.g., filename or blob path)
 * @returns The full image URI (string)
 */
export function getImageUrlWithSAS(imageString: string): string {
  // For now, just return the string as a URI if it's already a URL.
  // In production, you might append a SAS token or build a full URL.
  if (!imageString) return '';
  if (imageString.startsWith('http')) {
    return imageString;
  }
  // Example: prepend your storage base URL here if needed
  // return `https://your-storage-account.blob.core.windows.net/images/${imageString}`;
  return imageString;
}
