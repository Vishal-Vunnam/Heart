import { Router, Request, Response } from 'express';
import { getImageUrlWithSAS, uploadToAzureBlob } from '../utils/blobStorage';
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

router.post('/image-user', async (req: Request, res: Response) => {
  try {
    const image = req.body.image as string; 
    const username = req.body.uid as string; 
    // Pass the buffer to your Azure upload function      
    if (!image) {
      return res.status(400).json({ error: 'Missing image or postId in request body' });
    }
    const blobName = `${username}_${Date.now()}`;
    console.log(blobName);
    const imageUrl = await uploadToAzureBlob(image, blobName, 'profile-pics');
    console.log("Image URL:", imageUrl);
    return res.status(201).json({ message: 'Image uploaded successfully', url: imageUrl });
  } catch (error) {
    console.error('Error uploading image:', error);
    return res.status(500).json({ error: 'Failed to upload image' });
  }
})
export default router;