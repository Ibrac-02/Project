import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Grade } from './types';
// Assuming an attendance interface or data structure exists in lib/types.ts or similar
// import { AttendanceRecord } from './types'; 

// Helper to calculate average from a list of grades
const calculateAverageGrade = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  const totalPercentage = grades.reduce((sum, grade) => sum + grade.gradePercentage, 0);
  return parseFloat((totalPercentage / grades.length).toFixed(2));
};

// Get performance for a single student across all approved grades
export const getStudentOverallPerformance = async (studentId: string): Promise<{ averageGrade: number; totalAssignments: number }> => {
  try {
    const q = query(collection(db, "grades"), where("studentId", "==", studentId), where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);
    const studentGrades = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));

    return {
      averageGrade: calculateAverageGrade(studentGrades),
      totalAssignments: studentGrades.length,
    };
  } catch (error: any) {
    console.error("Error fetching student overall performance:", error);
    throw new Error(error.message);
  }
};

// Get performance for a specific class (average grades for all students in that class)
// This assumes grades have a 'classId' field, or we can infer it from student data
export const getClassAveragePerformance = async (studentIdsInClass: string[]): Promise<{ averageGrade: number; totalStudents: number }> => {
  try {
    if (studentIdsInClass.length === 0) return { averageGrade: 0, totalStudents: 0 };

    const q = query(collection(db, "grades"), where("studentId", "in", studentIdsInClass), where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);
    const classGrades = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));

    // Calculate average grade per student, then average those averages
    const studentAverages: { [studentId: string]: number[] } = {};
    classGrades.forEach(grade => {
      if (!studentAverages[grade.studentId]) {
        studentAverages[grade.studentId] = [];
      }
      studentAverages[grade.studentId].push(grade.gradePercentage);
    });

    const overallStudentAverages = Object.values(studentAverages).map(grades => {
      if (grades.length === 0) return 0;
      const totalPercentage = grades.reduce((sum, grade) => sum + grade, 0);
      return parseFloat((totalPercentage / grades.length).toFixed(2));
    });

    return {
      averageGrade: calculateAverageGrade(overallStudentAverages.map(avg => ({ gradePercentage: avg } as Grade))), // Convert back to Grade-like for helper
      totalStudents: Object.keys(studentAverages).length,
    };
  } catch (error: any) {
    console.error("Error fetching class average performance:", error);
    throw new Error(error.message);
  }
};

// Get performance data for a teacher's assigned subjects/classes
export const getTeacherPerformanceOverview = async (teacherId: string): Promise<Array<{ subjectName: string; averageGrade: number; totalStudentsGraded: number }>> => {
  try {
    const q = query(collection(db, "grades"), where("teacherId", "==", teacherId), where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);
    const teacherGrades = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));

    const performanceBySubject: { [subjectId: string]: { grades: Grade[]; subjectName: string } } = {};

    // Fetch subjects to get names
    const subjectsSnapshot = await getDocs(collection(db, "subjects"));
    const subjectsMap = new Map(subjectsSnapshot.docs.map(doc => [doc.id, doc.data().name]));

    teacherGrades.forEach(grade => {
      if (!performanceBySubject[grade.subjectId]) {
        performanceBySubject[grade.subjectId] = { grades: [], subjectName: subjectsMap.get(grade.subjectId) || 'Unknown Subject' };
      }
      performanceBySubject[grade.subjectId].grades.push(grade);
    });

    return Object.entries(performanceBySubject).map(([subjectId, data]) => ({
      subjectName: data.subjectName,
      averageGrade: calculateAverageGrade(data.grades),
      totalStudentsGraded: new Set(data.grades.map(g => g.studentId)).size,
    }));
  } catch (error: any) {
    console.error("Error fetching teacher performance overview:", error);
    throw new Error(error.message);
  }
};
