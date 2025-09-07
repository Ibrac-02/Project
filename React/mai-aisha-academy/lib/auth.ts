import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';
import { UserProfile } from './types';

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
        twoFactorEnabled: userData?.twoFactorEnabled || false, // ✅ add 2FA field
      };

      const userName = userProfile.name;
      const role = userProfile.role;

      console.log(
        'Auth State Changed - Fetched User Data: Name=',
        userName,
        ', Role=',
        role,
        ', Title=',
        userProfile.title,
      );
      setAuthState({ user, loading: false, userName, role, userProfile });
    } else {
      console.log('Auth State Changed - No user logged in.');
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
      console.log('Auth State Changed - User:', user ? user.uid : 'null');
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

  // 🔹 New methods
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
    const usersList: UserProfile[] = usersSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        uid: doc.id,
        email: data.email,
        name: data.name || null,
        role: data.role || null,
        title: data.title || null,
        contactNumber: data?.contactNumber || null,
        dateJoined: data?.dateJoined || null,
        status: data?.status || null,
        employeeId: data?.employeeId || null,
        department: data?.department || null,
        teachersSupervised: data?.teachersSupervised || null,
        attendanceApprovals: data?.attendanceApprovals || null,
        gradeApprovals: data?.gradeApprovals || null,
        subjects: data?.subjects || null,
        classes: data?.classes || null,
        qualifications: data?.qualifications || null,
        classesHandled: data?.classesHandled || null,
        attendanceSubmitted: data?.attendanceSubmitted || null,
        gradesSubmitted: data?.gradesSubmitted || null,
        twoFactorEnabled: data?.twoFactorEnabled || false,
      };
    });
    return usersList;
  } catch (error: any) {
    console.error('Error fetching all users:', error);
    throw new Error(error.message);
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
    
    return querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...(doc.data() as Omit<UserProfile, 'uid'>),
    }));

  } catch (error: any) {
    console.error('Error fetching students:', error);
    throw new Error(error.message);
  }
};

// 🔹 Auth methods
export const signIn = async (email: string, password: string) => {
  try {
    const response = await signInWithEmailAndPassword(auth, email, password);
    const user = response.user;
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;
    return { user, role };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signUp = async (
  email: string,
  password: string,
  name: string,
  role: string,
  title?: string,
) => {
  try {
    const response = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, 'users', response.user.uid), {
      email: response.user.email,
      role: role,
      name: name,
      ...(title && { title }),
      twoFactorEnabled: false, // default disabled
    });
    return response.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const sendPasswordReset = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, updates);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const updateUserName = async (uid: string, newName: string) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, { name: newName });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserNameById = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.name || userData.email || null;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error('Error fetching user name by ID:', error);
    return null;
  }
};
