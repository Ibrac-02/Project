// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore"; 
import { getStorage } from "firebase/storage";
import { Platform } from 'react-native';

// Your web app's Firebase configuration using Expo public env vars
// Ensure you start the app with these environment variables defined (prefix EXPO_PUBLIC_)
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID as string,
  //resetContinueUrl: process.env.EXPO_PUBLIC_FIREBASE_RESET_CONTINUE_URL as string,
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  if (Platform.OS === 'web') {
    auth = getAuth(app);
  } else {
    // For React Native, Firebase Auth will automatically use AsyncStorage if available
    // We just need to make sure AsyncStorage is imported and available
    auth = getAuth(app);
  }
} catch {
  // If auth is already initialized, get the existing instance
  auth = getAuth(app);
}

export { auth };
export const storage = getStorage(app);
