import { createUserWithEmailAndPassword, EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updatePassword, User, } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState, type ReactNode } from 'react';
import { auth, db } from '@/config/firebase';
import { UserProfile } from './types';

export { UserProfile };

interface AuthState {
  user: User | null;
  loading: boolean;
  userName: string | null;
  role: string | null;
  userProfile: UserProfile | null;
}
 
export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    userName: null,
    role: null,
    userProfile: null,
  }); 

  // 🔹 Fetch user data and update state
  const fetchAndUpdateUserProfile = async (user: User | null) => {
    if (user) {
      const userProfile = await getUserProfile(user.uid);
      const userName = userProfile?.name || null;
      const role = userProfile?.role || null;

      setAuthState({ user, loading: false, userName, role, userProfile });
    } else {
      setAuthState({
        user: null,
        loading: false,
        userName: null,
        role: null,
        userProfile: null,
      });
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthState((prev) => ({ ...prev, loading: true }));
      await fetchAndUpdateUserProfile(user);
    });
    return () => unsubscribe();
  }, []);

  const refreshUserProfile = async () => {
    if (authState.user) {
      setAuthState((prev) => ({ ...prev, loading: true }));
      await fetchAndUpdateUserProfile(authState.user);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!authState.user || !authState.user.email) throw new Error('No logged in user');
    const credential = EmailAuthProvider.credential(authState.user.email, currentPassword);
    await reauthenticateWithCredential(authState.user, credential);
    await updatePassword(authState.user, newPassword);
  };

  const enable2FA = async () => {
    if (!authState.user) throw new Error('No logged in user');
    await updateUserProfile(authState.user.uid, { twoFactorEnabled: true });
    await refreshUserProfile();
  };

  const disable2FA = async () => {
    if (!authState.user) throw new Error('No logged in user');
    await updateUserProfile(authState.user.uid, { twoFactorEnabled: false });
    await refreshUserProfile();
  };

  return {
    ...authState,
    refreshUserProfile,
    changePassword,
    enable2FA,
    disable2FA,
  };
};

// 🔹 Admin/User management helpers
export const getAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...(doc.data() as Omit<UserProfile, 'uid'>),
    }));
  } catch (error: any) {
    console.error('Error fetching all users:', error);
    return [];
  }
};

export const deleteUserById = async (uid: string) => {
  try {
    await deleteDoc(doc(db, 'users', uid));
  } catch (error: any) {
    console.error('Error deleting user profile:', error);
    throw new Error(error.message);
  }
};

export const getStudents = async (): Promise<UserProfile[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, 'students'));
    // Note: No need to filter by role since students collection only contains students
    return querySnapshot.docs.map((doc) => ({
      uid: doc.id,
      ...(doc.data() as Omit<UserProfile, 'uid'>),
    }));
  } catch (error: any) {
    console.error('Error fetching students:', error);
    return [];
  }
};

export const signIn = async (email: string, password: string) => {
  const response = await signInWithEmailAndPassword(auth, email, password);
  const user = response.user;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  const role = userDoc.exists() ? userDoc.data().role : null;
  return { user, role };
};

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: string,
  title?: string,
) => {
  const response = await createUserWithEmailAndPassword(auth, email, password);
  await setDoc(doc(db, 'users', response.user.uid), {
    email: response.user.email,
    role: role,
    name: name,
    ...(title && { title }),
    twoFactorEnabled: false,
  });
  return response.user;
};

export const sendPasswordReset = async (email: string) => {
  const continueUrl = process.env.EXPO_PUBLIC_RESET_CONTINUE_URL || 'https://mai-aisha-academy.firebaseapp.com/login';
  await sendPasswordResetEmail(auth, email, { url: continueUrl });
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  if (!uid) throw new Error("UID is required");
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, updates);
};

export const updateUserName = async (uid: string, newName: string) => {
  if (!uid) throw new Error("UID is required");
  const userDocRef = doc(db, 'users', uid);
  await updateDoc(userDocRef, { name: newName });
};

export const getUserNameById = async (uid: string): Promise<string | null> => {
  if (!uid) return null;
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.name || userData.email || null;
    }
    return null;
  } catch (error: any) {
    console.error('Error fetching user name by ID:', error);
    return null;
  }
};

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  if (!uid) throw new Error("UID is required");
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      return { uid: userDoc.id, ...(userDoc.data() as Omit<UserProfile, 'uid'>) };
    }
    return null;
  } catch (error: any) {
    console.error('Error fetching user profile by ID:', error);
    throw new Error(error.message);
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error("Error signing out:", error);
    throw new Error(error.message);
  }
};

// Minimal provider to maintain compatibility with existing app/_layout.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  return children as any;
}
