import { addDoc, collection, deleteDoc, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { LessonPlan, LessonActivity } from './types';

// Data transfer object for creating a lesson plan
export interface CreateLessonPlanData {
  title: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD format
  duration: number; // Duration in minutes
  objectives: string[];
  materials: string[];
  activities: Omit<LessonActivity, 'id'>[]; // Activities without auto-generated ID
  assessment: string;
  homework?: string;
  notes?: string;
}

/**
 * Creates a new lesson plan in Firestore.
 * @param data The lesson plan data to create.
 * @returns The created LessonPlan object with its Firestore ID.
 */
export const createLessonPlan = async (data: CreateLessonPlanData): Promise<LessonPlan> => {
  try {
    const now = new Date().toISOString();
    const lessonPlanCollection = collection(db, 'lessonPlans');
    const docRef = await addDoc(lessonPlanCollection, {
      ...data,
      createdAt: now,
      updatedAt: now,
      status: 'draft', // Default status
    });
    return { id: docRef.id, ...data, createdAt: now, updatedAt: now, status: 'draft' };
  } catch (error: any) {
    console.error('Error creating lesson plan:', error);
    throw new Error(error.message);
  }
};

/**
 * Fetches lesson plans for a specific teacher.
 * @param teacherId The UID of the teacher.
 * @returns An array of LessonPlan objects.
 */
export const getTeacherLessonPlans = async (teacherId: string): Promise<LessonPlan[]> => {
  try {
    const lessonPlanCollection = collection(db, 'lessonPlans');
    const q = query(lessonPlanCollection, where('teacherId', '==', teacherId));
    const querySnapshot = await getDocs(q);
    const lessonPlans: LessonPlan[] = [];
    querySnapshot.forEach((doc) => {
      lessonPlans.push({ id: doc.id, ...doc.data() } as LessonPlan);
    });
    return lessonPlans;
  } catch (error: any) {
    console.error('Error fetching teacher lesson plans:', error);
    throw new Error(error.message);
  }
};

/**
 * Fetches all lesson plans, with optional filters.
 * Primarily for Headteacher.
 * @param filters Optional filters (e.g., classId, subjectId, teacherId, academicYearId, termId).
 * @returns An array of LessonPlan objects.
 */
export const getFilteredLessonPlans = async (
  filters: { classId?: string; subjectId?: string; teacherId?: string; academicYearId?: string; termId?: string; status?: LessonPlan['status'] }
): Promise<LessonPlan[]> => {
  try {
    let q = collection(db, 'lessonPlans');
    let queryConstraints = [];

    if (filters.classId) queryConstraints.push(where('classId', '==', filters.classId));
    if (filters.subjectId) queryConstraints.push(where('subjectId', '==', filters.subjectId));
    if (filters.teacherId) queryConstraints.push(where('teacherId', '==', filters.teacherId));
    // Assuming academicYearId and termId might be added to LessonPlan structure later if needed for filtering
    if (filters.status) queryConstraints.push(where('status', '==', filters.status));

    const finalQuery = query(q, ...queryConstraints);
    const querySnapshot = await getDocs(finalQuery);
    const lessonPlans: LessonPlan[] = [];
    querySnapshot.forEach((doc) => {
      lessonPlans.push({ id: doc.id, ...doc.data() } as LessonPlan);
    });
    return lessonPlans;
  } catch (error: any) {
    console.error('Error fetching filtered lesson plans:', error);
    throw new Error(error.message);
  }
};

// Data transfer object for updating a lesson plan
export interface UpdateLessonPlanData {
  title?: string;
  subjectId?: string;
  classId?: string;
  teacherId?: string;
  date?: string;
  duration?: number;
  objectives?: string[];
  materials?: string[];
  activities?: Omit<LessonActivity, 'id'>[];
  assessment?: string;
  homework?: string;
  notes?: string;
  status?: LessonPlan['status'];
  reviewedBy?: string;
  reviewedAt?: string;
  feedback?: string;
}

/**
 * Updates an existing lesson plan in Firestore.
 * @param id The ID of the lesson plan to update.
 * @param updates The partial lesson plan data to update.
 */
export const updateLessonPlan = async (id: string, updates: UpdateLessonPlanData): Promise<void> => {
  try {
    const lessonPlanDocRef = doc(db, 'lessonPlans', id);
    await updateDoc(lessonPlanDocRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating lesson plan:', error);
    throw new Error(error.message);
  }
};

/**
 * Deletes a lesson plan from Firestore.
 * @param id The ID of the lesson plan to delete.
 */
export const deleteLessonPlan = async (id: string): Promise<void> => {
  try {
    const lessonPlanDocRef = doc(db, 'lessonPlans', id);
    await deleteDoc(lessonPlanDocRef);
  } catch (error: any) {
    console.error('Error deleting lesson plan:', error);
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
