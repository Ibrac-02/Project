import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Attendance } from '../lib/attendance';
import { getUserNameById } from '../lib/auth'; // Assuming a function to get user name by ID
import { getStudentById } from '../lib/students'; // Assuming a function to get student by ID

interface AttendanceRecordCardProps {
  record: Attendance;
  onEdit?: (record: Attendance) => void;
  onApprove?: (id: string) => void;
  onDelete?: (id: string) => void;
  userRole: string;
  currentUserId: string;
  currentRecordType: 'student' | 'teacher';
}

export const AttendanceRecordCard: React.FC<AttendanceRecordCardProps> = ({ record, onEdit, onApprove, onDelete, userRole, currentUserId, currentRecordType }) => {
  const [studentName, setStudentName] = useState('N/A');
  const [teacherName, setTeacherName] = useState('N/A');
  const [markedByName, setMarkedByName] = useState('N/A');
  const [approvedByName, setApprovedByName] = useState('N/A');

  useEffect(() => {
    const fetchNames = async () => {
      // Fetch Student Name
      if (record.studentId) {
        const student = await getStudentById(record.studentId);
        setStudentName(student?.name || 'Unknown Student');
      }

      // Fetch Teacher Name
      if (record.teacherId) {
        const teacher = await getUserNameById(record.teacherId); // Assuming getUserNameById exists or create one
        setTeacherName(teacher || 'Unknown Teacher');
      }

      // Fetch Marked By Name
      if (record.markedBy) {
        const markedBy = await getUserNameById(record.markedBy); // Assuming markedBy is a UID
        setMarkedByName(markedBy || record.markedBy);
      }

      // Fetch Approved By Name
      if (record.approvedBy) {
        const approvedBy = await getUserNameById(record.approvedBy);
        setApprovedByName(approvedBy || 'Unknown User');
      }
    };

    fetchNames();
  }, [record.studentId, record.teacherId, record.markedBy, record.approvedBy]);

  const isTeacher = userRole === 'teacher';
  const isHeadteacher = userRole === 'headteacher';
  const isAdmin = userRole === 'admin';

  // Determine edit/approve/delete permissions based on role and record type
  let canEdit = false;
  let canApprove = false;
  let canDelete = false;

  if (currentRecordType === 'student') {
    canEdit = (isTeacher && record.teacherId === currentUserId) || isAdmin; // Teacher can edit their own student records, Admin can edit all
    canApprove = (isHeadteacher || isAdmin) && !record.isApproved; // Headteacher/Admin can approve student records
    canDelete = isAdmin; // Admin can delete all student records
  } else if (currentRecordType === 'teacher') {
    canEdit = (isHeadteacher && record.teacherId === currentUserId) || isAdmin; // Headteacher can edit teacher attendance, Admin can edit all
    canApprove = false; // Teacher attendance might be auto-approved or doesn't need explicit approval here
    canDelete = isAdmin; // Admin can delete all teacher records
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleDateString();
  };

  return (
    <View style={styles.card}>
      {record.recordType === 'student' && (
        <Text style={styles.title}>Student: {studentName} ({record.status.toUpperCase()}) - Date: {formatDate(record.date)}</Text>
      )}
      {record.recordType === 'teacher' && (
        <Text style={styles.title}>Teacher: {teacherName} ({record.status.toUpperCase()}) - Date: {formatDate(record.date)}</Text>
      )}

      {record.recordType === 'student' && (
        <Text style={styles.content}>Class: {record.classId}</Text>
      )}
      <Text style={styles.content}>Marked By: {markedByName} on {formatDate(record.createdAt)}</Text>
      {record.notes && <Text style={styles.content}>Notes: {record.notes}</Text>}
      {record.isApproved && (
        <Text style={styles.meta}>Approved By: {approvedByName} on {formatDate(record.approvedAt)}</Text>
      )}

      {(canEdit || canApprove || canDelete) && (
        <View style={styles.actions}>
          {canEdit && onEdit && (
            <TouchableOpacity onPress={() => onEdit(record)} style={styles.actionButton}>
              <Ionicons name="create-outline" size={20} color="#1E90FF" />
              <Text style={styles.actionButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
          {canApprove && onApprove && (
            <TouchableOpacity onPress={() => onApprove(record.id)} style={styles.actionButton}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#28a745" />
              <Text style={styles.actionButtonText}>Approve</Text>
            </TouchableOpacity>
          )}
          {canDelete && onDelete && (
            <TouchableOpacity onPress={() => onDelete(record.id)} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={20} color="#FF4500" />
              <Text style={styles.actionButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  content: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
  },
  meta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#1E90FF',
  },
});
