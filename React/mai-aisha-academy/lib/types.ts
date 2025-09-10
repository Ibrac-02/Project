export interface UserProfile {
  uid: string;
  email: string | null;
  name: string | null;
  role: string | null;
  title?: string | null;
  contactNumber?: string | null;
  dateJoined?: string | null;
  status?: string | null;
  employeeId?: string | null;
  department?: string | null;
  teachersSupervised?: string | null;
  attendanceApprovals?: string | null;
  gradeApprovals?: string | null;
  subjects?: string[] | null; // New field, now an array of strings
  classes?: string | null; // New field
  qualifications?: string | null; // New field
  classesHandled?: string | null; // New field
  attendanceSubmitted?: string | null; // New field
  gradesSubmitted?: string | null; // New field
  twoFactorEnabled?: boolean; // ✅ new field for 2FA
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  teachersAssigned?: string[] | null; // Added field for assigning teachers
  // Add other fields as needed, e.g., classesOffered: string[]
}

export interface Notification {
  id: string;
  message: string;
  type: 'announcement' | 'assignment' | 'grade' | 'attendance' | 'other'; // Type of notification
  targetUserIds: string[]; // UIDs of users who should receive this notification
  readByUsers: string[]; // UIDs of users who have read this notification
  createdAt: string; // ISO string date
  link?: string; // Optional link to navigate to, e.g., '/(auth)/announcements'
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string; // The teacher who entered the grade
  assignmentName: string; // e.g., 'Mid-term Exam', 'Homework 1'
  marksObtained: number;
  totalMarks: number;
  gradePercentage: number; // Calculated field: (marksObtained / totalMarks) * 100
  status: 'pending' | 'approved' | 'rejected'; // For headteacher approval workflow
  comments?: string; // Optional comments from teacher or headteacher
  createdAt: string; // ISO string date
  updatedAt: string; // ISO string date
}

export interface SchoolClass {
  id: string;
  name: string;
  description?: string;
  teacherId?: string;
}

export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface Term {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
}

export interface Assignment {
  id: string;
  title: string;
  description?: string;
  subjectId: string;
  classId: string; // Assuming assignments are tied to a specific class
  teacherId: string;
  dueDate: string; // YYYY-MM-DD format
  totalMarks: number;
  createdAt: string;
}

export interface LessonPlan {
  id: string;
  title: string;
  subjectId: string;
  classId: string;
  teacherId: string;
  date: string; // YYYY-MM-DD format
  duration: number; // Duration in minutes
  objectives: string[]; // Learning objectives
  materials: string[]; // Required materials
  activities: LessonActivity[]; // Lesson activities
  assessment: string; // Assessment method
  homework?: string; // Optional homework
  notes?: string; // Additional notes
  status: 'draft' | 'completed' | 'reviewed';
  reviewedBy?: string; // Headteacher UID who reviewed
  reviewedAt?: string; // Review timestamp
  feedback?: string; // Headteacher feedback
  createdAt: string;
  updatedAt: string;
}

export interface LessonActivity {
  id: string;
  title: string;
  description: string;
  duration: number; // Duration in minutes
  type: 'introduction' | 'presentation' | 'practice' | 'assessment' | 'conclusion';
  order: number; // Order in the lesson
}
