import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { AcademicYear, SchoolClass, SchoolInfo, Term } from './types';

export { SchoolClass };

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

// --- Department CRUD Operations ---
export interface DepartmentData {
  name: string;
  description?: string;
  headOfDepartmentId?: string;
}

export const createDepartment = async (name: string, description?: string, headOfDepartmentId?: string): Promise<DepartmentData & { id: string }> => {
  try {
    const departmentsCollection = collection(db, "departments");
    const newDepartmentRef = await addDoc(departmentsCollection, {
      name,
      description: description || null,
      headOfDepartmentId: headOfDepartmentId || null,
      createdAt: new Date().toISOString(),
    });
    return { id: newDepartmentRef.id, name, description, headOfDepartmentId };
  } catch (error: any) {
    console.error("Error creating department:", error);
    throw new Error(error.message);
  }
};

export const getAllDepartments = async (): Promise<(DepartmentData & { id: string })[]> => {
  try {
    const departmentsCollection = collection(db, "departments");
    const departmentsSnapshot = await getDocs(departmentsCollection);
    const departmentsList: (DepartmentData & { id: string })[] = departmentsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: String(doc.data().name || ''),
      description: String(doc.data().description || ''),
      headOfDepartmentId: doc.data().headOfDepartmentId || null,
    }));
    return departmentsList;
  } catch (error: any) {
    console.error("Error fetching all departments:", error);
    throw new Error(error.message);
  }
};

export const updateDepartment = async (id: string, updates: Partial<DepartmentData>) => {
  try {
    const departmentDocRef = doc(db, "departments", id);
    await updateDoc(departmentDocRef, updates);
  } catch (error: any) {
    console.error("Error updating department:", error);
    throw new Error(error.message);
  }
};

export const deleteDepartment = async (id: string) => {
  try {
    await deleteDoc(doc(db, "departments", id));
  } catch (error: any) {
    console.error("Error deleting department:", error);
    throw new Error(error.message);
  }
};

// --- School Info Operations ---
const SCHOOL_INFO_DOC_ID = 'schoolProfile'; // Fixed document ID for school information

export const getSchoolInfo = async (): Promise<SchoolInfo | null> => {
  try {
    const schoolInfoDocRef = doc(db, "schoolInfo", SCHOOL_INFO_DOC_ID);
    const schoolInfoSnapshot = await getDoc(schoolInfoDocRef);

    if (schoolInfoSnapshot.exists()) {
      return { id: schoolInfoSnapshot.id, ...(schoolInfoSnapshot.data() as Omit<SchoolInfo, 'id'>) };
    }
    return null;
  } catch (error: any) {
    console.error("Error fetching school info:", error);
    throw new Error(error.message);
  }
};

export const updateSchoolInfo = async (updates: Partial<SchoolInfo>): Promise<void> => {
  try {
    const schoolInfoDocRef = doc(db, "schoolInfo", SCHOOL_INFO_DOC_ID);
    await setDoc(schoolInfoDocRef, updates, { merge: true }); // Use setDoc with merge for upsert behavior
  } catch (error: any) {
    console.error("Error updating school info:", error);
    throw new Error(error.message);
  }
};
