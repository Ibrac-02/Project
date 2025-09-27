import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { UserProfile } from './types';

const USERS_COLL = 'users';

export type StudentInput = Partial<UserProfile> & {
  name: string;
  role?: 'student';
  email?: string | null;
};

export async function createStudent(data: StudentInput) {
  const payload: Omit<UserProfile, 'uid'> = {
    uid: '' as any,
    email: data.email ?? null,
    role: 'student',
    name: data.name,
    title: data.title ?? null,
    contactNumber: data.contactNumber ?? null,
    dateJoined: data.dateJoined ?? new Date().toISOString(),
    status: data.status ?? 'active',
    employeeId: data.employeeId ?? null,
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
    parentName: data.parentName ?? null,
    parentContactNumber: data.parentContactNumber ?? null,
    parentEmail: data.parentEmail ?? null,
    twoFactorEnabled: data.twoFactorEnabled ?? false,
  } as any;

  // Clean undefined fields
  Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);

  const ref = await addDoc(collection(db, USERS_COLL), { ...payload, role: 'student' });
  return { uid: ref.id, ...(payload as Omit<UserProfile, 'uid'>) };
}

export async function updateStudent(uid: string, updates: Partial<UserProfile>) {
  const ref = doc(db, USERS_COLL, uid);
  const clean: any = { ...updates };
  Object.keys(clean).forEach((k) => clean[k] === undefined && delete clean[k]);
  await updateDoc(ref, clean);
}

export async function deleteStudent(uid: string) {
  await deleteDoc(doc(db, USERS_COLL, uid));
}

export async function getStudentById(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS_COLL, uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...(snap.data() as Omit<UserProfile, 'uid'>) };
}

export async function listStudents(classId?: string): Promise<UserProfile[]> {
  if (classId) {
    const q = query(collection(db, USERS_COLL), where('role', '==', 'student'), where('classes', '==', classId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, 'uid'>) }));
  }
  const q = query(collection(db, USERS_COLL), where('role', '==', 'student'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, 'uid'>) }));
}

export async function setStudent(uid: string, data: Omit<UserProfile, 'uid'>) {
  const ref = doc(db, USERS_COLL, uid);
  await setDoc(ref, data);
}
