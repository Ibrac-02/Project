import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserProfile } from './types';
import { offlineManager, withOfflineSupport } from './offline';

const STUDENTS_COLL = 'students';

export type StudentInput = Partial<UserProfile> & {
  name: string;
  role?: 'student';
  gender?: 'male' | 'female' | null;
};

export async function createStudent(data: StudentInput) {
  // Simplified payload with only essential fields for students
  const payload = {
    email: null,
    role: 'student',
    name: data.name,
    gender: data.gender ?? null,
    classes: data.classes ?? null,
    dateJoined: new Date().toISOString(),
    status: 'active',
    // Set other fields to null for students
    title: null,
    contactNumber: null,
    employeeId: null,
    department: null,
    teachersSupervised: null,
    attendanceApprovals: null,
    gradeApprovals: null,
    subjects: null,
    qualifications: null,
    classesHandled: null,
    attendanceSubmitted: null,
    gradesSubmitted: null,
    twoFactorEnabled: false,
  };

  try {
    // Direct Firebase operation - much faster
    const ref = await addDoc(collection(db, STUDENTS_COLL), payload);
    return { ...payload, uid: ref.id };
  } catch (error) {
    console.error('Error creating student:', error);
    throw new Error('Failed to create student. Please try again.');
  }
}

export async function updateStudent(uid: string, data: Partial<StudentInput>) {
  const isOnline = await offlineManager.isConnected();
  
  if (!isOnline) {
    // Store as pending action
    await offlineManager.addPendingAction({
      type: 'update',
      collection: 'students',
      data: { uid, ...data }
    });
    
    // Update offline storage
    const students = await offlineManager.getOfflineStudents();
    const index = students.findIndex(s => s.uid === uid);
    if (index !== -1) {
      students[index] = { ...students[index], ...data };
      await offlineManager.storeStudents(students);
    }
    return;
  }
  
  // Online operation
  const docRef = doc(db, STUDENTS_COLL, uid);
  await updateDoc(docRef, data as any);
  
  // Update offline cache
  const students = await offlineManager.getOfflineStudents();
  const index = students.findIndex(s => s.uid === uid);
  if (index !== -1) {
    students[index] = { ...students[index], ...data };
    await offlineManager.storeStudents(students);
  }
}

export async function deleteStudent(uid: string) {
  const isOnline = await offlineManager.isConnected();
  
  if (!isOnline) {
    // Store as pending action
    await offlineManager.addPendingAction({
      type: 'delete',
      collection: 'students',
      data: { uid }
    });
    
    // Remove from offline storage
    const students = await offlineManager.getOfflineStudents();
    const filtered = students.filter(s => s.uid !== uid);
    await offlineManager.storeStudents(filtered);
    return;
  }
  
  try {
    // Online operation
    const docRef = doc(db, STUDENTS_COLL, uid);
    await deleteDoc(docRef);
    
    // Remove from offline cache
    const students = await offlineManager.getOfflineStudents();
    const filtered = students.filter(s => s.uid !== uid);
    await offlineManager.storeStudents(filtered);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
}

export async function getStudentById(uid: string): Promise<UserProfile | null> {
  return withOfflineSupport(
    // Online operation
    async () => {
      const docRef = doc(db, STUDENTS_COLL, uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) return null;
      return { uid: snap.id, ...snap.data() } as UserProfile;
    },
    // Offline operation
    async () => {
      const students = await offlineManager.getOfflineStudents();
      return students.find(s => s.uid === uid) || null;
    }
  );
}

export async function listStudents(classId?: string): Promise<UserProfile[]> {
  return withOfflineSupport(
    // Online operation
    async () => {
      let q = query(collection(db, STUDENTS_COLL), where('role', '==', 'student'));
      if (classId) {
        q = query(q, where('classes', '==', classId));
      }
      const snap = await getDocs(q);
      const students = snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
      return students;
    },
    // Offline operation
    async () => {
      const students = await offlineManager.getOfflineStudents();
      if (classId) {
        return students.filter(s => s.classes === classId);
      }
      return students;
    },
    // Cache operation
    async (students) => {
      await offlineManager.storeStudents(students);
    }
  );
}
