import * as Print from 'expo-print';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getAllUsers, UserProfile } from '../../lib/auth';
import { getAllGrades, Grade } from '../../lib/grades';
import { getAllSubjects, Subject } from '../../lib/subjects';

const { width } = Dimensions.get('window');

export default function GradeReportsScreen() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isSharing, setIsSharing] = useState(false); // Prevent multiple share requests

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesData, usersData, subjectsData] = await Promise.all([
        getAllGrades(),
        getAllUsers(),
        getAllSubjects()
      ]);
      setGrades(gradesData.filter(grade => grade.status === 'approved')); // Only approved grades
      setUsers(usersData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching grade report data:", error);
      Alert.alert("Error", "Failed to load grade reports.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchData();
  }, [fetchData]));

  const getUserName = (uid: string) => {
    const user = users.find(u => u.uid === uid);
    return user ? user.name || user.email : 'Unknown';
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Unknown';
  };

  // Group grades by student
  const gradesByStudent = useMemo(() => {
    const studentMap = new Map<string, Grade[]>();
    grades.forEach(grade => {
      if (!studentMap.has(grade.studentId)) {
        studentMap.set(grade.studentId, []);
      }
      studentMap.get(grade.studentId)?.push(grade);
    });
    return Array.from(studentMap.entries()).map(([studentId, studentGrades]) => ({
      studentId,
      studentName: getUserName(studentId),
      grades: studentGrades,
      averagePercentage: studentGrades.length > 0
        ? (studentGrades.reduce((sum, g) => sum + g.gradePercentage, 0) / studentGrades.length)
        : 0,
    }));
  }, [grades, users]);

  // Group grades by subject
  const gradesBySubject = useMemo(() => {
    const subjectMap = new Map<string, Grade[]>();
    grades.forEach(grade => {
      if (!subjectMap.has(grade.subjectId)) {
        subjectMap.set(grade.subjectId, []);
      }
      subjectMap.get(grade.subjectId)?.push(grade);
    });
    return Array.from(subjectMap.entries()).map(([subjectId, subjectGrades]) => ({
      subjectId,
      subjectName: getSubjectName(subjectId),
      grades: subjectGrades,
      averagePercentage: subjectGrades.length > 0
        ? (subjectGrades.reduce((sum, g) => sum + g.gradePercentage, 0) / subjectGrades.length)
        : 0,
    }));
  }, [grades, subjects]);

  const renderStudentReport = ({ item }: { item: typeof gradesByStudent[0] }) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportTitle}>Student: {item.studentName}</Text>
      <Text style={styles.reportAverage}>Average Grade: {item.averagePercentage.toFixed(2)}%</Text>
      {item.grades.map(grade => (
        <View key={grade.id} style={styles.gradeDetailItem}>
          <Text style={styles.gradeDetailText}>
            - {getSubjectName(grade.subjectId)}: {grade.assignmentName} ({grade.marksObtained}/{grade.totalMarks} - {grade.gradePercentage.toFixed(2)}%)
          </Text>
        </View>
      ))}
    </View>
  );

  const renderSubjectReport = ({ item }: { item: typeof gradesBySubject[0] }) => (
    <View style={styles.reportCard}>
      <Text style={styles.reportTitle}>Subject: {item.subjectName}</Text>
      <Text style={styles.reportAverage}>Overall Average: {item.averagePercentage.toFixed(2)}%</Text>
    </View>
  );

  // Generate PDF with expo-print
  const handleGenerateReport = async () => {
    if (isSharing) return; // Prevent multiple requests
    setIsSharing(true);
    try {
      let studentReportsHTML = gradesByStudent.map(student => `
        <h3>Student: ${student.studentName}</h3>
        <p>Average: ${student.averagePercentage.toFixed(2)}%</p>
        <ul>
          ${student.grades.map(g => `<li>${getSubjectName(g.subjectId)} - ${g.assignmentName}: ${g.marksObtained}/${g.totalMarks} (${g.gradePercentage.toFixed(2)}%)</li>`).join('')}
        </ul>
      `).join('<hr/>');

      let subjectReportsHTML = gradesBySubject.map(subject => `
        <h3>Subject: ${subject.subjectName}</h3>
        <p>Average: ${subject.averagePercentage.toFixed(2)}%</p>
      `).join('<hr/>');

      let htmlContent = `
        <h1 style="text-align:center;">Mai Aisha Academy</h1>
        <h2 style="text-align:center;">Grade Report</h2>
        <h2>Student Performance</h2>
        ${studentReportsHTML}
        <h2>Subject Performance</h2>
        ${subjectReportsHTML}
      `;

      // Generate PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });

      // Share PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert("Report Generated", `Saved at: ${uri}`);
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Error", "Failed to generate report.");
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Generating reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Grade Reports</Text>

      <Text style={styles.sectionTitle}>Student Performance Overview</Text>
      {gradesByStudent.length === 0 ? (
        <Text style={styles.noDataText}>No student grades available.</Text>
      ) : (
        <FlatList
          data={gradesByStudent}
          renderItem={renderStudentReport}
          keyExtractor={item => item.studentId}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
        />
      )}

      <Text style={styles.sectionTitle}>Subject-wise Performance Overview</Text>
      {gradesBySubject.length === 0 ? (
        <Text style={styles.noDataText}>No subject grades available.</Text>
      ) : (
        <FlatList 
          data={gradesBySubject}
          renderItem={renderSubjectReport}
          keyExtractor={item => item.subjectId}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListContainer}
        />
      )}

      {/* Export Button */}
      <TouchableOpacity
        style={[styles.exportButton, isSharing && { opacity: 0.6 }]}
        onPress={handleGenerateReport}
        disabled={isSharing}
      >
        <Text style={styles.exportButtonText}>
          {isSharing ? "Processing..." : "📄 Export Report"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 30,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 25,
  },
  horizontalListContainer: {
    paddingRight: 10,
  },
  reportCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginRight: 15,
    width: width * 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reportAverage: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
    fontWeight: 'bold',
  },
  gradeDetailItem: {
    marginLeft: 10,
    marginBottom: 3,
  },
  gradeDetailText: {
    fontSize: 14,
    color: '#666',
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  exportButton: {
    marginTop: 30,
    padding: 15,
    backgroundColor: '#1E90FF',
    borderRadius: 10,
    alignItems: 'center',
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
