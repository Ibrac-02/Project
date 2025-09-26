// Reuse the single Firebase initialization to avoid duplicate app errors
import { app, auth, db, storage } from "@/config/firebase";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

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
