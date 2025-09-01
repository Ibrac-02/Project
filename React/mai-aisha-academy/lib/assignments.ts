import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Assignment } from './types'; // Import the Assignment interface

// Create a new assignment
export const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'createdAt'>): Promise<Assignment> => {
  try {
    const assignmentsCollection = collection(db, "assignments");
    const newAssignmentRef = await addDoc(assignmentsCollection, {
      ...assignmentData,
      createdAt: new Date().toISOString(),
    });
    return { id: newAssignmentRef.id, ...assignmentData, createdAt: new Date().toISOString() };
  } catch (error: any) {
    console.error("Error creating assignment:", error);
    throw new Error(error.message);
  }
};

// Get assignments by teacher
export const getAssignmentsByTeacher = async (teacherId: string): Promise<Assignment[]> => {
  try {
    const assignmentsCollection = collection(db, "assignments");
    const q = query(assignmentsCollection, where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);
    const assignmentsList: Assignment[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      title: doc.data().title,
      description: doc.data().description,
      subjectId: doc.data().subjectId,
      classId: doc.data().classId,
      teacherId: doc.data().teacherId,
      dueDate: doc.data().dueDate,
      totalMarks: doc.data().totalMarks,
      createdAt: doc.data().createdAt,
    }));
    return assignmentsList;
  } catch (error: any) {
    console.error("Error fetching teacher's assignments:", error);
    throw new Error(error.message);
  }
};

// Update an assignment
export const updateAssignment = async (id: string, updates: Partial<Assignment>) => {
  try {
    const assignmentDocRef = doc(db, "assignments", id);
    await updateDoc(assignmentDocRef, updates);
  } catch (error: any) {
    console.error("Error updating assignment:", error);
    throw new Error(error.message);
  }
};

// Delete an assignment
export const deleteAssignment = async (id: string) => {
  try {
    await deleteDoc(doc(db, "assignments", id));
  } catch (error: any) {
    console.error("Error deleting assignment:", error);
    throw new Error(error.message);
  }
};
