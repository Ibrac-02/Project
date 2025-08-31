import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker'; // For date selection
import { Picker } from '@react-native-picker/picker'; // For selecting class, student, status
import { useLocalSearchParams } from 'expo-router';
import { collection, getDocs, query, Timestamp, where } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AttendanceRecordCard } from '../../components/AttendanceRecordCard';
import { approveAttendance, Attendance, AttendanceData, createAttendance, deleteAttendance, getAttendance, updateAttendance } from '../../lib/attendance';
import { useAuth } from '../../lib/auth';
import { db } from '../../lib/firebase';
import { getStudentsByTeacher, Student } from '../../lib/students';

// Placeholder for Class data (will be replaced with actual data fetching)
interface ClassItem {
  id: string;
  name: string;
}

export default function AttendanceScreen() {
  const { user, role: userRole, loading: authLoading } = useAuth();
  const { recordType: routeRecordType } = useLocalSearchParams(); // Read recordType from route
  const [attendanceRecords, setAttendanceRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMarkModalVisible, setIsMarkModalVisible] = useState(false);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Attendance | null>(null);

  const [currentRecordType, setCurrentRecordType] = useState<'student' | 'teacher'>((
    routeRecordType === 'teacher' || routeRecordType === 'student'
      ? routeRecordType
      : 'student' // Default to student attendance
  ));

  // Form states for marking/editing attendance
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedTeacherIdForMarking, setSelectedTeacherIdForMarking] = useState(user?.uid || ''); // For marking teacher attendance
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState<'present' | 'absent' | 'late' | 'excused'>('present');
  const [notes, setNotes] = useState('');

  // Filter states
  const [filterClassId, setFilterClassId] = useState('');
  const [filterStudentId, setFilterStudentId] = useState('');
  const [filterTeacherId, setFilterTeacherId] = useState(''); // For Headteacher/Admin
  const [filterStartDate, setFilterStartDate] = useState<Date | undefined>(undefined);
  const [filterEndDate, setFilterEndDate] = useState<Date | undefined>(undefined);
  const [filterIsApproved, setFilterIsApproved] = useState<boolean | undefined>(undefined);
  const [showFilterStartDatePicker, setShowFilterStartDatePicker] = useState(false);
  const [showFilterEndDatePicker, setShowFilterEndDatePicker] = useState(false);

  // Dynamic data states for pickers
  const [teacherClasses, setTeacherClasses] = useState<ClassItem[]>([]);
  const [studentsInSelectedClass, setStudentsInSelectedClass] = useState<Student[]>([]);
  const [allTeachers, setAllTeachers] = useState<Array<{ id: string; name: string }>>([]);

  // Dummy function for fetching classes (will be replaced with actual Firestore fetch)
  const fetchTeacherClasses = useCallback(async () => {
    if (!user || userRole !== 'teacher') return;
    // In a real scenario, this would fetch classes associated with the teacher from Firestore
    setTeacherClasses([
      { id: 'class001', name: 'Grade 8A' },
      { id: 'class002', name: 'Grade 9B' },
    ]);
    if (teacherClasses.length > 0 && !selectedClassId) {
      setSelectedClassId(teacherClasses[0].id);
    }
  }, [user, userRole, teacherClasses.length, selectedClassId]);

  const fetchStudentsInClass = useCallback(async (classId: string) => {
    if (!user || userRole !== 'teacher' || !classId) {
      setStudentsInSelectedClass([]);
      return;
    }
    try {
      const fetchedStudents = await getStudentsByTeacher(user.uid, classId);
      setStudentsInSelectedClass(fetchedStudents);
      if (fetchedStudents.length > 0 && !selectedStudentId) {
        setSelectedStudentId(fetchedStudents[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch students for class:", error);
      Alert.alert("Error", "Failed to load students.");
    }
  }, [user, userRole, selectedStudentId]);

  const fetchAllTeachers = useCallback(async () => {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const querySnapshot = await getDocs(q);
      const teachers = querySnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name || doc.data().email }));
      setAllTeachers(teachers);
    } catch (error) {
      console.error("Failed to fetch teachers:", error);
      Alert.alert("Error", "Failed to load teachers for filtering.");
    }
  }, []);

  const fetchAttendanceRecords = async (applyFilters = true) => {
    if (authLoading || !user || !userRole) return;
    setLoading(true);
    try {
      const filters: any = {};
      filters.recordType = currentRecordType; // Apply current record type filter

      if (applyFilters) {
        if (filterClassId) filters.classId = filterClassId;
        if (filterStudentId) filters.studentId = filterStudentId;
        if (filterTeacherId && (userRole === 'admin' || userRole === 'headteacher' || currentRecordType === 'teacher')) {
          filters.teacherId = filterTeacherId;
        }
        if (filterStartDate) filters.startDate = filterStartDate;
        if (filterEndDate) filters.endDate = filterEndDate;
        if (filterIsApproved !== undefined) filters.isApproved = filterIsApproved;
      }

      const fetchedRecords = await getAttendance(userRole, user.uid, filters);
      setAttendanceRecords(fetchedRecords);
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch attendance records: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentRecordType(
      routeRecordType === 'teacher' || routeRecordType === 'student'
        ? routeRecordType
        : 'student' // Default to student attendance if route param is missing or invalid
    );
  }, [routeRecordType]);

  useEffect(() => {
    fetchAttendanceRecords();
    if (currentRecordType === 'student' && userRole === 'teacher') {
      fetchTeacherClasses();
    } else if (userRole === 'headteacher' || userRole === 'admin' || currentRecordType === 'teacher') {
      fetchAllTeachers(); // Fetch all teachers for selection/filtering
    }
  }, [user, userRole, authLoading, currentRecordType, fetchTeacherClasses, fetchAllTeachers]);

  // Effect to fetch students when selectedClassId changes for teacher role
  useEffect(() => {
    if (userRole === 'teacher' && currentRecordType === 'student' && selectedClassId) {
      fetchStudentsInClass(selectedClassId);
    }
  }, [selectedClassId, userRole, currentRecordType, fetchStudentsInClass]);

  const handleMarkOrUpdateAttendance = async () => {
    if (!user || !selectedDate || !status) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    let attendanceData: AttendanceData;

    if (currentRecordType === 'student') {
      if (!selectedClassId || !selectedStudentId) {
        Alert.alert("Error", "Please select a class and student for student attendance.");
        return;
      }
      attendanceData = {
        classId: selectedClassId,
        teacherId: user.uid, // Assuming teacher marks their own class attendance
        studentId: selectedStudentId,
        date: Timestamp.fromDate(selectedDate),
        status,
        recordType: 'student',
        markedBy: user.email || user.uid, // Or user.displayName
        isApproved: userRole !== 'teacher', // Auto-approve if not teacher
        notes,
      };
    } else if (currentRecordType === 'teacher') {
      if (!selectedTeacherIdForMarking) {
        Alert.alert("Error", "Please select a teacher for teacher attendance.");
        return;
      }
      attendanceData = {
        teacherId: selectedTeacherIdForMarking, // The teacher whose attendance is being marked
        date: Timestamp.fromDate(selectedDate),
        status,
        recordType: 'teacher',
        markedBy: user.email || user.uid, // Or user.displayName
        isApproved: true, // Teacher attendance might be auto-approved or approved by admin/headteacher directly
        notes,
        // classId and studentId are not applicable for teacher attendance
      };
    } else {
      Alert.alert("Error", "Invalid record type.");
      return;
    }

    try {
      if (editingRecord) {
        await updateAttendance(editingRecord.id, attendanceData);
        Alert.alert("Success", "Attendance record updated successfully!");
      } else {
        await createAttendance(attendanceData);
        Alert.alert("Success", "Attendance marked successfully!");
      }
      setIsMarkModalVisible(false);
      resetForm();
      fetchAttendanceRecords();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save attendance: " + error.message);
    }
  };

  const handleEdit = (record: Attendance) => {
    setEditingRecord(record);
    setSelectedClassId(record.classId || '');
    setSelectedStudentId(record.studentId || '');
    setSelectedTeacherIdForMarking(record.teacherId || ''); // Set teacher ID for editing
    setSelectedDate(record.date.toDate());
    setStatus(record.status);
    setNotes(record.notes || '');
    setIsMarkModalVisible(true);
  };

  const handleApprove = async (id: string) => {
    if (!user || (!userRole === 'headteacher' && !userRole === 'admin')) {
      Alert.alert("Permission Denied", "You do not have permission to approve attendance.");
      return;
    }
    try {
      await approveAttendance(id, user.uid);
      Alert.alert("Success", "Attendance record approved.");
      fetchAttendanceRecords();
    } catch (error: any) {
      Alert.alert("Error", "Failed to approve attendance: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (userRole !== 'admin') {
      Alert.alert("Permission Denied", "Only Admins can delete attendance records.");
      return;
    }
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this attendance record?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            try {
              await deleteAttendance(id);
              Alert.alert("Success", "Attendance record deleted successfully!");
              fetchAttendanceRecords();
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete attendance record: " + error.message);
            }
          }
        }
      ]
    );
  };

  const resetForm = () => {
    setEditingRecord(null);
    setSelectedClassId('');
    setSelectedStudentId('');
    setSelectedTeacherIdForMarking(user?.uid || '');
    setSelectedDate(new Date());
    setStatus('present');
    setNotes('');
  };

  const canMarkAttendance = userRole === 'teacher' && currentRecordType === 'student';
  const canMarkTeacherAttendance = userRole === 'headteacher' && currentRecordType === 'teacher';
  const canViewFilters = userRole === 'admin' || userRole === 'headteacher';

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading attendance records...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.pageTitle}>
          {currentRecordType === 'teacher' ? 'Teacher Attendance Management' : 'Student Attendance Management'}
        </Text>

        <View style={styles.actionsHeader}>
          {canMarkAttendance && (
            <TouchableOpacity style={styles.actionButton} onPress={() => {
              resetForm();
              setIsMarkModalVisible(true);
            }}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Student Attendance</Text>
            </TouchableOpacity>
          )}
          {canMarkTeacherAttendance && (
            <TouchableOpacity style={styles.actionButton} onPress={() => {
              resetForm();
              setIsMarkModalVisible(true);
            }}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Mark Teacher Attendance</Text>
            </TouchableOpacity>
          )}
          {canViewFilters && (
            <TouchableOpacity style={styles.actionButton} onPress={() => setIsFilterModalVisible(true)}>
              <Ionicons name="filter-outline" size={24} color="#fff" />
              <Text style={styles.actionButtonText}>Filter</Text>
            </TouchableOpacity>
          )}
        </View>

        {attendanceRecords.length === 0 ? (
          <Text style={styles.noRecordsText}>No attendance records found.</Text>
        ) : (
          attendanceRecords.map((record) => (
            <AttendanceRecordCard
              key={record.id}
              record={record}
              onEdit={handleEdit}
              onApprove={handleApprove}
              onDelete={handleDelete}
              userRole={userRole}
              currentUserId={user?.uid || ''}
              currentRecordType={currentRecordType}
            />
          ))
        )}
      </ScrollView>

      {/* Mark/Edit Attendance Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isMarkModalVisible}
        onRequestClose={() => setIsMarkModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingRecord ? 'Edit Attendance' : 'Mark Attendance'}</Text>

            {currentRecordType === 'student' && (
              <>
                <Text style={styles.inputLabel}>Class:</Text>
                <Picker
                  selectedValue={selectedClassId}
                  onValueChange={(itemValue) => setSelectedClassId(itemValue)}
                  style={styles.picker}
                >
                  {teacherClasses.map((cls) => (
                    <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                  ))}
                </Picker>

                <Text style={styles.inputLabel}>Student:</Text>
                <Picker
                  selectedValue={selectedStudentId}
                  onValueChange={(itemValue) => setSelectedStudentId(itemValue)}
                  style={styles.picker}
                >
                  {studentsInSelectedClass.map((student) => (
                    <Picker.Item key={student.id} label={student.name} value={student.id} />
                  ))}
                </Picker>
              </>
            )}

            {currentRecordType === 'teacher' && (
              <>
                <Text style={styles.inputLabel}>Teacher:</Text>
                <Picker
                  selectedValue={selectedTeacherIdForMarking}
                  onValueChange={(itemValue) => setSelectedTeacherIdForMarking(itemValue)}
                  style={styles.picker}
                >
                  {allTeachers.map((teacher) => (
                    <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                  ))}
                </Picker>
              </>
            )}

            <Text style={styles.inputLabel}>Date:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>{selectedDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) setSelectedDate(date);
                }}
              />
            )}

            <Text style={styles.inputLabel}>Status:</Text>
            <Picker
              selectedValue={status}
              onValueChange={(itemValue: 'present' | 'absent' | 'late' | 'excused') => setStatus(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Present" value="present" />
              <Picker.Item label="Absent" value="absent" />
              <Picker.Item label="Late" value="late" />
              <Picker.Item label="Excused" value="excused" />
            </Picker>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes (Optional)"
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsMarkModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleMarkOrUpdateAttendance}>
                <Text style={styles.buttonText}>{editingRecord ? 'Update' : 'Mark'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Filter Attendance Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter Attendance</Text>

            {currentRecordType === 'student' && (
              <>
                <Text style={styles.inputLabel}>Class:</Text>
                <Picker
                  selectedValue={filterClassId}
                  onValueChange={(itemValue) => setFilterClassId(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Classes" value="" />
                  {teacherClasses.map((cls) => (
                    <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                  ))}
                </Picker>

                <Text style={styles.inputLabel}>Student:</Text>
                <Picker
                  selectedValue={filterStudentId}
                  onValueChange={(itemValue) => setFilterStudentId(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Students" value="" />
                  {studentsInSelectedClass.map((student) => (
                    <Picker.Item key={student.id} label={student.name} value={student.id} />
                  ))}
                </Picker>
              </>
            )}

            {(userRole === 'admin' || userRole === 'headteacher' || currentRecordType === 'teacher') && (
              <>
                <Text style={styles.inputLabel}>Teacher:</Text>
                <Picker
                  selectedValue={filterTeacherId}
                  onValueChange={(itemValue) => setFilterTeacherId(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="All Teachers" value="" />
                  {allTeachers.map((teacher) => (
                    <Picker.Item key={teacher.id} label={teacher.name} value={teacher.id} />
                  ))}
                </Picker>
              </>
            )}

            <Text style={styles.inputLabel}>Start Date:</Text>
            <TouchableOpacity onPress={() => setShowFilterStartDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>{filterStartDate ? filterStartDate.toLocaleDateString() : 'Select Date'}</Text>
              <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>
            {showFilterStartDatePicker && (
              <DateTimePicker
                value={filterStartDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowFilterStartDatePicker(false);
                  if (date) setFilterStartDate(date);
                }}
              />
            )}

            <Text style={styles.inputLabel}>End Date:</Text>
            <TouchableOpacity onPress={() => setShowFilterEndDatePicker(true)} style={styles.datePickerButton}>
              <Text style={styles.datePickerButtonText}>{filterEndDate ? filterEndDate.toLocaleDateString() : 'Select Date'}</Text>
              <Ionicons name="calendar-outline" size={20} color="#555" />
            </TouchableOpacity>
            {showFilterEndDatePicker && (
              <DateTimePicker
                value={filterEndDate || new Date()}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowFilterEndDatePicker(false);
                  if (date) setFilterEndDate(date);
                }}
              />
            )}

            <Text style={styles.inputLabel}>Approval Status:</Text>
            <Picker
              selectedValue={filterIsApproved === undefined ? 'all' : filterIsApproved ? 'approved' : 'unapproved'}
              onValueChange={(itemValue) => {
                if (itemValue === 'all') setFilterIsApproved(undefined);
                else if (itemValue === 'approved') setFilterIsApproved(true);
                else setFilterIsApproved(false);
              }}
              style={styles.picker}
            >
              <Picker.Item label="All Statuses" value="all" />
              <Picker.Item label="Approved" value="approved" />
              <Picker.Item label="Unapproved" value="unapproved" />
            </Picker>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsFilterModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => { fetchAttendanceRecords(); setIsFilterModalVisible(false); }}>
                <Text style={styles.buttonText}>Apply Filters</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  actionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    width: '100%',
  },
  actionButton: {
    backgroundColor: '#1E90FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noRecordsText: {
    textAlign: 'center',
    marginTop: 30,
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
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  datePickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#999',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
