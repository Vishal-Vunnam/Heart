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
  