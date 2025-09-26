import { getUserNameById } from './auth';
import { createNotification } from './notifications';
import { AttendanceWarning, PerformanceWarning } from './warningUtils';

export const generateNotificationForAttendanceWarning = async (warning: AttendanceWarning, recipientUserId: string) => {
  try {
    const notificationMessage = warning.message;
    const studentName = await getUserNameById(warning.studentId);

    await createNotification(
      notificationMessage,
      'attendance_warning',
      [recipientUserId], // Notify the specific recipient (e.g., teacher, headteacher, admin)
      '/(admin)/manage-user' // Link to a relevant screen, e.g., manage students or attendance reports
    );
    console.log(`Notification generated for attendance warning for student ${studentName || warning.studentId}`);
  } catch (error) {
    console.error(`Error generating notification for attendance warning for student ${warning.studentId}:`, error);
  }
};

export const generateNotificationForPerformanceWarning = async (warning: PerformanceWarning, recipientUserId: string) => {
  try {
    const notificationMessage = warning.message;
    const studentName = await getUserNameById(warning.studentId);

    await createNotification(
      notificationMessage,
      'performance_warning',
      [recipientUserId], // Notify the specific recipient
      '/(admin)/grade-report' // Link to a relevant screen, e.g., grade reports
    );
    console.log(`Notification generated for performance warning for student ${studentName || warning.studentId}`);
  } catch (error) {
    console.error(`Error generating notification for performance warning for student ${warning.studentId}:`, error);
  }
};
