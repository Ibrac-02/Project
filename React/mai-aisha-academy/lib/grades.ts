import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Grade } from './types';

export const createGrade = async (gradeData: Omit<Grade, 'id' | 'createdAt' | 'updatedAt' | 'gradePercentage'>): Promise<Grade> => {
  try {
    const gradePercentage = (gradeData.marksObtained / gradeData.totalMarks) * 100;
    const newGradeRef = await addDoc(collection(db, "grades"), {
      ...gradeData,
      gradePercentage: parseFloat(gradePercentage.toFixed(2)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    return { id: newGradeRef.id, ...gradeData, gradePercentage: parseFloat(gradePercentage.toFixed(2)), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  } catch (error: any) {
    console.error("Error creating grade:", error);
    throw new Error(error.message);
  }
};

export const getGradesByTeacher = async (teacherId: string): Promise<Grade[]> => {
  try {
    const q = query(collection(db, "grades"), where("teacherId", "==", teacherId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
  } catch (error: any) {
    console.error("Error getting grades by teacher:", error);
    throw new Error(error.message);
  }
};

export const getGradesByStudent = async (studentId: string): Promise<Grade[]> => {
  try {
    const q = query(collection(db, "grades"), where("studentId", "==", studentId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
  } catch (error: any) {
    console.error("Error getting grades by student:", error);
    throw new Error(error.message);
  }
};

export const getPendingGradesForApproval = async (): Promise<Grade[]> => {
  try {
    const q = query(collection(db, "grades"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
  } catch (error: any) {
    console.error("Error getting pending grades:", error);
    throw new Error(error.message);
  }
};

export const getAllGrades = async (): Promise<Grade[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "grades"));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
  } catch (error: any) {
    console.error("Error getting all grades:", error);
    throw new Error(error.message);
  }
};

export const updateGrade = async (id: string, updates: Partial<Omit<Grade, 'id' | 'createdAt' | 'gradePercentage'>>): Promise<void> => {
  try {
    const gradeRef = doc(db, "grades", id);
    const gradeUpdates: any = { ...updates, updatedAt: new Date().toISOString() };

    if (updates.marksObtained !== undefined || updates.totalMarks !== undefined) {
      // Fetch current grade to calculate new percentage if only one part is updated
      const currentGradeDoc = await getDocs(query(collection(db, "grades"), where("id", "==", id)));
      const currentGrade = currentGradeDoc.docs[0].data() as Grade;

      const marksObtained = updates.marksObtained !== undefined ? updates.marksObtained : currentGrade.marksObtained;
      const totalMarks = updates.totalMarks !== undefined ? updates.totalMarks : currentGrade.totalMarks;
      
      if (totalMarks > 0) {
        gradeUpdates.gradePercentage = parseFloat(((marksObtained / totalMarks) * 100).toFixed(2));
      } else {
        gradeUpdates.gradePercentage = 0;
      }
    }
    
    await updateDoc(gradeRef, gradeUpdates);
  } catch (error: any) {
    console.error("Error updating grade:", error);
    throw new Error(error.message);
  }
};

export const deleteGrade = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "grades", id));
  } catch (error: any) {
    console.error("Error deleting grade:", error);
    throw new Error(error.message);
  }
};
