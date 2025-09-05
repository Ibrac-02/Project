import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase'; // Assuming firebase.ts exports 'db'

// Data structure for an attendance record when creating or updating
export interface AttendanceData {
  classId?: string; // Identifier for the class
  teacherId: string; // UID of the teacher marking attendance
  studentId?: string; // UID of the student
  date: Timestamp; // Date of the attendance record
  status: 'present' | 'absent' | 'late' | 'excused';
  recordType: 'student' | 'teacher'; // differentiate between student and teacher attendance
  markedBy: string; // Name or ID of who marked it
  approvedBy?: string; // UID of headteacher who approved it
  approvedAt?: Timestamp; // Timestamp of approval
  isApproved: boolean;
  notes?: string; // Optional notes
  createdAt?: Timestamp; // auto-added when record created
  updatedAt?: Timestamp; // auto-updated when record updated
}

// Full Attendance interface including Firestore generated fields
export interface Attendance extends AttendanceData {
  id: string;
}

// ✅ Create an attendance record
export const createAttendance = async (data: AttendanceData): Promise<Attendance> => {
  try {
    if (!data.recordType) {
      throw new Error('recordType is required for creating an attendance record.');
    }
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'attendance'), {
      ...data,
      createdAt: now,
      updatedAt: now,
      isApproved: false, // Default to not approved
    });
    return { id: docRef.id, ...data, createdAt: now, updatedAt: now, isApproved: false };
  } catch (error: any) {
    throw new Error('Failed to create attendance record: ' + error.message);
  }
};

// ✅ Get attendance records (restructured to avoid composite index)
export const getAttendance = async (
  userRole: string,
  currentUserId: string,
  filters?: {
    classId?: string;
    studentId?: string;
    startDate?: Date;
    endDate?: Date;
    isApproved?: boolean;
    teacherId?: string;
    recordType?: 'student' | 'teacher';
  }
): Promise<Attendance[]> => {
  try {
    // Start base query (⚠️ no orderBy here to avoid composite index)
    let q = query(collection(db, 'attendance'));

    // Always filter by recordType if provided
    if (filters?.recordType) {
      q = query(q, where('recordType', '==', filters.recordType));
    }

    // Role-based filters
    if (userRole === 'teacher') {
      q = query(q, where('teacherId', '==', currentUserId));
      q = query(q, where('recordType', '==', 'student'));
      if (filters?.classId) {
        q = query(q, where('classId', '==', filters.classId));
      }
    } else if (userRole === 'headteacher' || userRole === 'admin') {
      if (filters?.classId) {
        q = query(q, where('classId', '==', filters.classId));
      }
      if (filters?.teacherId) {
        q = query(q, where('teacherId', '==', filters.teacherId));
      }
    }

    // Extra filters
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
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as AttendanceData;
      attendanceRecords.push({
        id: docSnap.id,
        ...data,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt,
      });
    });

    // ✅ Sort in JS (date descending) instead of Firestore orderBy
    return attendanceRecords.sort((a, b) => b.date.toMillis() - a.date.toMillis());
  } catch (error: any) {
    throw new Error('Failed to get attendance records: ' + error.message);
  }
};

// ✅ Update an attendance record
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

// ✅ Approve an attendance record
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

// ✅ Delete an attendance record
export const deleteAttendance = async (id: string): Promise<void> => {
  try {
    const attendanceRef = doc(db, 'attendance', id);
    await deleteDoc(attendanceRef);
  } catch (error: any) {
    throw new Error('Failed to delete attendance record: ' + error.message);
  }
};
