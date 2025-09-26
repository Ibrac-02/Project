import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface DocumentMetadata {
  uploaderId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  storagePath: string;
}

/**
 * Save uploaded document metadata to Firestore
 */
export async function saveDocumentMetadata(metadata: DocumentMetadata) {
  try {
    const docRef = await addDoc(collection(db, 'documents'), {
      ...metadata,
      createdAt: serverTimestamp(),
    });
    console.log('Document metadata saved with ID:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error saving document metadata:', error);
    throw error;
  }
}
