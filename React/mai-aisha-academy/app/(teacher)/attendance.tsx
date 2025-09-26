import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createAttendanceRecord, deleteAttendanceRecord, getAttendance, updateAttendanceRecord } from '../../lib/attendance';
import { useAuth } from '../../lib/auth';
import { getAllClasses } from '../../lib/schoolData';
import { getStudentsByTeacher, Student } from '../../lib/students';
import { AttendanceRecord, SchoolClass } from '../../lib/types';

const AttendanceStatusOptions = [
  { label: 'Present', value: 'present' },
  { label: 'Absent', value: 'absent' },
  { label: 'Late', value: 'late' },
  { label: 'Excused', value: 'excused' },
];

export default function TeacherAttendanceScreen() {
  const { user, role, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [studentsInSelectedClass, setStudentsInSelectedClass] = useState<Student[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [isRecordModalVisible, setRecordModalVisible] = useState(false);
  const [currentAttendanceRecord, setCurrentAttendanceRecord] = useState<AttendanceRecord | null>(null);
  const [formStatus, setFormStatus] = useState<AttendanceRecord['status']>('present');
  const [formNotes, setFormNotes] = useState('');
  const [formStudentId, setFormStudentId] = useState<string | undefined>(undefined);
  const [formStudentName, setFormStudentName] = useState('');

  const fetchTeacherClasses = useCallback(async () => {
    if (!user?.uid || !userProfile?.classesHandled) return;

    try {
      const allSchoolClasses = await getAllClasses();
      const assignedClasses = allSchoolClasses.filter(cls => userProfile.classesHandled?.includes(cls.id));
      setTeacherClasses(assignedClasses);

      if (assignedClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(assignedClasses[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching teacher's classes:", err);
      setError("Failed to load your classes.");
    }
  }, [user?.uid, userProfile?.classesHandled, selectedClassId]);

  const fetchStudentsAndAttendance = useCallback(async () => {
    if (!selectedClassId || !user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const students = await getStudentsByTeacher(user.uid);
      const filteredStudents = students.filter(s => s.classId === selectedClassId);
      setStudentsInSelectedClass(filteredStudents);

      const records = await getAttendance('teacher', user.uid, { classId: selectedClassId, date: selectedDate });
      setAttendanceRecords(records);

      // Pre-fill attendance status for students not yet marked
      if (filteredStudents.length > 0 && records.length < filteredStudents.length) {
        const markedStudentIds = new Set(records.map(r => r.studentId));
        filteredStudents.forEach(student => {
          if (!markedStudentIds.has(student.id)) {
            // Optionally create a pending/default record here or handle on UI
          }
        });
      }
    } catch (err: any) {
      console.error("Error fetching students or attendance:", err);
      setError("Failed to load students or attendance.");
    }
    setLoading(false);
  }, [selectedClassId, user?.uid, selectedDate]);

  useEffect(() => {
    if (!authLoading) {
      fetchTeacherClasses();
    }
  }, [authLoading, fetchTeacherClasses]);

  useEffect(() => {
    fetchStudentsAndAttendance();
  }, [fetchStudentsAndAttendance]);

  const handleMarkAttendance = (student: Student) => {
    setCurrentAttendanceRecord(null);
    setFormStudentId(student.id);
    setFormStudentName(student.name || student.email || 'Unknown');
    setFormStatus('present');
    setFormNotes('');
    setRecordModalVisible(true);
  };

  const handleEditAttendance = (record: AttendanceRecord) => {
    setCurrentAttendanceRecord(record);
    setFormStudentId(record.studentId);
    setFormStudentName(studentsInSelectedClass.find(s => s.id === record.studentId)?.name || record.studentId);
    setFormStatus(record.status);
    setFormNotes(record.notes || '');
    setRecordModalVisible(true);
  };

  const handleSaveAttendance = async () => {
    if (!formStudentId || !selectedClassId || !user?.uid) {
      Alert.alert("Error", "Missing required data for attendance record.");
      return;
    }

    setLoading(true);
    try {
      const commonData = {
        studentId: formStudentId,
        classId: selectedClassId,
        teacherId: user.uid,
        date: selectedDate, // Use the selected date from state
        status: formStatus,
        notes: formNotes,
      };

      if (currentAttendanceRecord) {
        await updateAttendanceRecord(currentAttendanceRecord.id, { ...commonData, isApproved: currentAttendanceRecord.isApproved });
        Alert.alert("Success", "Attendance record updated successfully.");
      } else {
        await createAttendanceRecord({ ...commonData, isApproved: false }); // Teachers create, Headteacher approves
        Alert.alert("Success", "Attendance marked successfully.");
      }
      setRecordModalVisible(false);
      fetchStudentsAndAttendance(); // Refresh list
    } catch (err: any) {
      console.error("Error saving attendance:", err);
      Alert.alert("Error", `Failed to save attendance: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAttendance = async (recordId: string) => {
    Alert.alert(
      "Delete Record",
      "Are you sure you want to delete this attendance record?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAttendanceRecord(recordId);
              Alert.alert("Success", "Attendance record deleted.");
              fetchStudentsAndAttendance();
            } catch (err: any) {
              console.error("Error deleting attendance record:", err);
              Alert.alert("Error", `Failed to delete record: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const onDateChange = (event: any, selected: Date | undefined) => {
    const currentDate = selected || selectedDate;
    setShowDatePicker(false);
    setSelectedDate(currentDate);
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading attendance...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchStudentsAndAttendance} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Attendance Management</Text>
      </View>

      <View style={styles.controlsContainer}>
        <View style={styles.pickerWrapper}>
          <Picker
            selectedValue={selectedClassId}
            onValueChange={(itemValue) => setSelectedClassId(itemValue as string)}
            style={styles.picker}
          >
            {teacherClasses.map(cls => (
              <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
            ))}
          </Picker>
        </View>

        <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
          <Ionicons name="calendar-outline" size={20} color="#1E90FF" />
          <Text style={styles.datePickerButtonText}>{selectedDate.toLocaleDateString()}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}
      </View>

      <FlatList
        data={studentsInSelectedClass}
        keyExtractor={(item) => item.id}
        renderItem={({ item: student }) => {
          const record = attendanceRecords.find(r => r.studentId === student.id);
          return (
            <View style={styles.studentCard}>
              <Text style={styles.studentName}>{student.name || student.email}</Text>
              <View style={styles.attendanceActions}>
                {record ? (
                  <>
                    <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                      {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      {record.isApproved ? ' (Approved)' : ''}
                    </Text>
                    <TouchableOpacity onPress={() => handleEditAttendance(record)} style={styles.actionButton}>
                      <Ionicons name="pencil-outline" size={20} color="#1E90FF" />
                    </TouchableOpacity>
                    {/* Teachers can delete their own unapproved entries */}
                    {!record.isApproved && record.teacherId === user?.uid && (
                      <TouchableOpacity onPress={() => handleDeleteAttendance(record.id)} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </>
                ) : (
                  <TouchableOpacity onPress={() => handleMarkAttendance(student)} style={styles.markButton}>
                    <Text style={styles.markButtonText}>Mark Attendance</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={<Text style={styles.noDataText}>No students in this class or no class selected.</Text>}
      />

      {/* Attendance Record Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isRecordModalVisible}
        onRequestClose={() => setRecordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentAttendanceRecord ? 'Edit Attendance' : 'Mark Attendance'}</Text>
            <Text style={styles.modalStudentName}>Student: {formStudentName}</Text>
            
            <Text style={styles.label}>Status:</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={formStatus}
                onValueChange={(itemValue) => setFormStatus(itemValue as AttendanceRecord['status'])}
                style={styles.picker}
              >
                {AttendanceStatusOptions.map(option => (
                  <Picker.Item key={option.value} label={option.label} value={option.value} />
                ))}
              </Picker>
            </View>

            <Text style={styles.label}>Notes (Optional):</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any relevant notes"
              value={formNotes}
              onChangeText={setFormNotes}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setRecordModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveAttendance}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const getStatusColor = (status: AttendanceRecord['status']) => {
  switch (status) {
    case 'present': return '#4CAF50'; // Green
    case 'absent': return '#F44336';  // Red
    case 'late': return '#FFC107';    // Amber
    case 'excused': return '#2196F3'; // Blue
    default: return '#333';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 15,
  },
  header: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    alignItems: 'center',
  },
  pickerWrapper: {
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  datePickerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  attendanceActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 15,
    fontWeight: 'bold',
    marginRight: 10,
  },
  markButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  markButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalStudentName: {
    fontSize: 18,
    marginBottom: 20,
    color: '#555',
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
    fontSize: 16,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

