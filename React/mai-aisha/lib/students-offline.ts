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
  const isOnline = await offlineManager.isConnected();
  
  if (!isOnline) {
    // Store as pending action for sync later
    await offlineManager.addPendingAction({
      type: 'create',
      collection: 'students',
      data
    });
    
    // Add to offline storage with temporary ID
    const students = await offlineManager.getOfflineStudents();
    const tempStudent: UserProfile = {
      uid: `temp_${Date.now()}`,
      email: null,
      role: 'student',
      name: data.name,
      title: data.title ?? null,
      contactNumber: data.contactNumber ?? null,
      dateJoined: data.dateJoined ?? new Date().toISOString(),
      status: data.status ?? 'active',
      employeeId: null,
      gender: data.gender ?? null,
      department: data.department ?? null,
      teachersSupervised: data.teachersSupervised ?? null,
      attendanceApprovals: data.attendanceApprovals ?? null,
      gradeApprovals: data.gradeApprovals ?? null,
      subjects: data.subjects ?? null,
      classes: data.classes ?? null,
      qualifications: data.qualifications ?? null,
      classesHandled: data.classesHandled ?? null,
      attendanceSubmitted: data.attendanceSubmitted ?? null,
      gradesSubmitted: data.gradesSubmitted ?? null,
      twoFactorEnabled: data.twoFactorEnabled ?? false,
    };
    
    students.push(tempStudent);
    await offlineManager.storeStudents(students);
    return;
  }
  
  // Online operation
  const payload: Omit<UserProfile, 'uid'> = {
    email: null,
    role: 'student',
    name: data.name,
    title: data.title ?? null,
    contactNumber: data.contactNumber ?? null,
    dateJoined: data.dateJoined ?? new Date().toISOString(),
    status: data.status ?? 'active',
    employeeId: null,
    gender: data.gender ?? null,
    department: data.department ?? null,
    teachersSupervised: data.teachersSupervised ?? null,
    attendanceApprovals: data.attendanceApprovals ?? null,
    gradeApprovals: data.gradeApprovals ?? null,
    subjects: data.subjects ?? null,
    classes: data.classes ?? null,
    qualifications: data.qualifications ?? null,
    classesHandled: data.classesHandled ?? null,
    attendanceSubmitted: data.attendanceSubmitted ?? null,
    gradesSubmitted: data.gradesSubmitted ?? null,
    twoFactorEnabled: data.twoFactorEnabled ?? false,
  } as any;

  // Clean undefined fields
  Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);

  const ref = await addDoc(collection(db, STUDENTS_COLL), { ...payload, role: 'student' });
  const result = { ...(payload as Omit<UserProfile, 'uid'>), uid: ref.id };
  
  // Update offline cache
  const students = await offlineManager.getOfflineStudents();
  students.push(result as UserProfile);
  await offlineManager.storeStudents(students);
  
  return result;
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
