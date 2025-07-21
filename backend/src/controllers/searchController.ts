import { Router, Request, Response } from 'express';
import { uploadToAzureBlob, deleteFromAzureBlob } from '../utils/blobStorage';
import type { PostInfo, EventInfo, UserInfo, PolisType } from '../types/types';
import { executeQuery } from '../utils/dbUtils';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.get('/user-search', async (req: Request, res: Response) => {
    try {
      const search = req.query.searchTerm as string;
      if (!search || search.trim() === '') {
        return res.status(400).json({ error: 'searchTerm is required' });
      }
  
      // Use CONTAINS with prefix search: "search*"
      const query = `
        SELECT TOP 5 displayName, id 
        FROM users 
        WHERE CONTAINS(displayName, @param0)
      `;
      const params = [`"${search}*"`]; // Quotes + wildcard for prefix match
  
      const result = await executeQuery(query, params);
      const users = result.recordset || [];
      return res.json(users);
    } catch (error) {
      console.error('Error in /user-search:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // This endpoint searches both users (by displayName) and tags (by tag name).
  router.get('/user-tag-search', async (req: Request, res: Response) => {
    try {
      const search = req.query.searchTerm as string;
      if (!search || search.trim() === '') {
        return res.status(400).json({ error: 'searchTerm is required' });
      }

      // Search users by displayName
      const userQuery = `
        SELECT TOP 5 displayName AS name, id, CAST(0 AS BIT) AS is_tag
        FROM users
        WHERE CONTAINS(displayName, @param0)
      `;
      // Search tags by tag name (assuming you have a 'tags' table with 'name' and 'id')
      const tagQuery = `
        SELECT TOP 5 name, id, CAST(1 AS BIT) AS is_tag
        FROM tags
        WHERE CONTAINS(name, @param0)
      `;

      const params = [`"${search}*"`];

      // Run both queries in parallel
      const [userResult, tagResult] = await Promise.all([
        executeQuery(userQuery, params),
        executeQuery(tagQuery, params)
      ]);

      const users = userResult.recordset || [];
      const tags = tagResult.recordset || [];

      // Combine and return, shuffled randomly
      const combined = [...users, ...tags];
      // Fisher-Yates shuffle for random order
      for (let i = combined.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [combined[i], combined[j]] = [combined[j], combined[i]];
      }

      return res.json(combined);
    } catch (error) {
      console.error('Error in /user-tag-search:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  export default router; 