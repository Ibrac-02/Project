import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { Grade } from './types';
// Assuming an attendance interface or data structure exists in lib/types.ts or similar
// import { AttendanceRecord } from './types'; 

export interface StudentOverallPerformance {
  studentId: string;
  averageGrade: number;
  totalAssignments: number;
}

export interface ClassAveragePerformance {
  classId: string;
  averageGrade: number;
  totalStudents: number;
}

export interface TeacherPerformanceOverviewItem {
  subjectId: string;
  averageGrade: number;
  totalStudentsGraded: number;
}

export interface TeacherPerformanceOverview {
  teacherId: string;
  teacherName: string;
  subjects: TeacherPerformanceOverviewItem[];
}

// Helper to calculate average from a list of grades
const calculateAverageGrade = (grades: Grade[]): number => {
  if (grades.length === 0) return 0;
  const totalPercentage = grades.reduce((sum, grade) => sum + grade.gradePercentage, 0);
  return parseFloat((totalPercentage / grades.length).toFixed(2));
};

// Get performance for a single student across all approved grades
export const getStudentOverallPerformance = async (studentId: string): Promise<StudentOverallPerformance> => {
  try {
    const q = query(collection(db, "grades"), where("studentId", "==", studentId), where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);
    const studentGrades = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));

    return {
      studentId,
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
export const getClassAveragePerformance = async (studentIdsInClass: string[], classId: string): Promise<ClassAveragePerformance> => {
  try {
    if (studentIdsInClass.length === 0) return { classId, averageGrade: 0, totalStudents: 0 };

    // Firestore 'in' operator supports up to 10 values. Chunk the queries.
    const chunks: string[][] = [];
    for (let i = 0; i < studentIdsInClass.length; i += 10) {
      chunks.push(studentIdsInClass.slice(i, i + 10));
    }

    const classGradesArrays = await Promise.all(
      chunks.map(async (chunk) => {
        const q = query(
          collection(db, "grades"),
          where("studentId", "in", chunk),
          where("status", "==", "approved")
        );
        const qs = await getDocs(q);
        return qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));
      })
    );
    const classGrades = classGradesArrays.flat();

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

    // Average of per-student averages
    const avg = overallStudentAverages.length
      ? overallStudentAverages.reduce((a, b) => a + b, 0) / overallStudentAverages.length
      : 0;
    return {
      classId,
      averageGrade: parseFloat(avg.toFixed(2)),
      totalStudents: Object.keys(studentAverages).length,
    };
  } catch (error: any) {
    console.error("Error fetching class average performance:", error);
    throw new Error(error.message);
  }
};

// Get performance data for a teacher's assigned subjects/classes
export const getTeacherPerformanceOverview = async (teacherId: string): Promise<TeacherPerformanceOverviewItem[]> => {
  try {
    const q = query(collection(db, "grades"), where("teacherId", "==", teacherId), where("status", "==", "approved"));
    const querySnapshot = await getDocs(q);
    const teacherGrades = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Grade));

    const performanceBySubject: { [subjectId: string]: { grades: Grade[] } } = {};
    teacherGrades.forEach(grade => {
      if (!performanceBySubject[grade.subjectId]) {
        performanceBySubject[grade.subjectId] = { grades: [] };
      }
      performanceBySubject[grade.subjectId].grades.push(grade);
    });

    return Object.entries(performanceBySubject).map(([subjectId, data]) => ({
      subjectId,
      averageGrade: calculateAverageGrade(data.grades),
      totalStudentsGraded: new Set(data.grades.map(g => g.studentId)).size,
    }));
  } catch (error: any) {
    console.error("Error fetching teacher performance overview:", error);
    throw new Error(error.message);
  }
};
