
import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { auth, db } from './firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  userName: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    userName: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Fetch user's name from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userName = userDoc.exists() ? userDoc.data().name : null;
        setAuthState({ user, loading: false, userName });
      } else {
        setAuthState({ user: null, loading: false, userName: null });
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
