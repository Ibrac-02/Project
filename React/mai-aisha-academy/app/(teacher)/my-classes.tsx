import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { getAllClasses, SchoolClass } from '../../lib/schoolData';
import { getStudentsByTeacher, Student } from '../../lib/students';

export default function TeacherMyClassesScreen() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [studentsInSelectedClass, setStudentsInSelectedClass] = useState<Student[]>([]);

  const fetchTeacherClasses = useCallback(async () => {
    if (!user?.uid || !userProfile?.classesHandled) return;

    try {
      const allSchoolClasses = await getAllClasses();
      const assignedClasses = allSchoolClasses.filter(cls => userProfile.classesHandled?.includes(cls.id));
      setTeacherClasses(assignedClasses);

      if (assignedClasses.length > 0 && !selectedClassId) {
        setSelectedClassId(assignedClasses[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching teacher's classes:", err);
      setError("Failed to load your classes.");
    }
  }, [user?.uid, userProfile?.classesHandled, selectedClassId]);

  const fetchStudentsInClass = useCallback(async () => {
    if (!selectedClassId || !user?.uid) {
      setStudentsInSelectedClass([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const students = await getStudentsByTeacher(user.uid);
      const filteredStudents = students.filter(s => s.classId === selectedClassId);
      setStudentsInSelectedClass(filteredStudents);
    } catch (err: any) {
      console.error("Error fetching students for class:", err);
      setError("Failed to load students for the selected class.");
    } finally {
      setLoading(false);
    }
  }, [selectedClassId, user?.uid]);

  useEffect(() => {
    if (!authLoading) {
      fetchTeacherClasses();
    }
  }, [authLoading, fetchTeacherClasses]);

  useEffect(() => {
    fetchStudentsInClass();
  }, [fetchStudentsInClass]);

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading classes and students...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={() => { fetchTeacherClasses(); fetchStudentsInClass(); }} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Classes</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.classSelectionContainer}>
          <Text style={styles.label}>Select Class:</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedClassId}
              onValueChange={(itemValue) => setSelectedClassId(itemValue as string)}
              style={styles.picker}
            >
              {teacherClasses.length === 0 ? (
                <Picker.Item label="No classes assigned" value={null} />
              ) : (
                teacherClasses.map(cls => (
                  <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                ))
              )}
            </Picker>
          </View>
        </View>

        {selectedClassId ? (
          <View style={styles.studentsListContainer}>
            <Text style={styles.studentsListTitle}>
              Students in {teacherClasses.find(c => c.id === selectedClassId)?.name || 'Selected Class'}
            </Text>
            {studentsInSelectedClass.length === 0 ? (
              <Text style={styles.noDataText}>No students found in this class.</Text>
            ) : (
              <FlatList
                data={studentsInSelectedClass}
                keyExtractor={(item) => item.id}
                renderItem={({ item: student }) => (
                  <View style={styles.studentCard}>
                    <Ionicons name="person-circle-outline" size={24} color="#1E90FF" />
                    <Text style={styles.studentName}>{student.name || student.email}</Text>
                  </View>
                )}
                scrollEnabled={false}
              />
            )}
          </View>
        ) : (
          <Text style={styles.noDataText}>Please select a class to view its students.</Text>
        )}
      </ScrollView>
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
  classSelectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  studentsListContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  studentsListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  studentName: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});

