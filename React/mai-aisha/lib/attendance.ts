import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export type AttendanceStatus = 'present' | 'absent' | 'late';

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  classId?: string;
  studentId: string;
  status: AttendanceStatus;
  teacherId: string;
}

const COLL = 'attendance';

export async function createAttendance(data: Omit<AttendanceRecord, 'id'>): Promise<AttendanceRecord> {
  const ref = await addDoc(collection(db, COLL), data);
  return { id: ref.id, ...data };
}

export async function updateAttendance(id: string, updates: Partial<Omit<AttendanceRecord, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COLL, id), updates);
}

export async function deleteAttendance(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL, id));
  } catch (error: any) {
    throw new Error('Failed to delete attendance record: ' + error.message);
  }
}

export async function getAttendanceById(id: string): Promise<AttendanceRecord | null> {
  const s = await getDoc(doc(db, COLL, id));
  if (!s.exists()) return null;
  return { id: s.id, ...(s.data() as Omit<AttendanceRecord, 'id'>) };
}

export async function listAttendanceForTeacher(teacherId: string): Promise<AttendanceRecord[]> {
  const q = query(collection(db, COLL), where('teacherId', '==', teacherId));
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AttendanceRecord, 'id'>) }));
}

export async function listAttendanceAll(): Promise<AttendanceRecord[]> {
  const s = await getDocs(collection(db, COLL));
  return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AttendanceRecord, 'id'>) }));
}
