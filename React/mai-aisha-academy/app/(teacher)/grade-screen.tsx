import { Picker } from '@react-native-picker/picker';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { createGrade, getGradesByTeacher, Grade, updateGrade } from '../../lib/grades';
import { getTeacherSubjects } from '../../lib/subjects';
import { Subject } from '../../lib/types';

export default function GradeEntryScreen() {
  const { user, userProfile } = useAuth();
  const { gradeId } = useLocalSearchParams(); // For editing existing grades

  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studentName, setStudentName] = useState(''); // manual entry
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
  const [assignmentName, setAssignmentName] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('');
  const [comments, setComments] = useState('');
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchInitialData = useCallback(async () => {
    if (!user?.uid || !userProfile) return;

    setLoading(true); 
    try {
      const fetchedSubjects = await getTeacherSubjects(user.uid);
      setSubjects(fetchedSubjects);

      if (gradeId) {
        setIsEditing(true);
        const teacherGrades = await getGradesByTeacher(user.uid);
        const gradeToEdit = teacherGrades.find(g => g.id === gradeId);
        if (gradeToEdit) {
          setCurrentGrade(gradeToEdit);
          setStudentName(gradeToEdit.studentId); // using text now
          setSelectedSubjectId(gradeToEdit.subjectId);
          setAssignmentName(gradeToEdit.assignmentName);
          setMarksObtained(String(gradeToEdit.marksObtained));
          setTotalMarks(String(gradeToEdit.totalMarks));
          setComments(gradeToEdit.comments || '');
        } else {
          Alert.alert("Error", "Grade not found for editing.");
          setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      Alert.alert("Error", "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [user, userProfile, gradeId]);

  useFocusEffect(useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]));

  const handleSaveGrade = async () => {
    if (!studentName || !selectedSubjectId || !assignmentName || !marksObtained || !totalMarks || !user?.uid) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    const parsedMarksObtained = parseFloat(marksObtained);
    const parsedTotalMarks = parseFloat(totalMarks);

    if (isNaN(parsedMarksObtained) || isNaN(parsedTotalMarks) || parsedMarksObtained < 0 || parsedTotalMarks <= 0 || parsedMarksObtained > parsedTotalMarks) {
      Alert.alert("Error", "Please enter valid marks. Marks obtained cannot exceed total marks, and total marks must be greater than zero.");
      return;
    }

    setLoading(true);
    try {
      const gradeData = {
        studentId: studentName, // text input instead of dropdown
        subjectId: selectedSubjectId,
        teacherId: user.uid,
        assignmentName,
        marksObtained: parsedMarksObtained,
        totalMarks: parsedTotalMarks,
        status: 'pending' as const, // always pending for approval
        comments,
      };

      if (isEditing && currentGrade) {
        await updateGrade(currentGrade.id, gradeData);
        Alert.alert("Success", "Grade updated successfully!");
      } else {
        await createGrade(gradeData);
        Alert.alert("Success", "Grade added successfully and sent for approval!");
      }
      resetForm();
    } catch (error) {
      console.error("Error saving grade:", error);
      Alert.alert("Error", "Failed to save grade.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStudentName('');
    setSelectedSubjectId(undefined);
    setAssignmentName('');
    setMarksObtained('');
    setTotalMarks('');
    setComments('');
    setCurrentGrade(null);
    setIsEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading data...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{isEditing ? 'Edit Grade' : 'Enter New Grade'}</Text>

      {/* Student Text Input */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Student Name / ID:</Text>
        <TextInput
          style={styles.input}
          value={studentName}
          onChangeText={setStudentName}
          placeholder="Enter student full name"
        />
      </View>

      {/* Subject Picker */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Subject:</Text>
        <Picker
          selectedValue={selectedSubjectId}
          onValueChange={(itemValue) => setSelectedSubjectId(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Select a subject" value={undefined} />
          {subjects.map((subject) => (
            <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
          ))}
        </Picker>
      </View>

      {/* Assignment Name */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Assignment Name:</Text>
        <TextInput
          style={styles.input}
          value={assignmentName}
          onChangeText={setAssignmentName}
          placeholder="e.g., Mid-term Exam, Homework 1"
        />
      </View>

      {/* Marks Obtained */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Marks Obtained:</Text>
        <TextInput
          style={styles.input}
          value={marksObtained}
          onChangeText={setMarksObtained}
          keyboardType="numeric"
          placeholder="e.g., 75"
        />
      </View>

      {/* Total Marks */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Total Marks:</Text>
        <TextInput
          style={styles.input}
          value={totalMarks}
          onChangeText={setTotalMarks}
          keyboardType="numeric"
          placeholder="e.g., 100"
        />
      </View>

      {/* Comments */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Comments (Optional):</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={comments}
          onChangeText={setComments}
          multiline
          numberOfLines={4}
          placeholder="Add any relevant comments"
        />
      </View>

      {/* Save Button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSaveGrade}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveButtonText}>{isEditing ? 'Update Grade' : 'Submit Grade'}</Text>}
      </TouchableOpacity>

      {/* Cancel Edit */}
      {isEditing && (
        <TouchableOpacity style={[styles.saveButton, styles.cancelButton]} onPress={resetForm}>
          <Text style={styles.saveButtonText}>Cancel Edit</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ddd',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
    paddingHorizontal: 5,
  },
  saveButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    marginTop: 10,
  },
});
