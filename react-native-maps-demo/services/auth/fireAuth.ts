import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  User ,
  updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider
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
export async function updateUserProfile(
  userInfo: { 
    displayName?: string | null; 
    photoURL?: string | null;
    email?: string;
    password?: string;
  },
  currentPassword?: string
): Promise<{ success: boolean; user?: User; error?: string }> {
  const user = auth.currentUser;
  if (!user) {
    return { success: false, error: "No user is currently signed in." };
  }

  try {
    // If updating email or password, re-authenticate first
    if ((userInfo.email || userInfo.password) && currentPassword && user.email) {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
    }

    // Update profile (displayName, photoURL)
    const profileUpdate: { displayName?: string; photoURL?: string } = {};
    if (userInfo.displayName !== undefined) profileUpdate.displayName = userInfo.displayName || '';
    if (userInfo.photoURL !== undefined) profileUpdate.photoURL = userInfo.photoURL || '';
    
    if (Object.keys(profileUpdate).length > 0) {
      await updateProfile(user, profileUpdate);
    }

    // Update email if provided
    if (userInfo.email && user.email !== userInfo.email) {
      await updateEmail(user, userInfo.email);
    }

    // Update password if provided
    if (userInfo.password) {
      await updatePassword(user, userInfo.password);
    }

    await user.reload();
    return { success: true, user };
    
  } catch (error: any) {
    console.error('User update error:', error);
    
    if (error.code === 'auth/requires-recent-login') {
      return { success: false, error: "Please log in again to make this change." };
    }
    if (error.code === 'auth/email-already-in-use') {
      return { success: false, error: "This email is already in use." };
    }
    if (error.code === 'auth/weak-password') {
      return { success: false, error: "Password is too weak." };
    }
    
    return { success: false, error: error.message || "Update failed." };
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
