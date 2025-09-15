import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";

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
const storage = getStorage(app);

interface UploadResult {
  downloadUrl: string;
  filePath: string;
}

async function uploadDocument(fileUri: string, storagePath: string): Promise<UploadResult> {
  try {
    const response = await fetch(fileUri);
    const blob = await response.blob();

    const storageRef = ref(storage, storagePath);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadUrl = await getDownloadURL(snapshot.ref);

    return {
      downloadUrl,
      filePath: storagePath,
    };
  } catch (error) {
    console.error("Error uploading document:", error);
    throw error;
  }
}

export { app, auth, db, uploadDocument };
