import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCiZwJ77MBagjsU2Cr9bF6Iknw76gF8IdI",
  authDomain: "mai-aisha-academy-2a0p0p7.firebaseapp.com",
  projectId: "mai-aisha-academy-2a0p0p7",
  storageBucket: "mai-aisha-academy-2a0p0p7.firebasestorage.app",
  messagingSenderId: "398351884289",
  appId: "1:398351884289:android:c2fb3f6b7d0ca1adef2000"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 