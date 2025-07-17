import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    updateProfile
  } from 'firebase/auth';
  import app from '../config/firebaseConfig';
  
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
  export function signUp(email: string, password: string, displayName: string, photoURL: string) {
    console.log("Signing up with email:", email);
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log("Signed up user:", user);
  
        // Update display name and photoURL if provided
        if (displayName || photoURL) {
          return updateProfile(user, { 
            displayName: displayName || undefined, 
            photoURL: photoURL || undefined 
          })
          .then(() => {
            console.log("Display name and/or photoURL updated:", displayName, photoURL);
            return user;
          });
        }
        console.log("final account info", user);
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
  
  export function getCurrentUser() {
    return new Promise((resolve, reject) => {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        unsubscribe();
        resolve(user);
      }, reject);
    });
  }
  