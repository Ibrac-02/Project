import { addDoc, collection, deleteDoc, doc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Interfaces (should ideally be in lib/types.ts, but defining here for now)
interface SchoolClass {
  id: string;
  name: string;
  description?: string;
  teacherId?: string;
}

interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

interface Term {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
}

// --- Class CRUD Operations ---
export const createClass = async (name: string, description?: string, teacherId?: string): Promise<SchoolClass> => {
  try {
    const classesCollection = collection(db, "classes");
    const newClassRef = await addDoc(classesCollection, {
      name,
      description: description || null,
      teacherId: teacherId || null,
      createdAt: new Date().toISOString(),
    });
    return { id: newClassRef.id, name, description, teacherId };
  } catch (error: any) {
    console.error("Error creating class:", error);
    throw new Error(error.message);
  }
};

export const getAllClasses = async (): Promise<SchoolClass[]> => {
  try {
    const classesCollection = collection(db, "classes");
    const classesSnapshot = await getDocs(classesCollection);
    const classesList: SchoolClass[] = classesSnapshot.docs.map(doc => ({
      id: doc.id,
      name: String(doc.data().name || ''),
      description: String(doc.data().description || ''),
      teacherId: doc.data().teacherId,
    }));
    return classesList;
  } catch (error: any) {
    console.error("Error fetching all classes:", error);
    throw new Error(error.message);
  }
};

export const updateClass = async (id: string, updates: Partial<SchoolClass>) => {
  try {
    const classDocRef = doc(db, "classes", id);
    await updateDoc(classDocRef, updates);
  } catch (error: any) {
    console.error("Error updating class:", error);
    throw new Error(error.message);
  }
};

export const deleteClass = async (id: string) => {
  try {
    await deleteDoc(doc(db, "classes", id));
  } catch (error: any) {
    console.error("Error deleting class:", error);
    throw new Error(error.message);
  }
};

// --- Academic Year CRUD Operations ---
export const createAcademicYear = async (name: string, startDate: string, endDate: string, isActive: boolean = false): Promise<AcademicYear> => {
  try {
    const yearsCollection = collection(db, "academicYears");
    const newYearRef = await addDoc(yearsCollection, {
      name,
      startDate,
      endDate,
      isActive,
      createdAt: new Date().toISOString(),
    });
    return { id: newYearRef.id, name, startDate, endDate, isActive };
  } catch (error: any) {
    console.error("Error creating academic year:", error);
    throw new Error(error.message);
  }
};

export const getAllAcademicYears = async (): Promise<AcademicYear[]> => {
  try {
    const yearsCollection = collection(db, "academicYears");
    const yearsSnapshot = await getDocs(yearsCollection);
    const yearsList: AcademicYear[] = yearsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: String(doc.data().name || ''),
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
      isActive: doc.data().isActive || false,
    }));
    return yearsList;
  } catch (error: any) {
    console.error("Error fetching all academic years:", error);
    throw new Error(error.message);
  }
};

export const updateAcademicYear = async (id: string, updates: Partial<AcademicYear>) => {
  try {
    const yearDocRef = doc(db, "academicYears", id);
    await updateDoc(yearDocRef, updates);
  } catch (error: any) {
    console.error("Error updating academic year:", error);
    throw new Error(error.message);
  }
};

export const deleteAcademicYear = async (id: string) => {
  try {
    await deleteDoc(doc(db, "academicYears", id));
  } catch (error: any) {
    console.error("Error deleting academic year:", error);
    throw new Error(error.message);
  }
};

// --- Term CRUD Operations ---
export const createTerm = async (name: string, academicYearId: string, startDate: string, endDate: string): Promise<Term> => {
  try {
    const termsCollection = collection(db, "terms");
    const newTermRef = await addDoc(termsCollection, {
      name,
      academicYearId,
      startDate,
      endDate,
      createdAt: new Date().toISOString(),
    });
    return { id: newTermRef.id, name, academicYearId, startDate, endDate };
  } catch (error: any) {
    console.error("Error creating term:", error);
    throw new Error(error.message);
  }
};

export const getAllTerms = async (): Promise<Term[]> => {
  try {
    const termsCollection = collection(db, "terms");
    const termsSnapshot = await getDocs(termsCollection);
    const termsList: Term[] = termsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: String(doc.data().name || ''),
      academicYearId: doc.data().academicYearId,
      startDate: doc.data().startDate,
      endDate: doc.data().endDate,
    }));
    return termsList;
  } catch (error: any) {
    console.error("Error fetching all terms:", error);
    throw new Error(error.message);
  }
};

export const updateTerm = async (id: string, updates: Partial<Term>) => {
  try {
    const termDocRef = doc(db, "terms", id);
    await updateDoc(termDocRef, updates);
  } catch (error: any) {
    console.error("Error updating term:", error);
    throw new Error(error.message);
  }
};

export const deleteTerm = async (id: string) => {
  try {
    await deleteDoc(doc(db, "terms", id));
  } catch (error: any) {
    console.error("Error deleting term:", error);
    throw new Error(error.message);
  }
};
