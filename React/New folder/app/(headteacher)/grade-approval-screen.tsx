import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAllUsers, UserProfile } from '../../lib/auth';
import { getPendingGradesForApproval, Grade, updateGrade } from '../../lib/grades';
import { getAllSubjects, Subject } from '../../lib/subjects';

export default function GradeApprovalScreen() {
  const [pendingGrades, setPendingGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const fetchPendingGrades = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesData, usersData, subjectsData] = await Promise.all([
        getPendingGradesForApproval(),
        getAllUsers(),
        getAllSubjects()
      ]);

      setPendingGrades(gradesData);
      setTeachers(usersData.filter(user => user.role === 'teacher'));
      setStudents(usersData.filter(user => user.role === 'student'));
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching pending grades:", error);
      Alert.alert("Error", "Failed to load pending grades.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchPendingGrades();
  }, [fetchPendingGrades]));

  const handleGradeAction = async (gradeId: string, status: 'approved' | 'rejected') => {
    setLoading(true);
    try {
      await updateGrade(gradeId, { status });
      Alert.alert("Success", `Grade ${status} successfully.`);
      fetchPendingGrades(); // Refresh the list
    } catch (error) {
      console.error(`Error ${status} grade:`, error);
      Alert.alert("Error", `Failed to ${status} grade.`);
    } finally {
      setLoading(false);
    }
  };

  const getTeacherName = (teacherId: string) => {
    const teacher = teachers.find(t => t.uid === teacherId);
    return teacher ? teacher.name || teacher.email : 'Unknown Teacher';
  };

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.uid === studentId);
    return student ? student.name || student.email : 'Unknown Student';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown Subject';
  };

  const renderGradeItem = ({ item }: { item: Grade }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Assignment: {item.assignmentName}</Text>
        <Text style={styles.cardStatus}>Status: {item.status.toUpperCase()}</Text>
      </View>
      <Text style={styles.cardDetail}>Student: {getStudentName(item.studentId)}</Text>
      <Text style={styles.cardDetail}>Subject: {getSubjectName(item.subjectId)}</Text>
      <Text style={styles.cardDetail}>Teacher: {getTeacherName(item.teacherId)}</Text>
      <Text style={styles.cardDetail}>Marks: {item.marksObtained} / {item.totalMarks} ({item.gradePercentage}%)</Text>
      {item.comments && <Text style={styles.cardDetail}>Comments: {item.comments}</Text>}
      <View style={styles.cardActions}>
        <TouchableOpacity style={[styles.actionButton, styles.approveButton]} onPress={() => handleGradeAction(item.id, 'approved')}>
          <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Approve</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.rejectButton]} onPress={() => handleGradeAction(item.id, 'rejected')}>
          <Ionicons name="close-circle-outline" size={24} color="#fff" />
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading pending grades...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Grades for Approval</Text>
      {pendingGrades.length === 0 ? (
        <Text style={styles.noGradesText}>No pending grades for approval.</Text>
      ) : (
        <FlatList
          data={pendingGrades}
          renderItem={renderGradeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cardStatus: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'orange',
  },
  cardDetail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  approveButton: {
    backgroundColor: '#4CAF50',
  },
  rejectButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  noGradesText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});
