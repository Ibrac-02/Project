import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { UserProfile } from './types';

const USERS_COLL = 'users';

export type RoleType = 'admin' | 'teacher' | 'headteacher' | 'student';

export async function createUserWithRole(role: RoleType, data: Partial<UserProfile>) {
  const payload: Omit<UserProfile, 'uid'> = {
    email: data.email ?? null,
    role,
    name: data.name ?? '',
    title: data.title ?? null,
    contactNumber: data.contactNumber ?? null,
    dateJoined: data.dateJoined ?? new Date().toISOString(),
    status: data.status ?? 'active',
    employeeId: data.employeeId ?? null,
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

  Object.keys(payload).forEach((k) => (payload as any)[k] === undefined && delete (payload as any)[k]);

  const ref = await addDoc(collection(db, USERS_COLL), payload);
  // Place uid at the end to ensure it can't be overwritten
  return { ...(payload as Omit<UserProfile, 'uid'>), uid: ref.id };
}

export async function updateUser(uid: string, updates: Partial<UserProfile>) {
  const ref = doc(db, USERS_COLL, uid);
  const clean: any = { ...updates };
  Object.keys(clean).forEach((k) => clean[k] === undefined && delete clean[k]);
  await updateDoc(ref, clean);
}

export async function deleteUser(uid: string) {
  await deleteDoc(doc(db, USERS_COLL, uid));
}

export async function getUserById(uid: string): Promise<UserProfile | null> {
  const snap = await getDoc(doc(db, USERS_COLL, uid));
  if (!snap.exists()) return null;
  return { uid: snap.id, ...(snap.data() as Omit<UserProfile, 'uid'>) };
}

export async function listUsersByRole(role: RoleType): Promise<UserProfile[]> {
  const q = query(collection(db, USERS_COLL), where('role', '==', role));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ uid: d.id, ...(d.data() as Omit<UserProfile, 'uid'>) }));
}

export async function setUser(uid: string, data: Omit<UserProfile, 'uid'>) {
  const ref = doc(db, USERS_COLL, uid);
  await setDoc(ref, data);
}
