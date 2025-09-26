import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface LessonPlanRecord {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD
  status: 'draft' | 'pending' | 'completed' | 'reviewed';
  objectives?: string[];
  notes?: string;
}

const COLL = 'lessonPlans';

export async function createLessonPlan(data: Omit<LessonPlanRecord, 'id'>): Promise<LessonPlanRecord> {
  const ref = await addDoc(collection(db, COLL), data);
  return { id: ref.id, ...data };
}

export async function updateLessonPlan(id: string, updates: Partial<Omit<LessonPlanRecord, 'id'>>): Promise<void> {
  await updateDoc(doc(db, COLL, id), updates);
}

export async function deleteLessonPlan(id: string): Promise<void> {
  await deleteDoc(doc(db, COLL, id));
}

export async function getLessonPlanById(id: string): Promise<LessonPlanRecord | null> {
  const s = await getDoc(doc(db, COLL, id));
  if (!s.exists()) return null;
  return { id: s.id, ...(s.data() as Omit<LessonPlanRecord, 'id'>) };
}

export async function listLessonPlansForTeacher(teacherId: string): Promise<LessonPlanRecord[]> {
  const q = query(collection(db, COLL), where('teacherId', '==', teacherId));
  const s = await getDocs(q);
  return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<LessonPlanRecord, 'id'>) }));
}

export async function listLessonPlansAll(): Promise<LessonPlanRecord[]> {
  const s = await getDocs(collection(db, COLL));
  return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<LessonPlanRecord, 'id'>) }));
}
