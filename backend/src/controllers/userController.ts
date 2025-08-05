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

router.put('/user', async (req: Request, res: Response) => {
  try { 
    const userInfo: UserInfo = req.body;

    // Validate required fields
    if (!userInfo || !userInfo.email) {
      return res.status(400).json({ success: false, error: 'Missing required user fields (email).' });
    }

    // Prepare SQL query to update user
    const query = `
      UPDATE users
      SET email = @param1,
          displayName = @param2,
          photoURL = @param3,
          updatedAt = GETDATE()
      WHERE id = @param0
    `;
    const params = [
      userInfo.uid,
      userInfo.email,
      userInfo.displayName || null,
      userInfo.photoURL || null
    ];

    try {
      await executeQuery(query, params);
      return res.status(200).json({ success: true, message: 'User updated successfully.' });
    } catch (dbError: any) {
      return res.status(500).json({ success: false, error: dbError.message || 'Database error.' });
    }

  }catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
    }

});
 
router.post('/add-friend', async (req: Request, res: Response) => { 

  try {
  const { followerId, followeeId } = req.body;
  if (!followeeId|| !followerId) {
    return res.status(400).json({ success: false, error: 'Missing required user/follower fields.' });
  }
  console.log("running")
   const query = `
   IF NOT EXISTS ( SELECT 1 FROM friendships WHERE follower_id = @param0 AND followee_id = @param1)
   INSERT INTO friendships (follower_id, followee_id)
   VALUES (@param0, @param1);
   `
   const params = [ 
    followerId, 
    followeeId
   ]

  try {
      await executeQuery(query, params);
      return res.status(200).json({ success: true, message: 'Friendship added.' });
    } catch (dbError: any) {
      return res.status(500).json({ success: false, error: dbError.message || 'Database error.' });
    }

  }catch (error: any) {
      res.status(500).json({ success: false, error: error.message || 'Internal server error.' });
    }

})

router.get('/friends', async (req: Request, res: Response) => { 
  try { 
    console.log("HERE")
    const currentUserId = req.query.currentUserId as string;

    if (!currentUserId) {
      return res.status(200).json({ success: true, friends: {} });
    }

    const query = `
      SELECT f.followee_id as followeeId, u.displayName AS followeeName
      FROM friendships f
      JOIN users u ON f.followee_id = u.id
      WHERE f.follower_id = @param0;
    `;
    const params = [currentUserId];

    const result = await executeQuery(query, params);

    return res.status(200).json({
      success: true,
      friends: result.recordset || []
    });

  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/is-friend', async (req: Request, res: Response) => {
  try {
    const currentUserId = req.query.currentUserId as string;
    const followeeId = req.query.followeeId as string;
    console.log("CHECKING", followeeId, currentUserId)

    if (!currentUserId || !followeeId) {
      return res.status(400).json({ success: false, error: "Missing currentUserId or followeeId" });
    }

    const query = `
      SELECT * FROM friendships
      WHERE follower_id = @param0 AND followee_id = @param1;
    `;
    const params = [currentUserId, followeeId];

    const result = await executeQuery(query, params);

    console.log(result.rowsAffected[0]>0);
    const isFriend = result.rowsAffected[0] > 0;

    return res.status(200).json({
      success: true,
      isFriend
    });

  } catch (error) {
    console.error('Error checking friendship:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.delete('/delete-friend', async (req: Request, res: Response) => {
  try { 
    const currentUserId = req.query.currentUserId as string;
    const followeeId = req.query.followeeId as string;
    const query = `
    DELETE FROM friendships 
    WHERE follower_id = @param0 AND followee_id = @param1;
    `
    const params = [ 
      currentUserId, 
      followeeId
    ]
    const result = await executeQuery(query, params);
    return res.status(200).json({
      success: true
    });
  } catch (error) { 
    console.error('Error deleting friendship:', error);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
})



export default router; 