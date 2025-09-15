import * as Print from 'expo-print';
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage';
import { app } from '../config/firebase';
import { Grade, Subject, UserProfile } from './types';

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
