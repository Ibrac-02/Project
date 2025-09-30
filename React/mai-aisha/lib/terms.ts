import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface AcademicTerm {
  id: string;
  name: string; // e.g., "First Term 2024", "Second Term 2024"
  academicYear: string; // e.g., "2024/2025"
  termNumber: number; // 1, 2, or 3
  openingDate: string; // YYYY-MM-DD
  examStartDate: string; // YYYY-MM-DD
  closingDate: string; // YYYY-MM-DD
  holidays: Holiday[];
  isActive: boolean; // Current active term
  createdAt: string;
  updatedAt: string;
}

export interface Holiday {
  id: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  description?: string;
}

const TERMS_COLL = 'academicTerms';

export async function createTerm(data: Omit<AcademicTerm, 'id' | 'createdAt' | 'updatedAt'>): Promise<AcademicTerm> {
  const now = new Date().toISOString();
  const payload = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  const ref = await addDoc(collection(db, TERMS_COLL), payload);
  return { id: ref.id, ...payload };
}

export async function updateTerm(id: string, updates: Partial<Omit<AcademicTerm, 'id' | 'createdAt'>>): Promise<void> {
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  await updateDoc(doc(db, TERMS_COLL, id), payload);
}

export async function deleteTerm(id: string): Promise<void> {
  await deleteDoc(doc(db, TERMS_COLL, id));
}

export async function getTermById(id: string): Promise<AcademicTerm | null> {
  const snap = await getDoc(doc(db, TERMS_COLL, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as Omit<AcademicTerm, 'id'>) };
}

export async function listTerms(): Promise<AcademicTerm[]> {
  // Simple query without composite index - no orderBy clauses
  const snap = await getDocs(collection(db, TERMS_COLL));
  const terms = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AcademicTerm, 'id'>) }));
  
  // Sort on client side to avoid composite index
  return terms.sort((a, b) => {
    // First sort by academic year (descending)
    const yearCompare = b.academicYear.localeCompare(a.academicYear);
    if (yearCompare !== 0) return yearCompare;
    
    // Then sort by term number (ascending)
    return a.termNumber - b.termNumber;
  });
}

export async function getCurrentTerm(): Promise<AcademicTerm | null> {
  const q = query(collection(db, TERMS_COLL), where('isActive', '==', true));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const doc = snap.docs[0];
  return { id: doc.id, ...(doc.data() as Omit<AcademicTerm, 'id'>) };
}

export async function setActiveTerm(termId: string): Promise<void> {
  // First, deactivate all terms
  const allTerms = await listTerms();
  const batch = allTerms.map(term => 
    updateTerm(term.id, { isActive: false })
  );
  await Promise.all(batch);
  
  // Then activate the selected term
  await updateTerm(termId, { isActive: true });
}

export async function getTermsForYear(academicYear: string): Promise<AcademicTerm[]> {
  // Simple query without composite index - only where clause
  const q = query(
    collection(db, TERMS_COLL), 
    where('academicYear', '==', academicYear)
  );
  const snap = await getDocs(q);
  const terms = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<AcademicTerm, 'id'>) }));
  
  // Sort on client side to avoid composite index
  return terms.sort((a, b) => a.termNumber - b.termNumber);
}

// Helper functions for date calculations
export function isDateInTerm(date: string, term: AcademicTerm): boolean {
  return date >= term.openingDate && date <= term.closingDate;
}

export function getDaysUntilExams(term: AcademicTerm): number {
  const today = new Date();
  const examDate = new Date(term.examStartDate);
  const diffTime = examDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getDaysUntilClosing(term: AcademicTerm): number {
  const today = new Date();
  const closingDate = new Date(term.closingDate);
  const diffTime = closingDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getUpcomingHolidays(term: AcademicTerm): Holiday[] {
  const today = new Date().toISOString().split('T')[0];
  return term.holidays.filter(holiday => holiday.startDate >= today);
}
