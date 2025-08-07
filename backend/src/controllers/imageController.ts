import { Router, Request, Response } from 'express';
import { deleteFromAzureBlob, getImageUrlWithSAS, uploadToAzureBlob } from '../utils/blobStorage';
import { v4 as uuidv4 } from 'uuid';
import { executeQuery } from '../utils/dbUtils';
import { Buffer } from 'buffer'; // Node.js built-in
const router = Router();

/**
 * GET /safeimage
 * Returns the image URL with SAS token appended (if needed).
 * Expects a query parameter: url (the original blob URL)
 */
router.get('/safeimage', (req: Request, res: Response) => {
  const { url } = req.query;
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid url query parameter' });
  }
  try {
    const safeUrl = getImageUrlWithSAS(url);
    return res.json({ url: safeUrl });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to generate safe image URL' });
  }
});

router.post('/image', async (req: Request, res: Response) => {
  try {
    const { image, postId } = req.body;

    if (!image || !postId) {
      return res.status(400).json({ error: 'Missing image or postId in request body' });
    }

    // If image is a base64 string, decode it
    // Remove data URL prefix if present
    // const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    // const imageBuffer = Buffer.from(base64Data, 'base64');

    // Generate a unique ID for the image
    const imageId = uuidv4();
    const blobName = `${postId}_${Date.now()}`;

    // Pass the buffer to your Azure upload function
    const imageUrl = await uploadToAzureBlob(image, blobName, 'post-images');

    const insertImageQuery = `
      INSERT INTO images (id, postId, imageUrl)
      VALUES (@param0, @param1, @param2)
    `;
    await executeQuery(insertImageQuery, [imageId, postId, imageUrl]);

    return res.status(201).json({ message: 'Image uploaded successfully', url: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
});

router.post('/images', async (req: Request, res: Response) => { 
  try { 
    const { images, postId } = req.body; 
    if (!images || !postId) {
      return res.status(400).json({ error: 'Missing image or postId in request body' });
    }
    const imageUrls: string[] = []; 
    const imageIds: string[] = [];

    for (const image of images) {
      const imageId = uuidv4();
      const blobName = `${postId}_${Date.now()}`;
      const imageUrl = await uploadToAzureBlob(image, blobName, 'post-images');
      imageUrls.push(imageUrl);
      imageIds.push(imageId);
    }
    // Insert all images into the database
    const numberOfImageParams = imageIds.length * 2-1; 
    const insertImageQuery = `
      INSERT INTO images (id, imageUrl, postId)
      VALUES ${imageIds.map((id, index) => `(@param${index * 2}, @param${index * 2 + 1}, @param${numberOfImageParams+1})`).join(', ')}
    `;
    
    const params = [];
    for (let i = 0; i < imageIds.length; i++) {
      params.push(imageIds[i], imageUrls[i]);
    }
    params.push(postId);
    await executeQuery(insertImageQuery, params);
    
    return res.status(201).json({ message: 'Images uploaded successfully', urls: imageUrls });
  } catch (error) {
    console.error('Error uploading images:', error);
    return res.status(500).json({ error: 'Failed to upload images' });
  }


})

router.post('/image-user', async (req: Request, res: Response) => {
  try {
    const image = req.body.image as string; 
    const username = req.body.uid as string; 
    // Pass the buffer to your Azure upload function      
    if (!image) {
      return res.status(400).json({ error: 'Missing image or postId in request body' });
    }
    const blobName = `${username}_${Date.now()}`;
    const imageUrl = await uploadToAzureBlob(image, blobName, 'profile-pics');
    console.log("Did we get here? ", imageUrl); 
    return res.status(201).json({ message: 'Image uploaded successfully', url: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
})

type ImageType = { 
  imageId: string, 
  imageUrl : string
}

router.delete('/delete-images', async (req: Request, res: Response) => {
  try {
    const images = req.body.images as ImageType[];
    
    if (!images || images.length === 0) {
      return res.status(200).json({ message: 'No images to delete' });
    }

    // Delete from Azure Blob Storage
    for (const image of images) {
      try {
        if (image.imageUrl) {
          await deleteFromAzureBlob(image.imageUrl);
        }
      } catch (blobError) {
        console.error(`Failed to delete blob for image ${image.imageId}:`, blobError);
        // Continue with other deletions even if one fails
      }
    }

    // Extract image IDs for database deletion
    const imageIds = images.map(image => image.imageId);
    console.log("IMAGE IDS TO DELETE:", imageIds);

    // Create dynamic query with individual parameters for each ID
    const placeholders = imageIds.map((_, index) => `@param${index}`).join(', ');
    const deleteQuery = `
      DELETE FROM images 
      WHERE id IN (${placeholders})
    `;

    console.log("DELETE QUERY:", deleteQuery);
    console.log("PARAMS:", imageIds);

    const result = await executeQuery(deleteQuery, imageIds);

    return res.status(200).json({
      message: 'Images deleted successfully',
      deletedCount: result.rowsAffected ? result.rowsAffected[0] : 0
    });

  } catch (error) {
    console.error('Error deleting images:', error);
    return res.status(500).json({
      error: 'Internal server error while deleting images'
    });
  }
});

export default router;