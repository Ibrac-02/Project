import * as Print from 'expo-print';
import { useFocusEffect } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert,Dimensions, FlatList, ScrollView, StyleSheet, Text,TouchableOpacity, View} from 'react-native';
import { getAllUsers, UserProfile } from '../../lib/auth';
import { getAllGrades, Grade } from '../../lib/grades';
import { getAllSubjects, Subject } from '../../lib/subjects';

const { width } = Dimensions.get('window');

export default function GradeReportsScreen() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isSharing, setIsSharing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [gradesData, usersData, subjectsData] = await Promise.all([
        getAllGrades(),
        getAllUsers(),
        getAllSubjects()
      ]);
      setGrades(gradesData.filter(grade => grade.status === 'approved'));
      setUsers(usersData);
      setSubjects(subjectsData);
    } catch (error) {
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

  // group by student
  const gradesByStudent = useMemo(() => {
    const map = new Map<string, Grade[]>();
    grades.forEach(g => {
      if (!map.has(g.studentId)) map.set(g.studentId, []);
      map.get(g.studentId)!.push(g);
    });
    return Array.from(map.entries()).map(([studentId, studentGrades]) => ({
      studentId,
      studentName: getUserName(studentId),
      grades: studentGrades,
      averagePercentage: studentGrades.reduce((s, g) => s + g.gradePercentage, 0) / studentGrades.length,
    }));
  }, [grades, users]);

  // group by subject
  const gradesBySubject = useMemo(() => {
    const map = new Map<string, Grade[]>();
    grades.forEach(g => {
      if (!map.has(g.subjectId)) map.set(g.subjectId, []);
      map.get(g.subjectId)!.push(g);
    });
    return Array.from(map.entries()).map(([subjectId, subjectGrades]) => ({
      subjectId,
      subjectName: getSubjectName(subjectId),
      grades: subjectGrades,
      averagePercentage: subjectGrades.reduce((s, g) => s + g.gradePercentage, 0) / subjectGrades.length,
    }));
  }, [grades, subjects]);

  const renderStudentReport = ({ item }: { item: typeof gradesByStudent[0] }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.studentName}</Text>
      <Text style={styles.cardSubtitle}>Average: {item.averagePercentage.toFixed(2)}%</Text>
      <View style={styles.divider} />
      {item.grades.map(grade => (
        <View key={grade.id} style={styles.innerRow}>
          <Text style={styles.innerLeft}>{getSubjectName(grade.subjectId)}</Text>
          <Text style={styles.innerRight}>
            {grade.assignmentName}: {grade.marksObtained}/{grade.totalMarks} ({grade.gradePercentage.toFixed(1)}%)
          </Text>
        </View>
      ))}
    </View>
  );

  const renderSubjectReport = ({ item }: { item: typeof gradesBySubject[0] }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.subjectName}</Text>
      <Text style={styles.cardSubtitle}>Average: {item.averagePercentage.toFixed(2)}%</Text>
      <View style={styles.divider} />
      {item.grades.map(grade => (
        <View key={grade.id} style={styles.innerRow}>
          <Text style={styles.innerLeft}>{getUserName(grade.studentId)}</Text>
          <Text style={styles.innerRight}>
            {grade.assignmentName}: {grade.marksObtained}/{grade.totalMarks} ({grade.gradePercentage.toFixed(1)}%)
          </Text>
        </View>
      ))}
    </View>
  );

  const handleGenerateReport = async () => {
    if (isSharing) return;
    setIsSharing(true);
    try {
      const studentHTML = gradesByStudent.map(s => `
        <h3>${s.studentName}</h3>
        <p>Average: ${s.averagePercentage.toFixed(2)}%</p>
        <ul>${s.grades.map(g => `<li>${getSubjectName(g.subjectId)} - ${g.assignmentName}: ${g.marksObtained}/${g.totalMarks} (${g.gradePercentage.toFixed(1)}%)</li>`).join('')}</ul>
      `).join('<hr/>');

      const subjectHTML = gradesBySubject.map(s => `
        <h3>${s.subjectName}</h3>
        <p>Average: ${s.averagePercentage.toFixed(2)}%</p>
        <ul>${s.grades.map(g => `<li>${getUserName(g.studentId)} - ${g.assignmentName}: ${g.marksObtained}/${g.totalMarks} (${g.gradePercentage.toFixed(1)}%)</li>`).join('')}</ul>
      `).join('<hr/>');

      const html = `
        <h1 style="text-align:center;">Mai Aisha Academy</h1>
        <h2 style="text-align:center;">Grade Report</h2>
        <h2>Student Performance</h2>${studentHTML}
        <h2>Subject Performance</h2>${subjectHTML}
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri);
      else Alert.alert("Report Generated", `Saved at: ${uri}`);
    } catch (e) {
      Alert.alert("Error", "Failed to generate report.");
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading reports...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Student Performance</Text>
      {gradesByStudent.length === 0 ? (
        <Text style={styles.noData}>No student grades found.</Text>
      ) : (
        <FlatList
          data={gradesByStudent}
          renderItem={renderStudentReport}
          keyExtractor={item => item.studentId}
          scrollEnabled={false}
        />
      )}

      <Text style={styles.sectionTitle}>Subject Performance</Text>
      {gradesBySubject.length === 0 ? (
        <Text style={styles.noData}>No subject grades found.</Text>
      ) : (
        <FlatList
          data={gradesBySubject}
          renderItem={renderSubjectReport}
          keyExtractor={item => item.subjectId}
          scrollEnabled={false}
        />
      )}

      <TouchableOpacity
        style={[styles.exportButton, isSharing && { opacity: 0.6 }]}
        onPress={handleGenerateReport}
        disabled={isSharing}
      >
        <Text style={styles.exportButtonText}>{isSharing ? 'Processing...' : 'Export Report'}</Text>
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
     alignItems: 'center' 
    },
  
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: { fontSize: 17, fontWeight: '600', color: '#333' },
  cardSubtitle: { fontSize: 15, color: '#1E90FF', marginTop: 4, marginBottom: 10 },
  divider: { height: 1, backgroundColor: '#eee', marginBottom: 10 },
  innerRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  innerLeft: { fontSize: 14, color: '#444', flex: 1 },
  innerRight: { fontSize: 14, color: '#666', flex: 2, textAlign: 'right' },
  noData: { fontSize: 15, color: '#666', textAlign: 'center', marginVertical: 10 },
  exportButton: {
    marginTop: 25,
    padding: 16,
    backgroundColor: '#1E90FF',
    borderRadius: 12,
    alignItems: 'center',
  },
  exportButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
