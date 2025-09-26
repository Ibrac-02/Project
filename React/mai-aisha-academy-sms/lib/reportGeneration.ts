// lib/reportGeneration.ts
import * as Print from 'expo-print';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { Grade, UserProfile, SchoolClass, Subject } from './types';

// Generate HTML from data for printing
const generateHTML = (title: string, content: string) => `
  <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ccc; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${content}
    </body>
  </html>
`;

export const generateAndUploadGradeReport = async (
  student: UserProfile,
  grades: Grade[]
): Promise<string> => {
  try {
    let content = '<table><tr><th>Subject</th><th>Grade</th></tr>';
    grades.forEach(g => {
      content += `<tr><td>${g.subjectName}</td><td>${g.score}</td></tr>`;
    });
    content += '</table>';

    const html = generateHTML(`Grade Report - ${student.name}`, content);
    const { uri } = await Print.printToFileAsync({ html });
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, `reports/grades/${student.uid}.pdf`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate grade report.');
  }
};

// removed legacy student-based attendance report to avoid redeclaration

export const generateAndUploadStudentPerformanceReport = async (
  studentId: string | undefined,
  grades: Grade[],
  users: UserProfile[],
  subjects: Subject[]
): Promise<string> => {
  try {
    const student = users.find(u => u.uid === studentId);
    const studentName = student?.name || student?.email || studentId || 'Unknown Student';
    const studentGrades = studentId ? grades.filter(g => g.studentId === studentId) : grades;
    let content = '<h2>Grades</h2><table><tr><th>Subject</th><th>Score</th></tr>';
    studentGrades.forEach(g => {
      content += `<tr><td>${g.subjectName || subjects.find(s => s.id === g.subjectId)?.name || g.subjectId}</td><td>${g.score}</td></tr>`;
    });
    content += '</table>';

    const html = generateHTML(`Student Performance Report - ${studentName}`, content);
    const { uri } = await Print.printToFileAsync({ html });
    const response = await fetch(uri);
    const blob = await response.blob();

    const storageRef = ref(storage, `reports/performance/${studentId || 'all-students'}.pdf`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate performance report.');
  }
};

// Class Performance Report
export const generateAndUploadClassPerformanceReport = async (
  classId: string | undefined,
  grades: Grade[],
  users: UserProfile[],
  classes: SchoolClass[],
  subjects: Subject[]
): Promise<string> => {
  try {
    const className = classId ? (classes.find(c => c.id === classId)?.name || classId) : 'All Classes';
    let content = `<h2>Class: ${className}</h2>`;
    content += '<table><tr><th>Student</th><th>Subject</th><th>Score</th></tr>';
    grades.forEach(g => {
      const studentName = users.find(u => u.uid === g.studentId)?.name || users.find(u => u.uid === g.studentId)?.email || g.studentId;
      const subjectName = g.subjectName || subjects.find(s => s.id === g.subjectId)?.name || g.subjectId;
      content += `<tr><td>${studentName}</td><td>${subjectName}</td><td>${g.score}</td></tr>`;
    });
    content += '</table>';

    const html = generateHTML(`Class Performance Report - ${className}`, content);
    const { uri } = await Print.printToFileAsync({ html });
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `reports/performance/class-${classId || 'all'}.pdf`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate class performance report.');
  }
};

// Teacher Performance Report
export const generateAndUploadTeacherPerformanceReport = async (
  teacherId: string | undefined,
  grades: Grade[],
  users: UserProfile[],
  subjects: Subject[],
  classes: SchoolClass[]
): Promise<string> => {
  try {
    const teacher = users.find(u => u.uid === teacherId);
    const teacherName = teacher?.name || teacher?.email || teacherId || 'All Teachers';
    const teacherGrades = teacherId ? grades.filter(g => g.teacherId === teacherId) : grades;
    let content = '<table><tr><th>Subject</th><th>Student</th><th>Score</th></tr>';
    teacherGrades.forEach(g => {
      const studentName = users.find(u => u.uid === g.studentId)?.name || users.find(u => u.uid === g.studentId)?.email || g.studentId;
      const subjectName = g.subjectName || subjects.find(s => s.id === g.subjectId)?.name || g.subjectId;
      content += `<tr><td>${subjectName}</td><td>${studentName}</td><td>${g.score}</td></tr>`;
    });
    content += '</table>';

    const html = generateHTML(`Teacher Performance Report - ${teacherName}`, content);
    const { uri } = await Print.printToFileAsync({ html });
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `reports/performance/teacher-${teacherId || 'all'}.pdf`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate teacher performance report.');
  }
};

// Attendance Report (aggregate by date range / filters)
export const generateAndUploadAttendanceReport = async (
  params: { startDate: Date; endDate: Date; classId?: string; teacherId?: string },
  users: UserProfile[],
  classes: SchoolClass[],
  reportType: string
): Promise<string> => {
  try {
    const { startDate, endDate, classId, teacherId } = params;
    const className = classId ? (classes.find(c => c.id === classId)?.name || classId) : 'All Classes';
    const teacherName = teacherId ? (users.find(u => u.uid === teacherId)?.name || users.find(u => u.uid === teacherId)?.email || teacherId) : 'All Teachers';
    const content = `
      <p>Report Type: ${reportType}</p>
      <p>From: ${startDate.toDateString()} To: ${endDate.toDateString()}</p>
      <p>Class: ${className}</p>
      <p>Teacher: ${teacherName}</p>
      <p>Note: Detailed attendance rows can be added by fetching attendance records.</p>
    `;
    const html = generateHTML('Attendance Report', content);
    const { uri } = await Print.printToFileAsync({ html });
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, `reports/attendance/attendance-${Date.now()}.pdf`);
    await uploadBytes(storageRef, blob);
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (err) {
    console.error(err);
    throw new Error('Failed to generate attendance report.');
  }
};
