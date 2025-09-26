import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { Subject } from './types';

const SUBJECTS_COLL = 'subjects';

export async function createSubject(data: Omit<Subject, 'id'>): Promise<Subject> {
  const ref = await addDoc(collection(db, SUBJECTS_COLL), data);
  return { id: ref.id, ...data };
}

export async function setSubject(id: string, data: Omit<Subject, 'id'>): Promise<void> {
  await setDoc(doc(db, SUBJECTS_COLL, id), data);
}

export async function updateSubject(id: string, updates: Partial<Omit<Subject, 'id'>>): Promise<void> {
  await updateDoc(doc(db, SUBJECTS_COLL, id), updates);
}

export async function deleteSubject(id: string): Promise<void> {
  await deleteDoc(doc(db, SUBJECTS_COLL, id));
}

export async function getSubjectById(id: string): Promise<Subject | null> {
  const snap = await getDoc(doc(db, SUBJECTS_COLL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<Subject, 'id'>) };
}

export async function listSubjects(): Promise<Subject[]> {
  const snap = await getDocs(collection(db, SUBJECTS_COLL));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Subject, 'id'>) }));
}
