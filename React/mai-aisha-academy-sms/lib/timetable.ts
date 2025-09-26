import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { TimetableEntry } from './types';

export interface TimetableEntryData {
  academicYearId: string;
  termId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: TimetableEntry['dayOfWeek'];
  startTime: string;
  endTime: string;
  roomLocation: string;
}

// Create a new timetable entry
export const createTimetableEntry = async (data: TimetableEntryData): Promise<TimetableEntry> => {
  try {
    const now = new Date().toISOString();
    const docRef = await addDoc(collection(db, 'timetable'), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, ...data, createdAt: now, updatedAt: now };
  } catch (error: any) {
    console.error("Error creating timetable entry:", error);
    throw new Error('Failed to create timetable entry: ' + error.message);
  }
};

// Get all timetable entries
export const getAllTimetableEntries = async (): Promise<TimetableEntry[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'timetable'));
    const entries: TimetableEntry[] = [];
    querySnapshot.forEach(doc => {
      entries.push({ id: doc.id, ...doc.data() } as TimetableEntry);
    });
    return entries.sort((a, b) => {
      // Sort by dayOfWeek (e.g., Monday-Sunday), then by startTime
      const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayA = daysOrder.indexOf(a.dayOfWeek);
      const dayB = daysOrder.indexOf(b.dayOfWeek);
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    });
  } catch (error: any) {
    console.error("Error fetching timetable entries:", error);
    throw new Error('Failed to get timetable entries: ' + error.message);
  }
};

// Get timetable entries filtered by classId, teacherId, or academicYearId/termId
export const getFilteredTimetableEntries = async (
  filters: { classId?: string; teacherId?: string; academicYearId?: string; termId?: string }
): Promise<TimetableEntry[]> => {
  try {
    let q = query(collection(db, 'timetable'));

    if (filters.classId) {
      q = query(q, where('classId', '==', filters.classId));
    }
    if (filters.teacherId) {
      q = query(q, where('teacherId', '==', filters.teacherId));
    }
    if (filters.academicYearId) {
      q = query(q, where('academicYearId', '==', filters.academicYearId));
    }
    if (filters.termId) {
      q = query(q, where('termId', '==', filters.termId));
    }

    const querySnapshot = await getDocs(q);
    const entries: TimetableEntry[] = [];
    querySnapshot.forEach(doc => {
      entries.push({ id: doc.id, ...doc.data() } as TimetableEntry);
    });
    return entries.sort((a, b) => {
      const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const dayA = daysOrder.indexOf(a.dayOfWeek);
      const dayB = daysOrder.indexOf(b.dayOfWeek);
      if (dayA !== dayB) return dayA - dayB;
      return a.startTime.localeCompare(b.startTime);
    });
  } catch (error: any) {
    console.error("Error fetching filtered timetable entries:", error);
    throw new Error('Failed to get filtered timetable entries: ' + error.message);
  }
};

// Update a timetable entry
export const updateTimetableEntry = async (id: string, updates: Partial<TimetableEntryData>): Promise<void> => {
  try {
    const entryRef = doc(db, 'timetable', id);
    await updateDoc(entryRef, { ...updates, updatedAt: new Date().toISOString() });
  } catch (error: any) {
    console.error("Error updating timetable entry:", error);
    throw new Error('Failed to update timetable entry: ' + error.message);
  }
};

// Delete a timetable entry
export const deleteTimetableEntry = async (id: string): Promise<void> => {
  try {
    const entryRef = doc(db, 'timetable', id);
    await deleteDoc(entryRef);
  } catch (error: any) {
    console.error("Error deleting timetable entry:", error);
    throw new Error('Failed to delete timetable entry: ' + error.message);
  }
};

