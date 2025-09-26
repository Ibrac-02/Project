import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { createUserWithEmailAndPassword, deleteUserAccount, getAllUsers, updateUserProfile, useAuth } from '../../lib/auth';
import { getAllClasses, getAllDepartments } from '../../lib/schoolData';
import { Department, SchoolClass, UserProfile } from '../../lib/types';

export default function ManageTeachersScreen() {
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [allDepartments, setAllDepartments] = useState<Department[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<UserProfile | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formConfirmPassword, setFormConfirmPassword] = useState('');
  const [formContactNumber, setFormContactNumber] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState<string | undefined>(undefined);
  const [formAssignedClasses, setFormAssignedClasses] = useState<string[]>([]);

  const fetchTeachersAndData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersData, classesData, departmentsData] = await Promise.all([
        getAllUsers(),
        getAllClasses(),
        getAllDepartments(),
      ]);
      const fetchedTeachers = usersData.filter(u => u.role === 'teacher');
      setTeachers(fetchedTeachers);
      setAllClasses(classesData);
      setAllDepartments(departmentsData);
    } catch (err: any) {
      console.error("Error fetching teachers and school data:", err);
      setError("Failed to load teachers and school data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchTeachersAndData();
    }
  }, [authLoading, fetchTeachersAndData]);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormConfirmPassword('');
    setFormContactNumber('');
    setFormDepartmentId(undefined);
    setFormAssignedClasses([]);
    setEditingTeacher(null);
  };

  const handleAddTeacher = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const handleEditTeacher = (teacher: UserProfile) => {
    setEditingTeacher(teacher);
    setFormName(teacher.name || '');
    setFormEmail(teacher.email || '');
    setFormContactNumber(teacher.contactNumber || '');
    setFormDepartmentId(teacher.department || undefined);
    setFormAssignedClasses(teacher.classesHandled || []);
    setIsModalVisible(true);
  };

  const handleSaveTeacher = async () => {
    if (!user?.uid || role !== 'headteacher') {
      Alert.alert("Permission Denied", "Only headteachers can manage teacher accounts.");
      return;
    }

    if (!formName.trim() || !formEmail.trim()) {
      Alert.alert("Error", "Name and Email are required.");
      return;
    }

    if (!editingTeacher && (!formPassword.trim() || formPassword.length < 6)) {
      Alert.alert("Error", "Password is required and must be at least 6 characters for new teachers.");
      return;
    }

    if (!editingTeacher && formPassword !== formConfirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (editingTeacher) {
        // Update existing teacher
        await updateUserProfile(editingTeacher.uid, {
          name: formName,
          email: formEmail,
          contactNumber: formContactNumber,
          department: formDepartmentId,
          classesHandled: formAssignedClasses,
        });
        Alert.alert("Success", "Teacher details updated successfully!");
      } else {
        // Create new teacher
        const newTeacherUser = await createUserWithEmailAndPassword(formEmail, formPassword, formName, 'teacher');
        if (newTeacherUser) {
          await updateUserProfile(newTeacherUser.uid, {
            contactNumber: formContactNumber,
            department: formDepartmentId,
            classesHandled: formAssignedClasses,
          });
          Alert.alert("Success", "New teacher account created and details saved!");
        } else {
          throw new Error("Failed to create user.");
        }
      }
      setIsModalVisible(false);
      fetchTeachersAndData();
    } catch (err: any) {
      console.error("Error saving teacher:", err);
      Alert.alert("Error", `Failed to save teacher: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeacher = async (teacherId: string) => {
    if (!user?.uid || role !== 'headteacher') {
      Alert.alert("Permission Denied", "Only headteachers can delete teacher accounts.");
      return;
    }

    Alert.alert(
      "Delete Teacher",
      "Are you sure you want to delete this teacher account? This action cannot be undone and will remove all associated data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteUserAccount(teacherId); // Assuming this also cleans up profile from Firestore
              Alert.alert("Success", "Teacher account deleted.");
              fetchTeachersAndData();
            } catch (err: any) {
              console.error("Error deleting teacher:", err);
              Alert.alert("Error", `Failed to delete teacher: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading teacher data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchTeachersAndData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Manage Teachers</Text>
      </View>

      <TouchableOpacity onPress={handleAddTeacher} style={styles.addButton}>
        <Ionicons name="person-add-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Teacher</Text>
      </TouchableOpacity>

      {teachers.length === 0 ? (
        <Text style={styles.noDataText}>No teachers registered yet.</Text>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item.uid}
          renderItem={({ item: teacher }) => (
            <View style={styles.teacherCard}>
              <View style={styles.teacherInfo}>
                <Ionicons name="person-circle-outline" size={24} color="#1E90FF" />
                <View style={styles.teacherTextContent}>
                  <Text style={styles.teacherName}>{teacher.name || teacher.email}</Text>
                  <Text style={styles.teacherEmail}>{teacher.email}</Text>
                  {teacher.department && (
                    <Text style={styles.teacherDetail}>Dept: {allDepartments.find(d => d.id === teacher.department)?.name || 'Unknown'}</Text>
                  )}
                  {teacher.classesHandled && teacher.classesHandled.length > 0 && (
                    <Text style={styles.teacherDetail}>Classes: {teacher.classesHandled.map(classId => allClasses.find(c => c.id === classId)?.name || 'Unknown').join(', ')}</Text>
                  )}
                </View>
              </View>
              <View style={styles.teacherActions}>
                <TouchableOpacity onPress={() => handleEditTeacher(teacher)} style={styles.actionButton}>
                  <Ionicons name="pencil-outline" size={20} color="#1E90FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDeleteTeacher(teacher.uid)} style={styles.actionButton}>
                  <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add/Edit Teacher Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}</Text>
              
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={formName}
                onChangeText={setFormName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={formEmail}
                onChangeText={setFormEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!editingTeacher} // Email should not be editable for existing users
              />
              {!editingTeacher && (
                <>
                  <TextInput
                    style={styles.input}
                    placeholder="Password (min 6 characters)"
                    value={formPassword}
                    onChangeText={setFormPassword}
                    secureTextEntry
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Confirm Password"
                    value={formConfirmPassword}
                    onChangeText={setFormConfirmPassword}
                    secureTextEntry
                  />
                </>
              )}
              <TextInput
                style={styles.input}
                placeholder="Contact Number (Optional)"
                value={formContactNumber}
                onChangeText={setFormContactNumber}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Department (Optional):</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formDepartmentId}
                  onValueChange={(itemValue) => setFormDepartmentId(itemValue as string)}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Select Department --" value={undefined} />
                  {allDepartments.map(dept => (
                    <Picker.Item key={dept.id} label={dept.name} value={dept.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Assigned Classes (Select multiple):</Text>
              <View style={styles.classesSelectionContainer}>
                {allClasses.map(cls => (
                  <TouchableOpacity
                    key={cls.id}
                    style={[
                      styles.classOption,
                      formAssignedClasses.includes(cls.id) && styles.classOptionSelected,
                    ]}
                    onPress={() => {
                      setFormAssignedClasses(prev =>
                        prev.includes(cls.id) ? prev.filter(id => id !== cls.id) : [...prev, cls.id]
                      );
                    }}
                  >
                    <Text style={styles.classOptionText}>{cls.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveTeacher}>
                  <Text style={styles.buttonText}>{editingTeacher ? 'Update' : 'Add Teacher'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 15,
  },
  header: {
    backgroundColor: '#FFD700',
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
    color: '#333',
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
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  teacherCard: {
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
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  teacherTextContent: {
    marginLeft: 10,
    flex: 1,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  teacherDetail: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  teacherActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
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
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
    fontSize: 16,
  },
  pickerWrapper: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  classesSelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    width: '100%',
    marginBottom: 15,
  },
  classOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E90FF',
    marginRight: 10,
    marginBottom: 10,
  },
  classOptionSelected: {
    backgroundColor: '#1E90FF',
  },
  classOptionText: {
    color: '#1E90FF',
    fontSize: 14,
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
    backgroundColor: '#FFD700',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

