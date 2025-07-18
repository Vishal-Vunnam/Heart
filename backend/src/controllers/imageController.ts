import { Router, Request, Response } from 'express';
import { getImageUrlWithSAS } from '../utils/blobStorage';

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

export default router;