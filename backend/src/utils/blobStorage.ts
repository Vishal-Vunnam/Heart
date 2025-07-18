import { PHOTOS_AZURE_CONFIG } from "../config/azure-config";

export async function uploadToAzureBlob(
  fileUri: string,
  blobName: string,
  containerName: 'post-images' | 'profile-pics'
): Promise<string> {
  const { STORAGE_ACCOUNT, SAS_TOKEN } = PHOTOS_AZURE_CONFIG;
  const blobUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${containerName}/${blobName}?${SAS_TOKEN}`;
  console.log('[uploadToAzureBlob] blobUrl:', blobUrl);
  try {
    // Fetch the file as a blob/binary
    console.log('[uploadToAzureBlob] Fetching fileUri:', fileUri);
    const response = await fetch(fileUri);
    if (!response.ok) {
      console.error('[uploadToAzureBlob] Failed to fetch fileUri:', fileUri, 'Status:', response.status, response.statusText);
      throw new Error(`Failed to fetch fileUri: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    console.log('[uploadToAzureBlob] Blob created, type:', blob.type, 'size:', blob.size);

    // Upload to Azure Blob Storage
    console.log('[uploadToAzureBlob] Uploading to Azure:', blobUrl);
    const uploadResponse = await fetch(blobUrl, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': blob.type || 'application/octet-stream',
      },
      body: blob,
    });
    console.log('[uploadToAzureBlob] Azure upload response status:', uploadResponse.status, uploadResponse.statusText);
    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('[uploadToAzureBlob] Upload failed:', uploadResponse.status, uploadResponse.statusText, errorText);
      throw new Error(`Upload failed: ${uploadResponse.statusText} ${errorText}`);
    }

    // Return the public URL (if container is public or via SAS)
    const publicUrl = `https://${STORAGE_ACCOUNT}.blob.core.windows.net/${containerName}/${blobName}`;
    console.log('[uploadToAzureBlob] Upload successful, publicUrl:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('[uploadToAzureBlob] Error:', error);
    throw error;
  }
}
export async function deleteFromAzureBlob(blobUrl: string): Promise<string> {
  try {
    // Append SAS token if not present
    const urlWithSAS = getImageUrlWithSAS(blobUrl);
    const response = await fetch(urlWithSAS, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to delete blob: ${response.status} ${response.statusText} ${errorText}`);
    }
    return "Blob deleted successfully";
  } catch (error) {
    console.error('[deleteFromAzureBlob] Error:', error);
    throw error;
  }
}

export function getImageUrlWithSAS(blobUrl: string): string {
  const { SAS_TOKEN } = PHOTOS_AZURE_CONFIG;
  if (SAS_TOKEN) {
    return blobUrl.includes('?')
      ? blobUrl
      : `${blobUrl}${SAS_TOKEN.startsWith('?') ? SAS_TOKEN : '?' + SAS_TOKEN}`;
  }
  return blobUrl;
}

/**
 * Fetches an image from Azure Blob Storage by URL, appending SAS token if needed.
 * @param blobUrl The Azure Blob URL (with or without SAS token)
 * @returns A Blob representing the image data
 */
export async function getImageFromBlobUrl(blobUrl: string): Promise<Blob> {
  const urlWithSAS = getImageUrlWithSAS(blobUrl);
  try {
    const response = await fetch(urlWithSAS);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from Azure Blob: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('[getImageFromBlobUrl] Error fetching image:', error);
    throw error;
  }
}
