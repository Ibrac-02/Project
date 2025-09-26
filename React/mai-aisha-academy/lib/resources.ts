import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { deleteObject, getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import { db } from './firebase';
import { UploadedDocument } from './types'; // Assuming you have an interface for UploadedDocument

// Create a new resource
export const createResource = async (
  uploaderId: string,
  fileUri: string,
  fileName: string,
  description: string,
  onProgress: (progress: number) => void
): Promise<UploadedDocument | null> => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `resources/${uploaderId}/${fileName}_${Date.now()}`);

    const response = await fetch(fileUri);
    const blob = await response.blob();

    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
          onProgress(progress);
        },
        (error) => {
          console.error("Upload failed:", error);
          reject(new Error("File upload failed."));
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          const resourceData = {
            uploaderId,
            fileName,
            description,
            fileType: blob.type || 'unknown',
            fileSize: blob.size,
            downloadUrl,
            storagePath: storageRef.fullPath,
            uploadedAt: new Date().toISOString(),
          };
          const docRef = await addDoc(collection(db, 'resources'), resourceData);
          resolve({ id: docRef.id, ...resourceData });
        }
      );
    });
  } catch (error: any) {
    console.error("Error creating resource:", error);
    throw new Error(error.message);
  }
};

// Get resources for a specific uploader
export const getResources = async (uploaderId: string): Promise<UploadedDocument[]> => {
  try {
    const q = query(collection(db, 'resources'), where('uploaderId', '==', uploaderId));
    const querySnapshot = await getDocs(q);
    const resources: UploadedDocument[] = [];
    querySnapshot.forEach(doc => {
      resources.push({ id: doc.id, ...doc.data() } as UploadedDocument);
    });
    return resources.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  } catch (error: any) {
    console.error("Error fetching resources:", error);
    throw new Error(error.message);
  }
};

// Update an existing resource (e.g., update description or replace file)
export const updateResource = async (
  resourceId: string,
  uploaderId: string,
  newFileUri: string | null,
  newFileName: string,
  newDescription: string,
  onProgress: (progress: number) => void
): Promise<UploadedDocument | null> => {
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    const updates: Partial<UploadedDocument> = { fileName: newFileName, description: newDescription };

    if (newFileUri) {
      // If a new file is provided, upload it and update the downloadUrl and storagePath
      const storage = getStorage();
      const oldResourceDoc = (await getDocs(query(collection(db, 'resources'), where('__name__', '==', resourceId)))).docs[0];
      if (oldResourceDoc && oldResourceDoc.data().storagePath) {
        const oldStorageRef = ref(storage, oldResourceDoc.data().storagePath);
        await deleteObject(oldStorageRef); // Delete old file from storage
      }

      const newStorageRef = ref(storage, `resources/${uploaderId}/${newFileName}_${Date.now()}`);
      const response = await fetch(newFileUri);
      const blob = await response.blob();

      const uploadTask = uploadBytesResumable(newStorageRef, blob);
      await new Promise<void>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes);
            onProgress(progress);
          },
          (error) => {
            console.error("File replacement upload failed:", error);
            reject(new Error("File replacement upload failed."));
          },
          async () => {
            updates.downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            updates.storagePath = newStorageRef.fullPath;
            updates.fileType = blob.type || 'unknown';
            updates.fileSize = blob.size;
            resolve();
          }
        );
      });
    }

    updates.uploadedAt = new Date().toISOString();
    await updateDoc(resourceRef, updates);

    const updatedDoc = { id: resourceId, ...updates } as UploadedDocument;
    return updatedDoc; // Return the updated document
  } catch (error: any) {
    console.error("Error updating resource:", error);
    throw new Error(error.message);
  }
};

// Delete a resource
export const deleteResource = async (resourceId: string): Promise<void> => {
  try {
    const resourceRef = doc(db, 'resources', resourceId);
    const resourceDoc = (await getDocs(query(collection(db, 'resources'), where('__name__', '==', resourceId)))).docs[0];

    if (resourceDoc && resourceDoc.data().storagePath) {
      const storage = getStorage();
      const storageRef = ref(storage, resourceDoc.data().storagePath);
      await deleteObject(storageRef); // Delete file from storage
    }

    await deleteDoc(resourceRef);
  } catch (error: any) {
    console.error("Error deleting resource:", error);
    throw new Error(error.message);
  }
};

