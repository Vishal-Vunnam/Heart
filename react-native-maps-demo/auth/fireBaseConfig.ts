import { initializeApp, FirebaseApp, getApps } from "firebase/app";

// Firebase configuration (hardcoded for now, can be replaced with env vars if needed)
const firebaseConfig = {
  apiKey: "AIzaSyACuvxKzbPv4fJbR9wyJmUOoAMNnQlFZA8",
  authDomain: "polis-ba392.firebaseapp.com",
  projectId: "polis-ba392",
  appId: "1:582373418945:web:5969561b5f9439d7457140"
};

// Initialize Firebase only if it hasn't been initialized yet
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

export default app;