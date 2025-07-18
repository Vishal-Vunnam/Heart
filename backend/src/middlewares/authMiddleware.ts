import express, { Request, Response, NextFunction } from 'express';
import admin from '../config/firebaseAdmin';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile 
} from 'firebase/auth';
import app from '../config/firebaseConfig';

const router = express.Router();
const auth = getAuth(app);

const JWT_SECRET = process.env.JWT_SECRET

// POST /api/auth/signin
router.post('/signin', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // You may want to return a custom token or user info here
    res.status(200).json({ success: true, user });
  } catch (error: any) {
    res.status(401).json({ success: false, error: error.message || "Sign-in failed." });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  const { email, password, displayName, photoURL } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: "Email and password are required." });
  }
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update display name and photoURL if provided
    if (displayName || photoURL) {
      await updateProfile(user, { 
        displayName: displayName || undefined, 
        photoURL: photoURL || undefined 
      });
    }
    res.status(201).json({ success: true, user });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message || "Sign-up failed." });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req: Request, res: Response) => {
  try {
    await signOut(auth);
    res.status(200).json({ success: true, message: "Signed out successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || "Sign-out failed." });
  }
});

// GET /api/auth/current-user
router.get('/current-user', (req: Request, res: Response) => {
  const unsubscribe = auth.onAuthStateChanged(
    (user) => {
      unsubscribe();
      res.status(200).json({ success: true, user });
    },
    (error) => {
      unsubscribe();
      res.status(500).json({ success: false, error: error.message || "Failed to get current user." });
    }
  );
});

// Extend Express Request type to include 'user'
declare module 'express-serve-static-core' {
  interface Request {
    user?: admin.auth.DecodedIdToken;
  }
}

export async function firebaseAuthMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const idToken = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

export default router;