
import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  userName: string | null;
  role: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    userName: null,
    role: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth State Changed - User:", user ? user.uid : "null");
      if (user) {
        // Fetch user's name and role from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : null;
        const userName = userData ? userData.name : null;
        const role = userData ? userData.role : null;
        console.log("Auth State Changed - Fetched User Data: Name=", userName, ", Role=", role);
        setAuthState({ user, loading: false, userName, role });
      } else {
        console.log("Auth State Changed - No user logged in.");
        setAuthState({ user: null, loading: false, userName: null, role: null });
      }
    });
    return () => unsubscribe();
  }, []);

  return authState;
};

export const signIn = async (email: string, password: string) => {
  try {
    const response = await signInWithEmailAndPassword(auth, email, password);
    const user = response.user;
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null; // Fetch role from Firestore
    return { user, role };
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const signUp = async (email: string, password: string, name: string, role: string) => {
  try {
    const response = await createUserWithEmailAndPassword(auth, email, password);
    // Set default role as 'teacher' and store name in Firestore
    await setDoc(doc(db, "users", response.user.uid), {
      email: response.user.email,
      role: role,
      name: name,
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

export const updateUserName = async (uid: string, newName: string) => {
  try {
    const userDocRef = doc(db, "users", uid);
    await updateDoc(userDocRef, {
      name: newName,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getUserNameById = async (uid: string): Promise<string | null> => {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.name || userData.email || null;
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching user name by ID:", error);
    return null;
  }
};
