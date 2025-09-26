import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface ExamSchedule {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  classId: string;
  subjectId: string;
}

const COLL = 'exams';

export async function createExam(data: Omit<ExamSchedule, 'id'>): Promise<ExamSchedule> {
  const ref = await addDoc(collection(db, COLL), data);
  return { id: ref.id, ...data };
}

export async function listExams(): Promise<ExamSchedule[]> {
  const snap = await getDocs(collection(db, COLL));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ExamSchedule, 'id'>) }));
}

export async function getExamById(id: string): Promise<ExamSchedule | null> {
  const s = await getDoc(doc(db, COLL, id));
  if (!s.exists()) return null;
  return { id: s.id, ...(s.data() as Omit<ExamSchedule, 'id'>) };
}

export async function updateExam(id: string, updates: Partial<Omit<ExamSchedule, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COLL, id), updates);
}

export async function deleteExam(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL, id));
}
