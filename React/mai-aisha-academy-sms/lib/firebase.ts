import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

// Reuse the environment-driven Firebase config from config/firebase.ts
import { app as cfgApp, auth as cfgAuth, db as cfgDb, storage as cfgStorage } from '@/config/firebase';

const app = cfgApp;
const auth = cfgAuth;
const db = cfgDb;
const storage = cfgStorage;

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
