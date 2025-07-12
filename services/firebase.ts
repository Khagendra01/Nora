import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
// Use environment variables for security
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Check if Firebase is properly configured
if (!firebaseConfig.apiKey || firebaseConfig.apiKey === "your_api_key_here") {
  console.warn("⚠️ Firebase not configured! Please set the environment variables:");
  console.warn("EXPO_PUBLIC_FIREBASE_API_KEY");
  console.warn("EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN");
  console.warn("EXPO_PUBLIC_FIREBASE_PROJECT_ID");
  console.warn("EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET");
  console.warn("EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID");
  console.warn("EXPO_PUBLIC_FIREBASE_APP_ID");
  console.warn("EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID");
  console.warn("Get your Firebase config from: https://console.firebase.google.com/");
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app); 