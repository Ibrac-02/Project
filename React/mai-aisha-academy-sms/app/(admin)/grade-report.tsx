import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function GradeReport() {
  const [gradesByStudent, setGradesByStudent] = useState<any[]>([]);
  const [gradesBySubject, setGradesBySubject] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'grades'));
      const grades = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Calculate averages by student
      const studentMap: Record<string, { studentName: string; total: number; count: number }> = {};
      const subjectMap: Record<string, { subjectName: string; total: number; count: number }> = {};

      grades.forEach((g: any) => {
        if (!studentMap[g.studentName]) {
          studentMap[g.studentName] = { studentName: g.studentName, total: 0, count: 0 };
        }
        studentMap[g.studentName].total += g.percentage;
        studentMap[g.studentName].count++;

        if (!subjectMap[g.subjectName]) {
          subjectMap[g.subjectName] = { subjectName: g.subjectName, total: 0, count: 0 };
        }
        subjectMap[g.subjectName].total += g.percentage;
        subjectMap[g.subjectName].count++;
      });

      setGradesByStudent(
        Object.values(studentMap).map(s => ({
          studentName: s.studentName,
          averagePercentage: s.total / s.count,
        }))
      );

      setGradesBySubject(
        Object.values(subjectMap).map(s => ({
          subjectName: s.subjectName,
          averagePercentage: s.total / s.count,
        }))
      );

    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load grades.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchGrades();
  }, [fetchGrades]));

  const handleGenerateReport = async () => {
    if (isSharing) return;
    setIsSharing(true);

    try {
      const studentHTML = gradesByStudent.map(item => `
        <div>
          <h3>${item.studentName}</h3>
          <p>Average: ${item.averagePercentage.toFixed(2)}%</p>
        </div>
      `).join('');

      const subjectHTML = gradesBySubject.map(item => `
        <div>
          <h3>${item.subjectName}</h3>
          <p>Average: ${item.averagePercentage.toFixed(2)}%</p>
        </div>
      `).join('');

      const html = `
        <html>
          <head>
            <meta charset="utf-8" />
            <style>
              body { font-family: Arial; padding: 20px; }
              h1 { text-align: center; color: #1E90FF; }
              h2 { margin-top: 20px; color: #333; }
              div { margin-bottom: 10px; }
            </style>
          </head>
          <body>
            <h1>Grade Report</h1>

            <h2>Student Performance</h2>
            ${studentHTML}

            <h2>Subject Performance</h2>
            ${subjectHTML}
          </body>
        </html>
      `;

      const { uri } = await Print.printToFileAsync({ html });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Report Generated', `Saved at: ${uri}`);
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to generate report.');
    } finally {
      setIsSharing(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Grade Report</Text>

      <Text style={styles.sectionTitle}>By Student</Text>
      {gradesByStudent.map((item, index) => (
        <View key={index} style={styles.card}>
          <Ionicons name="person" size={24} color="#1E90FF" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.studentName}</Text>
            <Text style={styles.cardValue}>{item.averagePercentage.toFixed(2)}%</Text>
          </View>
        </View>
      ))}

      <Text style={styles.sectionTitle}>By Subject</Text>
      {gradesBySubject.map((item, index) => (
        <View key={index} style={styles.card}>
          <Ionicons name="book" size={24} color="#FF8C00" />
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>{item.subjectName}</Text>
            <Text style={styles.cardValue}>{item.averagePercentage.toFixed(2)}%</Text>
          </View>
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleGenerateReport}>
        <Ionicons name="download" size={20} color="white" />
        <Text style={styles.buttonText}>Generate Report</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1E90FF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  cardContent: {
    marginLeft: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardValue: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#1E90FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 10,
    marginTop: 30,
  },
  buttonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
  },
});
