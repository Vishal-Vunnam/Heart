// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics"; // Only available in browser environments

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyACuvxKzbPv4fJbR9wyJmUOoAMNnQlFZA8",
  authDomain: "polis-ba392.firebaseapp.com",
  projectId: "polis-ba392",
  storageBucket: "polis-ba392.appspot.com",
  messagingSenderId: "582373418945",
  appId: "1:582373418945:web:5969561b5f9439d7457140",
  measurementId: "G-FCVD39BTKJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Analytics is not supported in React Native (only web)
// const analytics = getAnalytics(app);

export { app };
export { auth };