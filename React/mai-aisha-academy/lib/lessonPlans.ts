import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { LessonActivity, LessonPlan } from './types';

// Create a new lesson plan
export const createLessonPlan = async (lessonData: Omit<LessonPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<LessonPlan> => {
  try {
    const lessonPlansCollection = collection(db, "lessonPlans");
    const newLessonRef = await addDoc(lessonPlansCollection, {
      ...lessonData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }); 
    return { 
      id: newLessonRef.id, 
      ...lessonData, 
      createdAt: new Date().toISOString(), 
      updatedAt: new Date().toISOString() 
    };
  } catch (error: any) {
    console.error("Error creating lesson plan:", error);
    throw new Error(error.message);
  }
};

// Get lesson plans by teacher
export const getLessonPlansByTeacher = async (teacherId: string): Promise<LessonPlan[]> => {
  try {
    const q = query(
      collection(db, "lessonPlans"), 
      where("teacherId", "==", teacherId)
    );
    const querySnapshot = await getDocs(q);
    const lessonPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonPlan));
    
    // Sort in JavaScript instead of Firestore to avoid composite index
    return lessonPlans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    console.error("Error getting lesson plans by teacher:", error);
    throw new Error(error.message);
  }
};

// Get all lesson plans (for headteacher/admin)
export const getAllLessonPlans = async (): Promise<LessonPlan[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, "lessonPlans"));
    const lessonPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonPlan));
    
    // Sort in JavaScript instead of Firestore to avoid composite index
    return lessonPlans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    console.error("Error getting all lesson plans:", error);
    throw new Error(error.message);
  }
};

// Get lesson plans by subject
export const getLessonPlansBySubject = async (subjectId: string): Promise<LessonPlan[]> => {
  try {
    const q = query(
      collection(db, "lessonPlans"), 
      where("subjectId", "==", subjectId)
    );
    const querySnapshot = await getDocs(q);
    const lessonPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonPlan));
    
    // Sort in JavaScript instead of Firestore to avoid composite index
    return lessonPlans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    console.error("Error getting lesson plans by subject:", error);
    throw new Error(error.message);
  }
};

// Get lesson plans by class
export const getLessonPlansByClass = async (classId: string): Promise<LessonPlan[]> => {
  try {
    const q = query(
      collection(db, "lessonPlans"), 
      where("classId", "==", classId)
    );
    const querySnapshot = await getDocs(q);
    const lessonPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonPlan));
    
    // Sort in JavaScript instead of Firestore to avoid composite index
    return lessonPlans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    console.error("Error getting lesson plans by class:", error);
    throw new Error(error.message);
  }
};

// Update a lesson plan
export const updateLessonPlan = async (id: string, updates: Partial<Omit<LessonPlan, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const lessonRef = doc(db, "lessonPlans", id);
    await updateDoc(lessonRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error updating lesson plan:", error);
    throw new Error(error.message);
  }
};

// Delete a lesson plan
export const deleteLessonPlan = async (id: string): Promise<void> => {
  try {
    await deleteDoc(doc(db, "lessonPlans", id));
  } catch (error: any) {
    console.error("Error deleting lesson plan:", error);
    throw new Error(error.message);
  }
};

// Review lesson plan (headteacher function)
export const reviewLessonPlan = async (
  id: string, 
  reviewedBy: string, 
  feedback: string, 
  status: 'completed' | 'reviewed'
): Promise<void> => {
  try {
    const lessonRef = doc(db, "lessonPlans", id);
    await updateDoc(lessonRef, {
      status,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      feedback,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Error reviewing lesson plan:", error);
    throw new Error(error.message);
  }
};

// Get lesson plans by date range
export const getLessonPlansByDateRange = async (
  startDate: string, 
  endDate: string, 
  teacherId?: string
): Promise<LessonPlan[]> => {
  try {
    let q;
    
    if (teacherId) {
      q = query(
        collection(db, "lessonPlans"),
        where("teacherId", "==", teacherId),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );
    } else {
      q = query(
        collection(db, "lessonPlans"),
        where("date", ">=", startDate),
        where("date", "<=", endDate)
      );
    }

    const querySnapshot = await getDocs(q);
    const lessonPlans = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LessonPlan));
    
    // Sort in JavaScript instead of Firestore to avoid composite index
    return lessonPlans.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch (error: any) {
    console.error("Error getting lesson plans by date range:", error);
    throw new Error(error.message);
  }
};

// Helper function to create a new lesson activity
export const createLessonActivity = (
  title: string,
  description: string,
  duration: number,
  type: LessonActivity['type'],
  order: number
): LessonActivity => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  title,
  description,
  duration,
  type,
  order,
});

// Helper function to get lesson plan statistics
export const getLessonPlanStats = async (teacherId: string) => {
  try {
    const lessonPlans = await getLessonPlansByTeacher(teacherId);
    
    const stats = {
      total: lessonPlans.length,
      draft: lessonPlans.filter(lp => lp.status === 'draft').length,
      completed: lessonPlans.filter(lp => lp.status === 'completed').length,
      reviewed: lessonPlans.filter(lp => lp.status === 'reviewed').length,
      thisWeek: lessonPlans.filter(lp => {
        const lessonDate = new Date(lp.date);
        const now = new Date();
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return lessonDate >= weekAgo && lessonDate <= now;
      }).length,
    };

    return stats;
  } catch (error: any) {
    console.error("Error getting lesson plan stats:", error);
    throw new Error(error.message);
  }
};
