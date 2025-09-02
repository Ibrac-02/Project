import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createAssignment, deleteAssignment, getAssignmentsByTeacher, updateAssignment } from '../../lib/assignments';
import { useAuth } from '../../lib/auth';
import { getAllClasses, SchoolClass } from '../../lib/schoolData';
import { getTeacherSubjects, Subject } from '../../lib/subjects';
import { Assignment } from '../../lib/types';

export default function ManageAssignmentsScreen() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState('0');

  const fetchAssignmentsAndSubjects = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const fetchedAssignments = await getAssignmentsByTeacher(user.uid);
      setAssignments(fetchedAssignments);

      const fetchedSubjects = await getTeacherSubjects(user.uid);
      setSubjects(fetchedSubjects);

      const fetchedClasses = await getAllClasses();
      setClasses(fetchedClasses);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchAssignmentsAndSubjects();
    }, [fetchAssignmentsAndSubjects])
  );

  const handleAddAssignment = () => {
    setCurrentAssignment(null);
    setTitle('');
    setDescription('');
    setSelectedSubjectId(subjects.length > 0 ? subjects[0].id : '');
    setSelectedClassId(classes.length > 0 ? classes[0].id : '');
    setDueDate('');
    setTotalMarks('0');
    setModalVisible(true);
  };

  const handleEditAssignment = (assignment: Assignment) => {
    setCurrentAssignment(assignment);
    setTitle(assignment.title);
    setDescription(assignment.description || '');
    setSelectedSubjectId(assignment.subjectId);
    setSelectedClassId(assignment.classId);
    setDueDate(assignment.dueDate);
    setTotalMarks(String(assignment.totalMarks));
    setModalVisible(true);
  };

  const handleSaveAssignment = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not logged in.");
      return;
    }
    if (!title.trim() || !selectedSubjectId.trim() || !selectedClassId.trim() || !dueDate.trim() || Number(totalMarks) <= 0) {
      Alert.alert("Error", "Please fill in all required fields (Title, Subject, Class, Due Date, Total Marks > 0).");
      return;
    }

    setLoading(true);
    try {
      const assignmentData = {
        title,
        description,
        subjectId: selectedSubjectId,
        classId: selectedClassId,
        teacherId: user.uid,
        dueDate,
        totalMarks: Number(totalMarks),
      };

      if (currentAssignment) {
        await updateAssignment(currentAssignment.id, assignmentData);
        Alert.alert("Success", "Assignment updated successfully.");
      } else {
        await createAssignment(assignmentData);
        Alert.alert("Success", "Assignment created successfully.");
      }

      setModalVisible(false);
      fetchAssignmentsAndSubjects();
    } catch (err: any) {
      Alert.alert("Error", `Failed to save assignment: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAssignment = async (id: string, assignmentTitle: string) => {
    Alert.alert(
      "Delete Assignment",
      `Are you sure you want to delete ${assignmentTitle}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAssignment(id);
              Alert.alert("Success", `${assignmentTitle} deleted successfully.`);
              fetchAssignmentsAndSubjects();
            } catch (err: any) {
              Alert.alert("Error", `Failed to delete ${assignmentTitle}: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderAssignmentItem = ({ item }: { item: Assignment }) => (
    <View style={styles.card}>
      <View style={styles.assignmentInfo}>
        <Text style={styles.assignmentTitle}>{item.title}</Text>
        {item.description && <Text style={styles.assignmentDetail}>{item.description}</Text>}
        <Text style={styles.assignmentDetail}>Subject: {subjects.find(s => s.id === item.subjectId)?.name || 'N/A'}</Text>
        <Text style={styles.assignmentDetail}>Class: {classes.find(c => c.id === item.classId)?.name || 'N/A'}</Text>
        <Text style={styles.assignmentDetail}>Due Date: {item.dueDate}</Text>
        <Text style={styles.assignmentDetail}>Total Marks: {item.totalMarks}</Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEditAssignment(item)} style={styles.actionButton}>
          <Ionicons name="pencil-outline" size={24} color="#3498db" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteAssignment(item.id, item.title)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#e74c3c" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading assignments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchAssignmentsAndSubjects} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Assignments</Text>
      <TouchableOpacity style={styles.addButton} onPress={handleAddAssignment}>
        <Ionicons name="add-circle" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Assignment</Text>
      </TouchableOpacity>

      {assignments.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyListText}>No assignments found.</Text>
          <TouchableOpacity onPress={fetchAssignmentsAndSubjects} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item.id}
          renderItem={renderAssignmentItem}
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
              <Text style={styles.modalTitle}>{currentAssignment ? 'Edit Assignment' : 'Add New Assignment'}</Text>
              <TextInput
                style={styles.input}
                placeholder="Assignment Title"
                placeholderTextColor="#95a5a6"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (Optional)"
                placeholderTextColor="#95a5a6"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.pickerLabel}>Subject:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedSubjectId}
                  onValueChange={(itemValue) => setSelectedSubjectId(itemValue)}
                  style={styles.picker}
                >
                  {subjects.length === 0 ? (
                    <Picker.Item label="No Subjects Available" value="" />
                  ) : (
                    subjects.map(subject => (
                      <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
                    ))
                  )}
                </Picker>
              </View>
              <Text style={styles.pickerLabel}>Class:</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedClassId}
                  onValueChange={(itemValue) => setSelectedClassId(itemValue)}
                  style={styles.picker}
                >
                  {classes.length === 0 ? (
                    <Picker.Item label="No Classes Available" value="" />
                  ) : (
                    classes.map(classItem => (
                      <Picker.Item key={classItem.id} label={classItem.name} value={classItem.id} />
                    ))
                  )}
                </Picker>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Due Date (YYYY-MM-DD)"
                placeholderTextColor="#95a5a6"
                value={dueDate}
                onChangeText={setDueDate}
              />
              <TextInput
                style={styles.input}
                placeholder="Total Marks"
                placeholderTextColor="#95a5a6"
                value={totalMarks}
                onChangeText={setTotalMarks}
                keyboardType="numeric"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveAssignment}>
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
  // Main container and layout
  container: {
    flex: 1,
    backgroundColor: '#f4f7f9', // A very light, clean gray
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  emptyListText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  // Title and Add Button
  title: {
    fontSize: 32,
    fontWeight: '500', // Bolder title
    color: '#2c3e50', // A deep blue/black
    marginBottom: 20,
    textAlign: 'center',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1E90FF', // A vibrant blue
    paddingVertical: 16,
    paddingHorizontal: 22,
    borderRadius: 12, // More rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#3498db', // Blue shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  // Assignment Cards
  listContentContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12, // Consistent rounded corners
    padding: 20,
    marginBottom: 15,
    shadowColor: '#bdc3c7', // Lighter gray shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 5,
  },
  assignmentInfo: {
    flex: 1,
    marginRight: 10,
  },
  assignmentTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2c3e50',
  },
  assignmentDetail: {
    fontSize: 15,
    color: '#7f8c8d',
    marginTop: 6,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 18,
    padding: 8,
  },
  // Error/Retry
  errorText: {
    color: '#e74c3c', // Red for errors
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(44, 62, 80, 0.8)', // Darker, more professional overlay
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
    color: '#2c3e50',
  },
  input: {
    borderColor: '#bdc3c7', // Light gray border
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 18,
    fontSize: 16,
    backgroundColor: '#fcfcfc',
    color: '#34495e',
  },
  textArea: {
    minHeight: 120, // Taller text area
    textAlignVertical: 'top',
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  pickerContainer: {
    borderColor: '#bdc3c7',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 18,
    overflow: 'hidden', // Ensures the border is visible around the Picker
  },
  picker: {
    height: 50,
    width: '100%',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#e74c3c', // Distinctive red for cancel
  },
  saveButton: {
    backgroundColor: '#27ae60', // A fresh green for save
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
