import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { app } from './firebaseConfig';

const auth = getAuth(app);

// Sign In
export function signIn(email: string, password: string) {
  console.log("Signing in with email:", email);
  return signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Signed in user:", user);
      return user;
    })
    .catch((error) => {
      console.error("Sign-in error:", error);
      throw error;
    });
}

// No, you do not need this. The updateProfile function is already provided by Firebase Auth and should be imported directly where needed.

// Sign Up
export function signUp(email: string, password: string) {
  console.log("Signing up with email:", email);
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log("Signed up user:", user);
      return user;
    })
    .catch((error) => {
      console.error("Sign-up error:", error);
      throw error;
    });
}

// Sign Out
export function logOut() {
  return signOut(auth);
}
