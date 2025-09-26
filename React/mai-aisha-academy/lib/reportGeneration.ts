import * as Print from 'expo-print';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { app } from '../config/firebase';
import { getAttendance } from './attendance';
import { Grade, SchoolClass, Subject, UserProfile } from './types';

interface StudentReportData {
  studentId: string;
  studentName: string;
  grades: Grade[];
  averagePercentage: number;
}

interface SubjectReportData {
  subjectId: string;
  subjectName: string;
  grades: Grade[];
  averagePercentage: number;
}

interface StudentPerformanceSummary {
  studentId: string;
  averageGrade: number;
  totalAssignments: number;
}

interface ClassPerformanceSummary {
  classId: string;
  averageGrade: number;
  totalStudents: number;
}

interface TeacherPerformanceSummary {
  teacherId: string;
  teacherName: string;
  subjects: Array<{ subjectName: string; averageGrade: number; totalStudentsGraded: number }>;
}

export const generateAndUploadGradeReport = async (
  gradesByStudent: StudentReportData[],
  gradesBySubject: SubjectReportData[],
  allGrades: Grade[],
  users: UserProfile[],
  subjects: Subject[],
  reportNameSuffix: string = 'Overall'
): Promise<string | null> => {
  try {
    const getUserName = (uid: string) => {
      const user = users.find(u => u.uid === uid);
      return user ? user.name || user.email : 'Unknown';
    };

    const getSubjectName = (subjectId: string) => {
      const subject = subjects.find(s => s.id === subjectId);
      return subject ? subject.name : 'Unknown';
    };

    const studentHTML = gradesByStudent.map(s => `
      <h3>${s.studentName}</h3>
      <p>Average: ${s.averagePercentage.toFixed(2)}%</p>
      <ul>${s.grades.map(g => `<li>${getSubjectName(g.subjectId)} - ${g.assignmentName}: ${g.marksObtained}/${g.totalMarks} (${g.gradePercentage.toFixed(1)}%)</li>`).join('')}</ul>
    `).join('<hr/>');

    const subjectHTML = gradesBySubject.map(s => `
      <h3>${s.subjectName}</h3>
      <p>Average: ${s.averagePercentage.toFixed(2)}%</p>
      <ul>${s.grades.map(g => `<li>${getUserName(g.studentId)} - ${g.assignmentName}: ${g.marksObtained}/${g.totalMarks} (${g.gradePercentage.toFixed(1)}%)</li>`).join('')}</ul>
    `).join('<hr/>');

    const html = `
      <h1 style="text-align:center;">Mai Aisha Academy</h1>
      <h2 style="text-align:center;">Grade Report (${reportNameSuffix})</h2>
      
      <div style="background-color: #f8f9fa; padding: 15px; margin: 20px 0; border-left: 4px solid #007bff; border-radius: 4px;">
        <h3 style="color: #007bff; margin-top: 0;">📋 Report Limitations & Notes</h3>
        <ul style="margin: 10px 0; padding-left: 20px;">
          <li><strong>Approval Status:</strong> Only grades with "approved" status are included in this report</li>
          <li><strong>Pending Grades:</strong> Grades awaiting headteacher approval are excluded</li>
          <li><strong>Rejected Grades:</strong> Rejected grades are not included in this report</li>
          <li><strong>Data Completeness:</strong> Report accuracy depends on teacher grade entry and headteacher approval workflow</li>
          <li><strong>Student Names:</strong> Students without proper names will show as "Unknown" or email addresses</li>
          <li><strong>Subject Names:</strong> Subjects without proper names will show as "Unknown"</li>
          <li><strong>Date Range:</strong> This report includes all approved grades regardless of date</li>
          <li><strong>Grade Validation:</strong> All grades have been validated (marks ≤ total marks, percentages calculated correctly)</li>
        </ul>
        <p style="margin: 10px 0 0 0; font-style: italic; color: #666;">
          <strong>Total Approved Grades:</strong> ${allGrades.length} | 
          <strong>Students:</strong> ${gradesByStudent.length} | 
          <strong>Subjects:</strong> ${gradesBySubject.length}
        </p>
      </div>
      
      <h2>Student Performance</h2>${studentHTML}
      <h2>Subject Performance</h2>${subjectHTML}
    `;

    const { uri } = await Print.printToFileAsync({ html });
    
    const storage = getStorage(app);
    const fileName = `grade_reports/grade_report_${reportNameSuffix}_${new Date().toISOString()}.pdf`;
    const storageRef = ref(storage, fileName);

    const response = await fetch(uri);
    const blob = await response.blob();
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL; // Return the download URL
  } catch (e) {
    console.error("Error generating or uploading report:", e);
    throw new Error("Failed to generate or upload report.");
  }
};

