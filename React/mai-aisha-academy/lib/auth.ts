import { createUserWithEmailAndPassword, EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential, sendPasswordResetEmail, signInWithEmailAndPassword, updatePassword, User, } from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, updateDoc, where, } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
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
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.exists() ? userDoc.data() : null;

      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email,
        name: userData ? userData.name : null,
        role: userData ? userData.role : null,
        title: userData ? userData.title : null,
        contactNumber: userData?.contactNumber || null,
        dateJoined: userData?.dateJoined || null,
        status: userData?.status || null,
        employeeId: userData?.employeeId || null,
        department: userData?.department || null,
        teachersSupervised: userData?.teachersSupervised || null,
        attendanceApprovals: userData?.attendanceApprovals || null,
        gradeApprovals: userData?.gradeApprovals || null,
        subjects: userData?.subjects || null,
        classes: userData?.classes || null,
        qualifications: userData?.qualifications || null,
        classesHandled: userData?.classesHandled || null,
        attendanceSubmitted: userData?.attendanceSubmitted || null,
        gradesSubmitted: userData?.gradesSubmitted || null,
        twoFactorEnabled: userData?.twoFactorEnabled || false,
      };

      const userName = userProfile.name;
      const role = userProfile.role;

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
    userRole: authState.role,
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
    const q = query(collection(db, 'users'), where('role', '==', 'student'));
    const querySnapshot = await getDocs(q);
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
  const continueUrl = process.env.EXPO_PUBLIC_RESET_CONTINUE_URL || 'https://example.com/login';
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
