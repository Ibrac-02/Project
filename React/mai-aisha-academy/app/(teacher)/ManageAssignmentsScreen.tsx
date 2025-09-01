import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useAuth } from '../../lib/auth';
import { getTeacherSubjects, Subject } from '../../lib/subjects';
import { createAssignment, deleteAssignment, getAssignmentsByTeacher, updateAssignment } from '../../lib/assignments';
import { Assignment } from '../../lib/types';
import { SchoolClass, getAllClasses } from '../../lib/schoolData';

export default function ManageAssignmentsScreen() {
  const { user, loading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]); // To select subject for assignment
  const [classes, setClasses] = useState<SchoolClass[]>([]); // To select class for assignment
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Assignment | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [dueDate, setDueDate] = useState(''); // YYYY-MM-DD format
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
    setSelectedSubjectId(subjects.length > 0 ? subjects[0].id : ''); // Default to first subject
    setSelectedClassId(classes.length > 0 ? classes[0].id : ''); // Default to first class
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
      fetchAssignmentsAndSubjects(); // Refresh the list
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
              fetchAssignmentsAndSubjects(); // Refresh the list
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
          <Ionicons name="pencil-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteAssignment(item.id, item.title)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading assignments...</Text>
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
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Assignment</Text>
      </TouchableOpacity>

      {assignments.length === 0 ? (
        <View style={styles.centered}>
          <Text>No assignments found.</Text>
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
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (Optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
              />
              <Text style={styles.pickerLabel}>Subject:</Text>
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
              <Text style={styles.pickerLabel}>Class:</Text>
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
              <TextInput
                style={styles.input}
                placeholder="Due Date (YYYY-MM-DD)"
                value={dueDate}
                onChangeText={setDueDate}
              />
              <TextInput
                style={styles.input}
                placeholder="Total Marks"
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
  card: {
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
  assignmentInfo: {
    flex: 1,
  },
  assignmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  assignmentDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cardActions: {
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
    maxHeight: '80%',
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
  pickerLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },
  picker: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
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
