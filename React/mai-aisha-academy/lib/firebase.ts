import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCbj7hPB9CHouCoNjo2DORPvKoSUFLieVY",
  authDomain: "mai-aisha-academy-imis.firebaseapp.com",
  projectId: "mai-aisha-academy-imis",
  storageBucket: "mai-aisha-academy-imis.firebasestorage.app",
  messagingSenderId: "935579351205",
  appId: "1:935579351205:web:c6eadf37ace7543d42354c"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
