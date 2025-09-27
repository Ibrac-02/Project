import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { AcademicYear, Term } from './types';

const YEARS = 'academicYears';
const TERMS = 'terms'; // stored as separate collection with academicYearId field

// Academic Years
export async function createAcademicYear(data: Omit<AcademicYear, 'id'>): Promise<AcademicYear> {
  const ref = await addDoc(collection(db, YEARS), data);
  return { id: ref.id, ...data };
}

export async function setAcademicYear(id: string, data: Omit<AcademicYear, 'id'>): Promise<void> {
  await setDoc(doc(db, YEARS, id), data);
}

export async function updateAcademicYear(id: string, updates: Partial<Omit<AcademicYear, 'id'>>): Promise<void> {
  await updateDoc(doc(db, YEARS, id), updates);
}

export async function deleteAcademicYear(id: string): Promise<void> {
  await deleteDoc(doc(db, YEARS, id));
}

export async function getAcademicYearById(id: string): Promise<AcademicYear | null> {
  const s = await getDoc(doc(db, YEARS, id));
  if (!s.exists()) return null;
  return { id: s.id, ...(s.data() as Omit<AcademicYear, 'id'>) };
}

export async function listAcademicYears(): Promise<AcademicYear[]> {
  const s = await getDocs(collection(db, YEARS));
  return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AcademicYear, 'id'>) }));
}

// Terms
export async function createTerm(data: Omit<Term, 'id'>): Promise<Term> {
  const ref = await addDoc(collection(db, TERMS), data);
  return { id: ref.id, ...data };
}

export async function updateTerm(id: string, updates: Partial<Omit<Term, 'id'>>): Promise<void> {
  await updateDoc(doc(db, TERMS, id), updates);
}

export async function deleteTerm(id: string): Promise<void> {
  await deleteDoc(doc(db, TERMS, id));
}

export async function listTerms(academicYearId?: string): Promise<Term[]> {
  if (!academicYearId) {
    const s = await getDocs(collection(db, TERMS));
    return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Term, 'id'>) }));
  }
  const qy = query(collection(db, TERMS), where('academicYearId', '==', academicYearId));
  const s = await getDocs(qy);
  return s.docs.map(d => ({ id: d.id, ...(d.data() as Omit<Term, 'id'>) }));
}
