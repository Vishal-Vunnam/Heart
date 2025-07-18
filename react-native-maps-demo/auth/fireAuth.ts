import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User 
} from 'firebase/auth';
import app from '@/auth/fireBaseConfig';

const auth = getAuth(app);

export async function signIn(email: string, password: string) {
  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message || "Sign-in failed." };
  }
}

export async function signUp(email: string, password: string, displayName?: string, photoURL?: string) {
  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
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
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message || "Sign-up failed." };
  }
}

export async function logout() {
  try {
    await signOut(auth);
    return { success: true, message: "Signed out successfully." };
  } catch (error: any) {
    return { success: false, error: error.message || "Sign-out failed." };
  }
}

export function getCurrentUser(): User | null {
  return auth.currentUser;
}