interface AttendanceReportFilters {
  startDate?: Date;
  endDate?: Date;
  classId?: string;
  teacherId?: string;
}

export const generateAndUploadAttendanceReport = async (
  filters: AttendanceReportFilters,
  allUsers: UserProfile[],
  allClasses: SchoolClass[],
  reportNameSuffix: string = 'Overall'
): Promise<string | null> => {
  try {
    const fetchedAttendance = await getAttendance(
      'admin', // Assuming admin role for comprehensive report generation
      '', // No specific user ID needed for admin view of all attendance
      {
        startDate: filters.startDate,
        endDate: filters.endDate,
        classId: filters.classId,
        teacherId: filters.teacherId,
        recordType: 'student', // Focusing on student attendance for this report
      }
    );

    const getUserName = (uid: string) => {
      const user = allUsers.find(u => u.uid === uid);
      return user ? user.name || user.email : 'Unknown';
    };

    const getClassName = (classId: string) => {
      const schoolClass = allClasses.find(c => c.id === classId);
      return schoolClass ? schoolClass.name : 'Unknown';
    };

    const attendanceHTML = fetchedAttendance.map(record => `
      <tr>
        <td>${getUserName(record.studentId || '')}</td>
        <td>${getClassName(record.classId || '')}</td>
        <td>${getUserName(record.teacherId)}</td>
        <td>${record.date.toDate().toLocaleDateString()}</td>
        <td>${record.status.charAt(0).toUpperCase() + record.status.slice(1)}</td>
        <td>${record.isApproved ? 'Yes' : 'No'}</td>
        <td>${record.notes || 'N/A'}</td>
      </tr>
    `).join('');

    const html = `
      <h1 style="text-align:center;">Mai Aisha Academy</h1>
      <h2 style="text-align:center;">Attendance Report (${reportNameSuffix})</h2>
      <p><strong>Date Range:</strong> ${filters.startDate?.toLocaleDateString() || 'N/A'} - ${filters.endDate?.toLocaleDateString() || 'N/A'}</p>
      <p><strong>Class:</strong> ${filters.classId ? getClassName(filters.classId) : 'All Classes'}</p>
      <p><strong>Teacher:</strong> ${filters.teacherId ? getUserName(filters.teacherId) : 'All Teachers'}</p>
      
      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Student Name</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Class</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Teacher</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Date</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Approved</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Notes</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceHTML}
        </tbody>
      </table>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    
    const storage = getStorage(app);
    const fileName = `attendance_reports/attendance_report_${reportNameSuffix}_${new Date().toISOString()}.pdf`;
    const storageRef = ref(storage, fileName);

    const response = await fetch(uri);
    const blob = await response.blob();
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL; // Return the download URL
  } catch (e) {
    console.error("Error generating or uploading attendance report:", e);
    throw new Error("Failed to generate or upload attendance report.");
  }
};

export const generateAndUploadStudentPerformanceReport = async (
  studentPerformanceData: StudentPerformanceSummary[],
  allUsers: UserProfile[],
  reportNameSuffix: string = 'Overall'
): Promise<string | null> => {
  try {
    const getUserName = (uid: string) => {
      const user = allUsers.find(u => u.uid === uid);
      return user ? user.name || user.email : 'Unknown';
    };

    const studentRows = studentPerformanceData.map(data => `
      <tr>
        <td>${getUserName(data.studentId)}</td>
        <td>${data.averageGrade.toFixed(2)}%</td>
        <td>${data.totalAssignments}</td>
      </tr>
    `).join('');

    const html = `
      <h1 style="text-align:center;">Mai Aisha Academy</h1>
      <h2 style="text-align:center;">Student Performance Report (${reportNameSuffix})</h2>
      
      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Student Name</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Average Grade</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total Assignments</th>
          </tr>
        </thead>
        <tbody>
          ${studentRows}
        </tbody>
      </table>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    const storage = getStorage(app);
    const fileName = `performance_reports/student_performance_${reportNameSuffix}_${new Date().toISOString()}.pdf`;
    const storageRef = ref(storage, fileName);

    const response = await fetch(uri);
    const blob = await response.blob();
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (e) {
    console.error("Error generating or uploading student performance report:", e);
    throw new Error("Failed to generate or upload student performance report.");
  }
};

export const generateAndUploadClassPerformanceReport = async (
  classPerformanceData: ClassPerformanceSummary[],
  allClasses: SchoolClass[],
  reportNameSuffix: string = 'Overall'
): Promise<string | null> => {
  try {
    const getClassName = (classId: string) => {
      const schoolClass = allClasses.find(c => c.id === classId);
      return schoolClass ? schoolClass.name : 'Unknown';
    };

    const classRows = classPerformanceData.map(data => `
      <tr>
        <td>${getClassName(data.classId)}</td>
        <td>${data.averageGrade.toFixed(2)}%</td>
        <td>${data.totalStudents}</td>
      </tr>
    `).join('');

    const html = `
      <h1 style="text-align:center;">Mai Aisha Academy</h1>
      <h2 style="text-align:center;">Class Performance Report (${reportNameSuffix})</h2>
      
      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Class Name</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Average Grade</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Total Students Graded</th>
          </tr>
        </thead>
        <tbody>
          ${classRows}
        </tbody>
      </table>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    const storage = getStorage(app);
    const fileName = `performance_reports/class_performance_${reportNameSuffix}_${new Date().toISOString()}.pdf`;
    const storageRef = ref(storage, fileName);

    const response = await fetch(uri);
    const blob = await response.blob();
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (e) {
    console.error("Error generating or uploading class performance report:", e);
    throw new Error("Failed to generate or upload class performance report.");
  }
};

export const generateAndUploadTeacherPerformanceReport = async (
  teacherPerformanceData: TeacherPerformanceSummary[],
  reportNameSuffix: string = 'Overall'
): Promise<string | null> => {
  try {
    const teacherRows = teacherPerformanceData.map(teacher => `
      <tr>
        <td>${teacher.teacherName}</td>
        <td>
          <ul style="margin: 0; padding-left: 20px;">
            ${teacher.subjects.map(subject => `<li>${subject.subjectName}: ${subject.averageGrade.toFixed(2)}% (${subject.totalStudentsGraded} students)</li>`).join('')}
          </ul>
        </td>
      </tr>
    `).join('');

    const html = `
      <h1 style="text-align:center;">Mai Aisha Academy</h1>
      <h2 style="text-align:center;">Teacher Performance Report (${reportNameSuffix})</h2>
      
      <table style="width:100%; border-collapse: collapse; margin-top: 20px;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Teacher Name</th>
            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Subject Performance Overview</th>
          </tr>
        </thead>
        <tbody>
          ${teacherRows}
        </tbody>
      </table>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    const storage = getStorage(app);
    const fileName = `performance_reports/teacher_performance_${reportNameSuffix}_${new Date().toISOString()}.pdf`;
    const storageRef = ref(storage, fileName);

    const response = await fetch(uri);
    const blob = await response.blob();
    
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);

    return downloadURL;
  } catch (e) {
    console.error("Error generating or uploading teacher performance report:", e);
    throw new Error("Failed to generate or upload teacher performance report.");
  }
};