import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../lib/auth';
import { createGrade, deleteGrade, getAllGrades, updateGrade } from '../../lib/grades';
import { getAllClasses, SchoolClass } from '../../lib/schoolData';
import { getStudentsByTeacher, Student } from '../../lib/students';
import { getAllSubjects, Subject } from '../../lib/subjects';
import { Grade } from '../../lib/types';

export default function TeacherGradesScreen() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [studentsInSelectedClass, setStudentsInSelectedClass] = useState<Student[]>([]);
  const [subjectsHandled, setSubjectsHandled] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
  const [grades, setGrades] = useState<Grade[]>([]);

  const [isGradeModalVisible, setGradeModalVisible] = useState(false);
  const [currentGrade, setCurrentGrade] = useState<Grade | null>(null);
  const [formStudentId, setFormStudentId] = useState<string | undefined>(undefined);
  const [formStudentName, setFormStudentName] = useState('');
  const [formAssignmentName, setFormAssignmentName] = useState('');
  const [formMarksObtained, setFormMarksObtained] = useState('');
  const [formTotalMarks, setFormTotalMarks] = useState('');
  const [formComments, setFormComments] = useState('');

  const fetchTeacherData = useCallback(async () => {
    if (!user?.uid || !userProfile) return;

    try {
      const allSchoolClasses = await getAllClasses();
      const assignedClasses = allSchoolClasses.filter(cls => userProfile.classesHandled?.includes(cls.id));
      setTeacherClasses(assignedClasses);

      if (assignedClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(assignedClasses[0].id);
      }

      const allSubjects = await getAllSubjects();
      const assignedSubjects = allSubjects.filter(sub => userProfile.subjects?.includes(sub.id));
      setSubjectsHandled(assignedSubjects);

      if (assignedSubjects.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(assignedSubjects[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching teacher data:", err);
      setError("Failed to load teacher data.");
    }
  }, [user?.uid, userProfile, selectedClassId, selectedSubjectId]);

  const fetchStudentsAndGrades = useCallback(async () => {
    if (!selectedClassId || !selectedSubjectId || !user?.uid) return;

    setLoading(true);
    setError(null);
    try {
      const students = await getStudentsByTeacher(user.uid);
      const filteredStudents = students.filter(s => s.classId === selectedClassId);
      setStudentsInSelectedClass(filteredStudents);

      const fetchedGrades = await getAllGrades({
        teacherId: user.uid,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
      });
      setGrades(fetchedGrades);

    } catch (err: any) {
      console.error("Error fetching students or grades:", err);
      setError("Failed to load students or grades.");
    }
    setLoading(false);
  }, [selectedClassId, selectedSubjectId, user?.uid]);

  useEffect(() => {
    if (!authLoading) {
      fetchTeacherData();
    }
  }, [authLoading, fetchTeacherData]);

  useEffect(() => {
    fetchStudentsAndGrades();
  }, [fetchStudentsAndGrades]);

  const resetForm = () => {
    setFormStudentId(undefined);
    setFormStudentName('');
    setFormAssignmentName('');
    setFormMarksObtained('');
    setFormTotalMarks('');
    setFormComments('');
    setCurrentGrade(null);
  };

  const handleAddGrade = (student: Student) => {
    resetForm();
    setFormStudentId(student.id);
    setFormStudentName(student.name || student.email || 'Unknown');
    setGradeModalVisible(true);
  };

  const handleEditGrade = (grade: Grade) => {
    setCurrentGrade(grade);
    setFormStudentId(grade.studentId);
    setFormStudentName(studentsInSelectedClass.find(s => s.id === grade.studentId)?.name || grade.studentId);
    setFormAssignmentName(grade.assignmentName);
    setFormMarksObtained(String(grade.marksObtained));
    setFormTotalMarks(String(grade.totalMarks));
    setFormComments(grade.comments || '');
    setGradeModalVisible(true);
  };

  const handleSaveGrade = async () => {
    if (!formStudentId || !selectedClassId || !selectedSubjectId || !user?.uid || !formAssignmentName.trim() || !formMarksObtained.trim() || !formTotalMarks.trim()) {
      Alert.alert("Error", "Please fill all required fields: Student, Subject, Class, Assignment Name, Marks Obtained, Total Marks.");
      return;
    }

    const marksObtainedNum = parseFloat(formMarksObtained);
    const totalMarksNum = parseFloat(formTotalMarks);

    if (isNaN(marksObtainedNum) || isNaN(totalMarksNum) || marksObtainedNum < 0 || totalMarksNum <= 0 || marksObtainedNum > totalMarksNum) {
      Alert.alert("Error", "Marks obtained and total marks must be valid numbers. Marks obtained cannot exceed total marks.");
      return;
    }

    setLoading(true);
    try {
      const gradePercentage = (marksObtainedNum / totalMarksNum) * 100;
      const commonGradeData = {
        studentId: formStudentId,
        classId: selectedClassId,
        subjectId: selectedSubjectId,
        teacherId: user.uid,
        assignmentName: formAssignmentName,
        marksObtained: marksObtainedNum,
        totalMarks: totalMarksNum,
        gradePercentage: parseFloat(gradePercentage.toFixed(2)),
        comments: formComments,
      };

      if (currentGrade) {
        await updateGrade(currentGrade.id, { ...commonGradeData, status: currentGrade.status, createdAt: currentGrade.createdAt });
        Alert.alert("Success", "Grade updated successfully. Waiting for Headteacher approval.");
      } else {
        await createGrade({ ...commonGradeData, status: 'pending', createdAt: new Date().toISOString() });
        Alert.alert("Success", "Grade added successfully. Waiting for Headteacher approval.");
      }
      setGradeModalVisible(false);
      fetchStudentsAndGrades();
    } catch (err: any) {
      console.error("Error saving grade:", err);
      Alert.alert("Error", `Failed to save grade: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    Alert.alert(
      "Delete Grade",
      "Are you sure you want to delete this grade record? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteGrade(gradeId);
              Alert.alert("Success", "Grade record deleted.");
              fetchStudentsAndGrades();
            } catch (err: any) {
              console.error("Error deleting grade record:", err);
              Alert.alert("Error", `Failed to delete record: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const getStudentName = (studentId: string) => {
    return studentsInSelectedClass.find(s => s.id === studentId)?.name || 'Unknown Student';
  };

  const getSubjectName = (subjectId: string) => {
    return subjectsHandled.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading grades data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchStudentsAndGrades} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Academic Reports</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.controlsContainer}>
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Class:</Text>
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

          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Subject:</Text>
            <Picker
              selectedValue={selectedSubjectId}
              onValueChange={(itemValue) => setSelectedSubjectId(itemValue as string)}
              style={styles.picker}
            >
              {subjectsHandled.map(sub => (
                <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
              ))}
            </Picker>
          </View>
        </View>

        {selectedClassId && selectedSubjectId && studentsInSelectedClass.length > 0 ? (
          <FlatList
            data={studentsInSelectedClass}
            keyExtractor={(item) => item.id}
            renderItem={({ item: student }) => {
              const studentGrades = grades.filter(g => g.studentId === student.id);
              return (
                <View style={styles.studentCard}>
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{student.name || student.email}</Text>
                    <Text style={styles.studentClass}>Class: {teacherClasses.find(c => c.id === student.classId)?.name}</Text>
                  </View>
                  
                  <View style={styles.gradeDetails}>
                    {studentGrades.length > 0 ? (
                      studentGrades.map(grade => (
                        <View key={grade.id} style={styles.gradeItem}>
                          <Text style={styles.gradeAssignment}>{grade.assignmentName}: {grade.marksObtained}/{grade.totalMarks} ({grade.gradePercentage.toFixed(2)}%) - {grade.status}</Text>
                          <View style={styles.gradeActions}>
                            <TouchableOpacity onPress={() => handleEditGrade(grade)} style={styles.actionButton}>
                              <Ionicons name="pencil-outline" size={20} color="#1E90FF" />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => handleDeleteGrade(grade.id)} style={styles.actionButton}>
                              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))
                    ) : (
                      <Text style={styles.noGradesText}>No grades recorded for this student in this subject.</Text>
                    )}
                    <TouchableOpacity onPress={() => handleAddGrade(student)} style={styles.addGradeButton}>
                      <Ionicons name="add-circle-outline" size={20} color="#fff" />
                      <Text style={styles.addGradeButtonText}>Add Grade</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            scrollEnabled={false}
            ListEmptyComponent={<Text style={styles.noDataText}>No students in selected class or subject.</Text>}
          />
        ) : (selectedClassId && selectedSubjectId ? <Text style={styles.noDataText}>No students in selected class or subject.</Text> : <Text style={styles.noDataText}>Please select a class and a subject to view grades.</Text>)
        }
      </ScrollView>

      {/* Grade Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isGradeModalVisible}
        onRequestClose={() => setGradeModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentGrade ? 'Edit Grade' : 'Add New Grade'}</Text>
            <Text style={styles.modalStudentName}>Student: {formStudentName}</Text>
            
            <Text style={styles.label}>Assignment Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Mid-term Exam, Homework 1"
              value={formAssignmentName}
              onChangeText={setFormAssignmentName}
            />

            <Text style={styles.label}>Marks Obtained:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 85"
              value={formMarksObtained}
              onChangeText={setFormMarksObtained}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Total Marks:</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 100"
              value={formTotalMarks}
              onChangeText={setFormTotalMarks}
              keyboardType="numeric"
            />

            <Text style={styles.label}>Comments (Optional):</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any relevant comments"
              value={formComments}
              onChangeText={setFormComments}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setGradeModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveGrade}>
                <Text style={styles.buttonText}>Save</Text>
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
  scrollContent: {
    paddingBottom: 20,
  },
  controlsContainer: {
    flexDirection: 'column',
    marginBottom: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  pickerWrapper: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 5,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  studentInfo: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  studentClass: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  gradeDetails: {
    marginTop: 10,
  },
  gradeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f9f9f9',
  },
  gradeAssignment: {
    fontSize: 15,
    color: '#444',
    flex: 1,
  },
  gradeActions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  addGradeButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginTop: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addGradeButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  noGradesText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginVertical: 10,
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

