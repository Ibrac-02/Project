import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Dimensions, Alert } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { getTeacherPerformanceOverview } from '../../lib/performance';

const { width } = Dimensions.get('window');

export default function TeacherPerformanceScreen() {
  const { user, loading: authLoading } = useAuth();
  const [performanceData, setPerformanceData] = useState<Awaited<ReturnType<typeof getTeacherPerformanceOverview>>>([]);
  const [loading, setLoading] = useState(true);

  const fetchPerformance = useCallback(async () => {
    if (!user?.uid) return;

    setLoading(true);
    try {
      const data = await getTeacherPerformanceOverview(user.uid);
      setPerformanceData(data);
    } catch (error) {
      console.error("Error fetching teacher performance data:", error);
      Alert.alert("Error", "Failed to load performance data.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(useCallback(() => {
    fetchPerformance();
  }, [fetchPerformance]));

  const renderSubjectPerformance = ({ item }: { item: typeof performanceData[0] }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Subject: {item.subjectName}</Text>
      <Text style={styles.cardDetail}>Average Grade: {item.averageGrade.toFixed(2)}%</Text>
      <Text style={styles.cardDetail}>Students Graded: {item.totalStudentsGraded}</Text>
    </View>
  );

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading your performance data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Performance Overview</Text>
      {performanceData.length === 0 ? (
        <Text style={styles.noDataText}>No performance data available for your classes.</Text>
      ) : (
        <FlatList
          data={performanceData}
          renderItem={renderSubjectPerformance}
          keyExtractor={(item) => item.subjectName} // Subject name as key, assuming unique per teacher
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
    fontSize: 25,
    fontWeight: 400,
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
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
    color: '#1E90FF',
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
