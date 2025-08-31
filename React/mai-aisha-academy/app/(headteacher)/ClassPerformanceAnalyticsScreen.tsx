import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, Alert, ScrollView } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { getAllUsers } from '../../lib/auth';
import { getAllSubjects } from '../../lib/subjects';
import { getClassAveragePerformance, getStudentOverallPerformance } from '../../lib/performance';
import { UserProfile, Subject } from '../../lib/types';

const { width } = Dimensions.get('window');

export default function ClassPerformanceAnalyticsScreen() {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      const subjectsData = await getAllSubjects();
      setStudents(usersData.filter(user => user.role === 'student'));
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Error fetching initial data for analytics:", error);
      Alert.alert("Error", "Failed to load analytics data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => {
    fetchData();
  }, [fetchData]));

  const getStudentName = (uid: string) => {
    const student = students.find(s => s.uid === uid);
    return student ? student.name || student.email : 'Unknown';
  };

  // Group students by class (assuming class info is available in UserProfile or can be derived)
  // For simplicity, let's assume a 'class' field exists on UserProfile
  // In a real app, this would involve a more robust class management system
  const studentsByClass = useMemo(() => {
    const classMap = new Map<string, UserProfile[]>();
    students.forEach(student => {
      const className = student.classes || 'Unassigned'; // Assuming 'classes' field in UserProfile
      if (!classMap.has(className)) {
        classMap.set(className, []);
      }
      classMap.get(className)?.push(student);
    });
    return Array.from(classMap.entries()).map(([className, classStudents]) => ({
      className,
      students: classStudents,
      studentIds: classStudents.map(s => s.uid),
    }));
  }, [students]);

  const renderClassPerformance = ({ item }: { item: typeof studentsByClass[0] }) => {
    const [classAverage, setClassAverage] = useState(0);
    const [fetchingClassAverage, setFetchingClassAverage] = useState(true);

    useEffect(() => {
      const fetchClassAverage = async () => {
        setFetchingClassAverage(true);
        try {
          const result = await getClassAveragePerformance(item.studentIds);
          setClassAverage(result.averageGrade);
        } catch (error) {
          console.error(`Error fetching average for class ${item.className}:`, error);
          setClassAverage(0);
        } finally {
          setFetchingClassAverage(false);
        }
      };
      fetchClassAverage();
    }, [item.studentIds]);

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Class: {item.className}</Text>
        {fetchingClassAverage ? (
          <ActivityIndicator size="small" color="#1E90FF" />
        ) : (
          <Text style={styles.cardDetail}>Average Grade: {classAverage.toFixed(2)}%</Text>
        )}
        <Text style={styles.cardDetail}>Number of Students: {item.students.length}</Text>
        {/* You can add more detailed student-wise breakdown or links to student profiles here */}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading class data...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.mainTitle}>Class Performance Analytics</Text>

      {studentsByClass.length === 0 ? (
        <Text style={styles.noDataText}>No classes or student data available for analytics.</Text>
      ) : (
        <FlatList
          data={studentsByClass}
          renderItem={renderClassPerformance}
          keyExtractor={item => item.className} // Assuming class name is unique
          contentContainerStyle={styles.listContentContainer}
        />
      )}
    </ScrollView>
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
  mainTitle: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#1E90FF',
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
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
  },
  noDataText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
  },
});
