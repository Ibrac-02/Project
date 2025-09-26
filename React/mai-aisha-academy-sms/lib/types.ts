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
  parentName?: string | null; // New field for students
  parentContactNumber?: string | null; // New field for students
  parentEmail?: string | null; // New field for students
  twoFactorEnabled?: boolean; // ✅ new field for 2FA
}

export interface SchoolInfo {
  id?: string; // Document ID, will likely be a fixed ID like 'schoolProfile'
  name: string;
  motto?: string;
  logoUrl?: string; // URL to the school logo in storage
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  // Add other relevant school-wide information fields as needed
}

export interface Subject {
  id: string;
  name: string;
  description?: string;
  teachers?: string[]; // Added field for assigning teachers
  teachersAssigned?: string[] | null; // Added field for assigning teachers
  // Add other fields as needed, e.g., classesOffered: string[]
}

export interface Notification {
  id: string;
  message: string;
  type: 'announcement' | 'assignment' | 'grade' | 'attendance' | 'attendance_warning' | 'performance_warning' | 'event' | 'other'; // Type of notification
  targetUserIds: string[]; // UIDs of users who should receive this notification
  readByUsers: string[]; // UIDs of users who have read this notification
  createdAt: string; // ISO string date
  link?: string; // Optional link to navigate to, e.g., '/(auth)/announcements'
}

export interface Grade {
  id: string;
  studentId: string;
  subjectId: string;
  subjectName: string; // Denormalized field for easier access
  teacherId: string; // The teacher who entered the grade
  assignmentName: string; // e.g., 'Mid-term Exam', 'Homework 1'
  marksObtained: number;
  totalMarks: number;
  score: number; // e.g., 85
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

// Department type used in admin school data screens
export interface Department {
  id: string;
  name: string;
  description?: string | null;
  headOfDepartmentId?: string | null;
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

export interface UploadedDocument {
  id: string;
  uploaderId: string;
  fileName: string;
  description?: string; // Optional description for the resource
  fileType: string;
  fileSize: number;
  downloadUrl: string;
  storagePath: string;
  uploadedAt: string;
}

export interface TimetableEntry {
  id: string;
  academicYearId: string;
  termId: string;
  classId: string;
  subjectId: string;
  teacherId: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string; // e.g., "08:00"
  endTime: string; // e.g., "09:00"
  roomLocation: string; // e.g., "Room 101", "Lab A"
  createdAt: string;
  updatedAt: string;
}
