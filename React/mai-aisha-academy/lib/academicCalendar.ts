import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Interface for academic event data (before adding ID and createdByUserId)
export interface AcademicEventData {
  title: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  type: 'holiday' | 'exam' | 'school-event' | 'class-event' | 'meeting' | 'deadline' | 'other';
  audience: 'all' | 'admin' | 'headteacher' | 'teacher' | string; // string for classId
  classId?: string; // Optional, for class-specific events
  createdByUserId: string; // The user ID who created the event
}

// Interface for an Academic Event (after fetching from Firestore, includes ID)
export interface AcademicEvent extends AcademicEventData {
  id: string;
}

// Create an academic event
export const createAcademicEvent = async (eventData: AcademicEventData): Promise<AcademicEvent | null> => {
  try {
    const docRef = await addDoc(collection(db, 'academicEvents'), eventData);
    console.log("Document written with ID: ", docRef.id);
    return { id: docRef.id, ...eventData };
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
};

// Get academic events
export const getAcademicEvents = async (userId: string, userRole: string): Promise<AcademicEvent[]> => {
  try {
    const eventsQuery = query(collection(db, 'academicEvents'));
    const querySnapshot = await getDocs(eventsQuery);
    const events: AcademicEvent[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as AcademicEventData;
      // Implement role-based filtering for client-side display if needed, though security rules handle server-side
      // For now, client will get all events and display based on client-side logic.
      events.push({ id: doc.id, ...data });
    });
    return events;
  } catch (e) {
    console.error("Error getting documents: ", e);
    return [];
  }
};

// Update an academic event
export const updateAcademicEvent = async (eventId: string, eventData: Partial<AcademicEventData>): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'academicEvents', eventId);
    await updateDoc(eventRef, eventData);
    console.log("Document updated with ID: ", eventId);
    return true;
  } catch (e) {
    console.error("Error updating document: ", e);
    return false;
  }
};

// Delete an academic event
export const deleteAcademicEvent = async (eventId: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'academicEvents', eventId);
    await deleteDoc(eventRef);
    console.log("Document deleted with ID: ", eventId);
    return true;
  } catch (e) {
    console.error("Error deleting document: ", e);
    return false;
  }
};
