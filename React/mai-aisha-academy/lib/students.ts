import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase'; // Assuming firebase.ts exports 'db'

export interface StudentData {
  name: string;
  classId: string; // The class the student belongs to
  teacherId: string; // The primary teacher responsible for this student
  email?: string; // Optional student email
  dateOfBirth?: Timestamp; // Optional date of birth
  gender?: 'male' | 'female' | 'other'; // Optional gender
  contactNumber?: string; // Optional parent/guardian contact number
  notes?: string; // Optional notes about the student
}

export interface Student extends StudentData {
  id: string;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

// Create a new student record
export const createStudent = async (data: StudentData): Promise<Student> => {
  try {
    const docRef = await addDoc(collection(db, 'students'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return { id: docRef.id, createdAt: Timestamp.now(), updatedAt: Timestamp.now(), ...data };
  } catch (error: any) {
    throw new Error('Failed to create student: ' + error.message);
  }
};

// Get students by teacher ID, optionally filtered by classId
export const getStudentsByTeacher = async (teacherId: string, classId?: string): Promise<Student[]> => {
  try {
    let q = query(collection(db, 'students'), where('teacherId', '==', teacherId), orderBy('name'));
    if (classId) {
      q = query(q, where('classId', '==', classId));
    }
    const querySnapshot = await getDocs(q);
    const students: Student[] = [];
    querySnapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() as StudentData, createdAt: doc.data().createdAt || Timestamp.now() });
    });
    return students;
  } catch (error: any) {
    throw new Error('Failed to get students: ' + error.message);
  }
};

// Get a single student by ID
export const getStudentById = async (studentId: string): Promise<Student | null> => {
  try {
    const docRef = doc(db, 'students', studentId);
    const docSnap = await getDocs(query(collection(db, 'students'), where('__name__', '==', studentId))); // Using query for consistency, but direct doc lookup is also an option.
    if (!docSnap.empty) {
      const data = docSnap.docs[0].data() as StudentData;
      return { id: docSnap.docs[0].id, ...data, createdAt: data.createdAt || Timestamp.now() };
    } else {
      return null;
    }
  } catch (error: any) {
    throw new Error('Failed to get student by ID: ' + error.message);
  }
};

// Update an existing student record
export const updateStudent = async (id: string, updates: Partial<StudentData>): Promise<void> => {
  try {
    const studentRef = doc(db, 'students', id);
    await updateDoc(studentRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error('Failed to update student: ' + error.message);
  }
};

// Delete a student record
export const deleteStudent = async (id: string): Promise<void> => {
  try {
    const studentRef = doc(db, 'students', id);
    await deleteDoc(studentRef);
  } catch (error: any) {
    throw new Error('Failed to delete student: ' + error.message);
  }
};
