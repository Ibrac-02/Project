import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { Student, StudentData, createStudent, deleteStudent, getStudentsByTeacher, updateStudent } from '../../lib/students';

interface ClassItem { // Placeholder for class data
  id: string;
  name: string;
}

export default function TeacherStudentManagementScreen() {
  const { user, role: userRole, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form states
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Placeholder classes (will be replaced with dynamic data later)
  const [availableClasses, setAvailableClasses] = useState<ClassItem[]>([
    { id: 'class001', name: 'Grade 8A' },
    { id: 'class002', name: 'Grade 9B' },
    { id: 'class003', name: 'Grade 10C' },
  ]);

  const fetchStudents = async () => {
    if (authLoading || !user || userRole !== 'teacher') return;
    setLoading(true);
    try {
      const fetchedStudents = await getStudentsByTeacher(user.uid);
      setStudents(fetchedStudents);
    } catch (error: any) {
      Alert.alert("Error", "Failed to fetch students: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user, userRole, authLoading]);

  const resetForm = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentEmail('');
    setSelectedClassId(availableClasses[0]?.id || ''); // Default to first class
    setContactNumber('');
    setNotes('');
  };

  const handleAddEditStudent = async () => {
    if (!user || !studentName || !selectedClassId) {
      Alert.alert("Error", "Student name and class are required.");
      return;
    }

    const studentData: StudentData = {
      name: studentName,
      classId: selectedClassId,
      teacherId: user.uid,
      email: studentEmail || '',
      contactNumber: contactNumber || '',
      notes: notes || '',
      // dateOfBirth and gender can be added to the form later if needed
    };

    try {
      if (editingStudent) {
        await updateStudent(editingStudent.id, studentData);
        Alert.alert("Success", "Student updated successfully!");
      } else {
        await createStudent(studentData);
        Alert.alert("Success", "Student added successfully!");
      }
      setIsModalVisible(false);
      resetForm();
      fetchStudents();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save student: " + error.message);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentEmail(student.email || '');
    setSelectedClassId(student.classId);
    setContactNumber(student.contactNumber || '');
    setNotes(student.notes || '');
    setIsModalVisible(true);
  };

  const handleDelete = async (studentId: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this student?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            try {
              await deleteStudent(studentId);
              Alert.alert("Success", "Student deleted successfully!");
              fetchStudents();
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete student: " + error.message);
            }
          }
        }
      ]
    );
  };

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading students...</Text>
      </View>
    );
  }

  if (userRole !== 'teacher') {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionDeniedText}>You do not have permission to manage students.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* <Text style={styles.pageTitle}>My Students</Text> */}

        <TouchableOpacity style={styles.addButton} onPress={() => { resetForm(); setIsModalVisible(true); }}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Student</Text>
        </TouchableOpacity>

        {students.length === 0 ? (
          <Text style={styles.noRecordsText}>No students added yet.</Text>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.studentCard}>
                <Text style={styles.studentName}>{item.name}</Text>
                <Text style={styles.studentDetail}>Class: {availableClasses.find(cls => cls.id === item.classId)?.name || item.classId}</Text>
                {item.email && <Text style={styles.studentDetail}>Email: {item.email}</Text>}
                {item.contactNumber && <Text style={styles.studentDetail}>Contact: {item.contactNumber}</Text>}
                {item.notes && <Text style={styles.studentDetail}>Notes: {item.notes}</Text>}
                <View style={styles.cardActions}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButtonEdit}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButtonDelete}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                    <Text style={styles.actionButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </ScrollView>

      {/* Add/Edit Student Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingStudent ? 'Edit Student' : 'Add New Student'}</Text>

            <Text style={styles.inputLabel}>Full Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Student Full Name"
              value={studentName}
              onChangeText={setStudentName}
            />

            <Text style={styles.inputLabel}>Class:</Text>
            <Picker
              selectedValue={selectedClassId}
              onValueChange={(itemValue) => setSelectedClassId(itemValue)}
              style={styles.picker}
            >
              {availableClasses.map((cls) => (
                <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
              ))}
            </Picker>

            <Text style={styles.inputLabel}>Email (Optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Student Email"
              value={studentEmail}
              onChangeText={setStudentEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>Contact Number (Optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Parent/Guardian Contact Number"
              value={contactNumber}
              onChangeText={setContactNumber}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Notes (Optional):</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Any additional notes about the "
              multiline
              value={notes}
              onChangeText={setNotes}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleAddEditStudent}>
                <Text style={styles.buttonText}>{editingStudent ? 'Update Student' : 'Add Student'}</Text>
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
  permissionDeniedText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
  },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#1E90FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noRecordsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 2,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  studentDetail: {
    fontSize: 15,
    color: '#555',
    marginBottom: 3,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
  },
  actionButtonEdit: {
    backgroundColor: '#FFC107',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonDelete: {
    backgroundColor: '#DC3545',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginLeft: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
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
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  picker: {
    height: 50,
    width: '100%',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
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
