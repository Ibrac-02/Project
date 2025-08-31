import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase'; // Assuming firebase.ts exports 'db'

// Data structure for an attendance record when creating or updating
export interface AttendanceData {
  classId?: string; // Identifier for the class
  teacherId: string; // UID of the teacher marking attendance
  studentId?: string; // UID of the student
  date: Timestamp; // Date of the attendance record
  status: 'present' | 'absent' | 'late' | 'excused';
  recordType: 'student' | 'teacher'; // New field: to differentiate between student and teacher attendance
  markedBy: string; // Name or ID of who marked it (could be teacher or admin)
  approvedBy?: string; // UID of headteacher who approved it
  approvedAt?: Timestamp; // Timestamp of approval
  isApproved: boolean;
  notes?: string; // Optional notes
}

// Full Attendance interface including Firestore generated fields
export interface Attendance extends AttendanceData {
  id: string;
  createdAt: Timestamp; // Timestamp when the record was first created
  updatedAt?: Timestamp; // Timestamp when the record was last updated
}

// Create an attendance record
export const createAttendance = async (data: AttendanceData): Promise<Attendance> => {
  try {
    // Ensure recordType is provided
    if (!data.recordType) {
      throw new Error('recordType is required for creating an attendance record.');
    }
    const docRef = await addDoc(collection(db, 'attendance'), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      isApproved: false, // Default to not approved
    });
    return { id: docRef.id, createdAt: Timestamp.now(), updatedAt: Timestamp.now(), ...data };
  } catch (error: any) {
    throw new Error('Failed to create attendance record: ' + error.message);
  }
};

// Get attendance records based on user role and filters
export const getAttendance = async (
  userRole: string,
  currentUserId: string,
  filters?: { classId?: string; studentId?: string; startDate?: Date; endDate?: Date; isApproved?: boolean; teacherId?: string; recordType?: 'student' | 'teacher' }
): Promise<Attendance[]> => {
  try {
    let q = query(collection(db, 'attendance'), orderBy('date', 'desc'), orderBy('createdAt', 'desc'));

    // Always filter by recordType if provided in filters
    if (filters?.recordType) {
      q = query(q, where('recordType', '==', filters.recordType));
    }

    // Apply role-based filters
    if (userRole === 'teacher') {
      // Teachers primarily see their own student attendance
      q = query(q, where('teacherId', '==', currentUserId));
      q = query(q, where('recordType', '==', 'student'));
      if (filters?.classId) {
        q = query(q, where('classId', '==', filters.classId));
      }
    } else if (userRole === 'headteacher') {
      // Headteachers can view both student and teacher attendance
      // No specific teacherId or recordType filter here, as they can view all
      if (filters?.classId) {
        q = query(q, where('classId', '==', filters.classId));
      }
      if (filters?.teacherId) {
        q = query(q, where('teacherId', '==', filters.teacherId));
      }
    } else if (userRole === 'admin') {
      // Admins can view all attendance records without specific role-based filtering
      if (filters?.classId) {
        q = query(q, where('classId', '==', filters.classId));
      }
      if (filters?.teacherId) {
        q = query(q, where('teacherId', '==', filters.teacherId));
      }
    }

    // Apply additional filters
    if (filters?.studentId) {
      q = query(q, where('studentId', '==', filters.studentId));
    }
    if (filters?.startDate) {
      q = query(q, where('date', '>=', Timestamp.fromDate(filters.startDate)));
    }
    if (filters?.endDate) {
      q = query(q, where('date', '<=', Timestamp.fromDate(filters.endDate)));
    }
    if (filters?.isApproved !== undefined) {
      q = query(q, where('isApproved', '==', filters.isApproved));
    }

    const querySnapshot = await getDocs(q);
    const attendanceRecords: Attendance[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as AttendanceData;
      attendanceRecords.push({ id: doc.id, createdAt: data.createdAt || Timestamp.now(), ...data });
    });
    return attendanceRecords;
  } catch (error: any) {
    throw new Error('Failed to get attendance records: ' + error.message);
  }
};

// Update an attendance record
export const updateAttendance = async (id: string, updates: Partial<AttendanceData>): Promise<void> => {
  try {
    const attendanceRef = doc(db, 'attendance', id);
    await updateDoc(attendanceRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error('Failed to update attendance record: ' + error.message);
  }
};

// Approve an attendance record (specific to Headteacher/Admin)
export const approveAttendance = async (attendanceId: string, approvedByUserId: string): Promise<void> => {
  try {
    const attendanceRef = doc(db, 'attendance', attendanceId);
    await updateDoc(attendanceRef, {
      isApproved: true,
      approvedBy: approvedByUserId,
      approvedAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
  } catch (error: any) {
    throw new Error('Failed to approve attendance record: ' + error.message);
  }
};

// Delete an attendance record (specific to Admin)
export const deleteAttendance = async (id: string): Promise<void> => {
  try {
    const attendanceRef = doc(db, 'attendance', id);
    await deleteDoc(attendanceRef);
  } catch (error: any) {
    throw new Error('Failed to delete attendance record: ' + error.message);
  }
};
