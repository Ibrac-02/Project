import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Subject } from './types';

// Create a new subject
export const createSubject = async (name: string, description: string, teachersAssigned: string[] = []): Promise<Subject> => {
  try {
    const subjectsCollection = collection(db, "subjects");
    const newSubjectRef = await addDoc(subjectsCollection, {
      name,
      description,
      teachersAssigned,
      createdAt: new Date().toISOString(),
    });
    return { id: newSubjectRef.id, name, description, teachersAssigned };
  } catch (error: any) {
    console.error("Error creating subject:", error);
    throw new Error(error.message);
  }
};

// Get all subjects
export const getAllSubjects = async (): Promise<Subject[]> => {
  try {
    const subjectsCollection = collection(db, "subjects");
    const subjectsSnapshot = await getDocs(subjectsCollection);
    const subjectsList: Subject[] = subjectsSnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      teachersAssigned: doc.data().teachersAssigned || [],
    }));
    return subjectsList;
  } catch (error: any) {
    console.error("Error fetching all subjects:", error);
    throw new Error(error.message);
  }
};

// Get a subject by ID
export const getSubjectById = async (id: string): Promise<Subject | null> => {
  try {
    const subjectDoc = await getDoc(doc(db, "subjects", id));
    if (subjectDoc.exists()) {
      const data = subjectDoc.data();
      return { id: subjectDoc.id, name: data.name, description: data.description, teachersAssigned: data.teachersAssigned || [] };
    } else {
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching subject by ID:", error);
    throw new Error(error.message);
  }
};

// Update a subject
export const updateSubject = async (id: string, updates: Partial<Subject>) => {
  try {
    const subjectDocRef = doc(db, "subjects", id);
    await updateDoc(subjectDocRef, updates);
  } catch (error: any) {
    console.error("Error updating subject:", error);
    throw new Error(error.message);
  }
};

// Delete a subject
export const deleteSubject = async (id: string) => {
  try {
    await deleteDoc(doc(db, "subjects", id));
  } catch (error: any) {
    console.error("Error deleting subject:", error);
    throw new Error(error.message);
  }
};

// Get subjects assigned to a teacher
export const getTeacherSubjects = async (teacherUid: string): Promise<Subject[]> => {
  try {
    const subjectsCollection = collection(db, "subjects");
    const q = query(subjectsCollection, where("teachersAssigned", "array-contains", teacherUid));
    const querySnapshot = await getDocs(q);
    const subjects: Subject[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      description: doc.data().description,
      teachersAssigned: doc.data().teachersAssigned || [],
    }));
    return subjects;
  } catch (error: any) {
    console.error("Error fetching teacher's subjects:", error);
    throw new Error(error.message);
  }
};
