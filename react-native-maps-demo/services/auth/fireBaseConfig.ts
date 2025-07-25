import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";
import { getStorage, FirebaseStorage } from "firebase/storage";


// Firebase configuration using environme
// nt variables
const firebaseConfig = {
  apiKey: "AIzaSyACuvxKzbPv4fJbR9wyJmUOoAMNnQlFZA8",
  authDomain: "polis-ba392.firebaseapp.com",
  projectId: "polis-ba392",
  appId: "1:582373418945:web:5969561b5f9439d7457140"
};



// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Export the app instance
export default app;