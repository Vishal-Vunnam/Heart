import { Router, Request, Response } from 'express';
import { UserInfo } from '../types/types';
import { executeQuery } from '../utils/dbUtils';
const router = Router();

router.post('/user', async (req: Request, res: Response) => {
  try {
    const userInfo: UserInfo = req.body;
    // TODO: Implement user creation logic here

    // Validate required fields
    if (!userInfo || !userInfo.uid || !userInfo.email) {
      return res.status(400).json({ success: false, error: 'Missing required user fields (id, email).' });
    }

    // Prepare SQL query to insert user
    const query = `
      IF NOT EXISTS (SELECT 1 FROM users WHERE id = @param0)
      BEGIN
        INSERT INTO users (id, email, displayName, photoURL, createdAt, updatedAt)
        VALUES (@param0, @param1, @param2, @param3, GETDATE(), GETDATE())
      END
    `;
    const params = [
      userInfo.uid,
      userInfo.email,
      userInfo.displayName || null,
      userInfo.photoURL || null
    ];

    // Import executeQuery at the top if not already
    // import { executeQuery } from '../utils/dbUtils';

    try {
      await require('../utils/dbUtils').executeQuery(query, params);
      return res.status(201).json({ success: true, message: 'User created or already exists.' });
    } catch (dbError: any) {
      return res.status(500).json({ success: false, error: dbError.message || 'Database error.' });
    }
    res.status(501).json({ success: false, message: 'Not implemented yet.' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
  }
});


export default router; 