import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  updateProfile, 
  User 
} from 'firebase/auth';
import app from '@/services/auth/fireBaseConfig';
import { createUser } from '@/services/api/user';

const auth = getAuth(app);

export async function signIn(email: string, password: string) {
  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    // Call backend to ensure user exists in DB (ignore errors for sign-in)
    try {
      await createUser({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || undefined,
        photoURL: user.photoURL || undefined,
      });
    } catch (e) {
      // It's okay if user already exists or backend fails here
    }
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
    await user.reload();
    // Always wait for updateProfile to complete before returning, even if no update is needed
    if (displayName || photoURL) {
      await updateProfile(user, { 
        displayName: displayName || undefined, 
        photoURL: photoURL || undefined 
      });
      await user.reload();
    } else {
      // If no update needed, still wait for the user to be fully initialized
      // This is a no-op, but ensures consistent async flow
      await Promise.resolve();
    }

    // At this point, updateProfile (if needed) has completed
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message || "Sign-up failed." };
  }
}

export async function updateUserProfile(userInfo: { displayName: string | null; photoURL: string | null }): Promise<{ success: boolean; user?: User; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "No user is currently signed in." };
  }
  try {
    await updateProfile(user, {
      displayName: userInfo.displayName || undefined,
      photoURL: userInfo.photoURL || undefined,
    });
    await user.reload();
    return { success: true, user };
  } catch (error: any) {
    return { success: false, error: error.message || "Profile update failed." };
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
