
export const PHOTOS_AZURE_CONFIG = {
  STORAGE_ACCOUNT: 'photosandvideospolis',
  CONTAINER_NAME: 'post-images',
  SAS_TOKEN: process.env.AZURE_BLOB_URL_PROFILES,
  // Optional: CDN endpoint for faster image delivery
  // CDN_ENDPOINT: 'https://YOUR_CDN_ENDPOINT.azureedge.net',
};

export const PFP_AZURE_CONFIG = {
  STORAGE_ACCOUNT: 'photosandvideospolis',
  CONTAINER_NAME: 'profile-pics',
  SAS_TOKEN: process.env.AZURE_BLOB_URL_PHOTOS,
  // Optional: CDN endpoint for faster image delivery
  // CDN_ENDPOINT: 'https://YOUR_CDN_ENDPOINT.azureedge.net',
}