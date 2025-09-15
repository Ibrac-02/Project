import { getAttendance } from './attendance';
import { getStudentOverallPerformance } from './performance';

export interface AttendanceWarning {
  studentId: string;
  studentName: string;
  absentCount: number;
  message: string;
}

/**
 * Checks for attendance warnings for a given student within a specified period.
 * @param studentId The ID of the student to check.
 * @param daysToCheck The number of past days to check for absences.
 * @param absenceThreshold The number of absences that trigger a warning.
 * @returns An AttendanceWarning object if a warning is triggered, otherwise null.
 */
export const checkStudentAttendanceWarnings = async (
  studentId: string,
  studentName: string,
  daysToCheck: number = 7,
  absenceThreshold: number = 3
): Promise<AttendanceWarning | null> => {
  try {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - daysToCheck);

    const attendanceRecords = await getAttendance(
      'admin', // Assuming an admin role for fetching all attendance for warning checks
      'system', // Placeholder for currentUserId
      {
        studentId: studentId,
        startDate: startDate,
        endDate: endDate,
        recordType: 'student',
      }
    );

    const absentCount = attendanceRecords.filter(record => record.status === 'absent').length;

    if (absentCount >= absenceThreshold) {
      return {
        studentId,
        studentName,
        absentCount,
        message: `Student ${studentName} has been absent ${absentCount} times in the last ${daysToCheck} days.`,
      };
    }

    return null;
  } catch (error) {
    console.error(`Error checking attendance warnings for student ${studentId}:`, error);
    return null;
  }
};

export interface PerformanceWarning {
  studentId: string;
  studentName: string;
  averageGrade: number;
  message: string;
}

/**
 * Checks for performance warnings for a given student based on their average grades.
 * @param studentId The ID of the student to check.
 * @param studentName The name of the student.
 * @param gradeThreshold The average grade percentage below which a warning is triggered.
 * @returns A PerformanceWarning object if a warning is triggered, otherwise null.
 */
export const checkStudentPerformanceWarnings = async (
  studentId: string,
  studentName: string,
  gradeThreshold: number = 60
): Promise<PerformanceWarning | null> => {
  try {
    const studentPerformance = await getStudentOverallPerformance(studentId);

    if (studentPerformance.averageGrade < gradeThreshold) {
      return {
        studentId,
        studentName,
        averageGrade: studentPerformance.averageGrade,
        message: `Student ${studentName} has an average grade of ${studentPerformance.averageGrade}% which is below the threshold of ${gradeThreshold}%.`,
      };
    }
    return null;
  } catch (error) {
    console.error(`Error checking performance warnings for student ${studentId}:`, error);
    return null;
  }
};
