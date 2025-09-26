import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { SchoolClass } from './types';

const CLASSES_COLL = 'classes';

export async function createClass(data: Omit<SchoolClass, 'id'>): Promise<SchoolClass> {
  const ref = await addDoc(collection(db, CLASSES_COLL), data);
  return { id: ref.id, ...data };
}

export async function setClass(id: string, data: Omit<SchoolClass, 'id'>): Promise<void> {
  await setDoc(doc(db, CLASSES_COLL, id), data);
}

export async function updateClass(id: string, updates: Partial<Omit<SchoolClass, 'id'>>): Promise<void> {
  await updateDoc(doc(db, CLASSES_COLL, id), updates);
}

export async function deleteClass(id: string): Promise<void> {
  await deleteDoc(doc(db, CLASSES_COLL, id));
}

export async function getClassById(id: string): Promise<SchoolClass | null> {
  const snap = await getDoc(doc(db, CLASSES_COLL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<SchoolClass, 'id'>) };
}

export async function listClasses(): Promise<SchoolClass[]> {
  const snap = await getDocs(collection(db, CLASSES_COLL));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<SchoolClass, 'id'>) }));
}
