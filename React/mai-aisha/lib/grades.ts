import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface GradeRecord {
  id: string;
  classId?: string;
  subjectId: string;
  studentId: string;
  teacherId: string;
  marksObtained: number;
  totalMarks: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

const COLL = 'grades';

export async function createGrade(data: Omit<GradeRecord, 'id'>): Promise<GradeRecord> {
  const ref = await addDoc(collection(db, COLL), data);
  return { id: ref.id, ...data };
}

export async function updateGrade(id: string, updates: Partial<Omit<GradeRecord, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COLL, id), updates);
}

export async function deleteGrade(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLL, id));
  } catch (error: any) {
    throw new Error('Failed to delete grade record: ' + error.message);
  }
}

export async function getGradeById(id: string): Promise<GradeRecord | null> {
  const s = await getDoc(doc(db, COLL, id));
  if (!s.exists()) return null;
  return { id: s.id, ...(s.data() as Omit<GradeRecord, 'id'>) };
}

export async function listGradesForTeacher(teacherId: string): Promise<GradeRecord[]> {
  const q = query(collection(db, COLL), where('teacherId', '==', teacherId));
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<GradeRecord, 'id'>) }));
}

export async function listGradesAll(): Promise<GradeRecord[]> {
  const s = await getDocs(collection(db, COLL));
  return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<GradeRecord, 'id'>) }));
}
