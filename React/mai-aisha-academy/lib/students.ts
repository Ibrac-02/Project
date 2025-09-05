import { db } from './firebase';
import {addDoc,collection,deleteDoc,doc,getDoc,getDocs,query,updateDoc,where} from 'firebase/firestore';

export interface Student {
  id: string;
  name: string;
  classId: string;
  teacherId: string;
  email?: string;
  contactNumber?: string;
  notes?: string;
}

export interface StudentData {
  name: string;
  classId: string;
  teacherId: string;
  email?: string;
  contactNumber?: string;
  notes?: string;
}

// ✅ Create a new student
export async function createStudent(student: StudentData): Promise<void> {
  await addDoc(collection(db, 'students'), student);
}

// ✅ Update an existing student
export async function updateStudent(studentId: string, student: StudentData): Promise<void> {
  const studentRef = doc(db, 'students', studentId);
  const flattenedStudent = flattenObject(student);
  await updateDoc(studentRef, flattenedStudent);
}

// ✅ Delete a student
export async function deleteStudent(studentId: string): Promise<void> {
  const studentRef = doc(db, 'students', studentId);
  await deleteDoc(studentRef);
}

// ✅ Get a single student by ID
export async function getStudentById(studentId: string): Promise<Student | null> {
  const studentRef = doc(db, 'students', studentId);
  const snapshot = await getDoc(studentRef);
  if (snapshot.exists()) {
    return { id: snapshot.id, ...(snapshot.data() as StudentData) };
  }
  return null;
}

// ✅ Get all students for a specific teacher (no composite index needed)
export async function getStudentsByTeacher(teacherId: string): Promise<Student[]> {
  const q = query(
    collection(db, 'students'),
    where('teacherId', '==', teacherId) // no orderBy to avoid composite index
  );

  const snapshot = await getDocs(q);
  const students = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as StudentData),
  }));

  // Sort in memory (instead of Firestore composite index)
  return students.sort((a, b) => a.classId.localeCompare(b.classId));
}

// ✅ Get all students in a specific class (for admins or future use)
export async function getStudentsByClass(classId: string): Promise<Student[]> {
  const q = query(
    collection(db, 'students'),
    where('classId', '==', classId)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as StudentData),
  }));
}
function flattenObject(student: StudentData) {
  return Object.fromEntries(
    Object.entries(student).filter(([_, v]) => v !== undefined)
  );
}

