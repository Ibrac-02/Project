import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'; // Added ScrollView
import { getAllUsers, UserProfile } from '../../lib/auth'; // Import getAllUsers and UserProfile
import { createSubject, deleteSubject, getAllSubjects, Subject, updateSubject } from '../../lib/subjects';

export default function HeadteacherManageSubjectsScreen() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]); // New state for teachers
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]); // New state for selected teacher UIDs

  const fetchAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fetchedSubjects, allUsers] = await Promise.all([
        getAllSubjects(),
        getAllUsers() // Fetch all users
      ]);
      setSubjects(fetchedSubjects);
      // Filter users to get only teachers
      const teacherUsers = allUsers.filter(user => user.role === 'teacher');
      setTeachers(teacherUsers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchAllData(); // Fetch all data on focus
    }, [fetchAllData])
  );

  const handleAddSubject = () => {
    setCurrentSubject(null);
    setSubjectName('');
    setSubjectDescription('');
    setSelectedTeachers([]); // Clear selected teachers for new subject
    setModalVisible(true);
  };

  const handleEditSubject = (subject: Subject) => {
    setCurrentSubject(subject);
    setSubjectName(subject.name);
    setSubjectDescription(subject.description || '');
    setSelectedTeachers(subject.teachersAssigned || []); // Set selected teachers for existing subject
    setModalVisible(true);
  };

  const handleSaveSubject = async () => {
    if (!subjectName.trim()) {
      Alert.alert("Error", "Subject name cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const subjectData = {
        name: subjectName,
        description: subjectDescription,
        teachersAssigned: selectedTeachers, // Include selected teachers
      };

      if (currentSubject) {
        await updateSubject(currentSubject.id, subjectData);
        Alert.alert("Success", "Subject updated successfully.");
      } else {
        await createSubject(subjectName, subjectDescription, selectedTeachers); // Pass selectedTeachers
        Alert.alert("Success", "Subject created successfully.");
      }
      setModalVisible(false);
      fetchAllData(); // Refresh all data
    } catch (err: any) {
      Alert.alert("Error", `Failed to save subject: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    Alert.alert(
      "Delete Subject",
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteSubject(id);
              Alert.alert("Success", `${name} deleted successfully.`);
              fetchAllData(); // Refresh all data
            } catch (err: any) {
              Alert.alert("Error", `Failed to delete ${name}: ${err.message}`);
            }
          },
        },
      ]
    );
  };

  const toggleTeacherSelection = (teacherUid: string) => {
    setSelectedTeachers(prev =>
      prev.includes(teacherUid) ? prev.filter(uid => uid !== teacherUid) : [...prev, teacherUid]
    );
  };

  const renderSubjectItem = ({ item }: { item: Subject }) => (
    <View style={styles.subjectCard}>
      <View style={styles.subjectInfo}>
        <Text style={styles.subjectName}>{item.name}</Text>
        {item.description && <Text style={styles.subjectDescription}>{item.description}</Text>}
        {item.teachersAssigned && item.teachersAssigned.length > 0 && (
          <Text style={styles.assignedTeachers}>
            Assigned Teachers: {item.teachersAssigned.map(uid => {
              const teacher = teachers.find(t => t.uid === uid);
              return teacher ? teacher.name || teacher.email : 'Unknown';
            }).join(', ')}
          </Text>
        )}
      </View>
      <View style={styles.subjectActions}>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleEditSubject(item)}>
          <Ionicons name="pencil-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => handleDeleteSubject(item.id, item.name)}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading subjects and teachers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchAllData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Subjects</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddSubject}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Subject</Text>
      </TouchableOpacity>

      {subjects.length === 0 ? (
        <View style={styles.centered}>
          <Text>No subjects found.</Text>
          <TouchableOpacity onPress={fetchAllData} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={subjects}
          keyExtractor={(item) => item.id}
          renderItem={renderSubjectItem}
          contentContainerStyle={styles.listContentContainer}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{currentSubject ? 'Edit Subject' : 'Add New Subject'}</Text>
              <TextInput
                style={styles.input}
                placeholder="Subject Name"
                value={subjectName}
                onChangeText={setSubjectName}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Subject Description (Optional)"
                value={subjectDescription}
                onChangeText={setSubjectDescription}
                multiline
                numberOfLines={4}
              />

              <Text style={styles.label}>Assign Teachers:</Text>
              {teachers.length === 0 ? (
                <Text>No teachers available to assign.</Text>
              ) : (
                <View style={styles.teachersList}>
                  {teachers.map((teacher) => (
                    <TouchableOpacity
                      key={teacher.uid}
                      style={styles.teacherItem}
                      onPress={() => toggleTeacherSelection(teacher.uid)}
                    >
                      <Ionicons
                        name={selectedTeachers.includes(teacher.uid) ? 'checkbox-outline' : 'square-outline'}
                        size={24}
                        color={selectedTeachers.includes(teacher.uid) ? '#1E90FF' : '#333'}
                      />
                      <Text style={styles.teacherName}>{teacher.name || teacher.email}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveSubject}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1E90FF',
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
  listContentContainer: {
    paddingBottom: 20,
  },
  subjectCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  subjectDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  assignedTeachers: {
    fontSize: 14,
    color: '#1E90FF',
    marginTop: 5,
    fontStyle: 'italic',
  },
  subjectActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    // maxHeight: '80%', // Removed to allow ScrollView to manage height
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  teachersList: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    maxHeight: 150,
  },
  teacherItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  teacherName: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
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
