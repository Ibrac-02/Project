import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { listStudents } from '@/lib/students-offline';
import { listClasses } from '@/lib/classes';
import { useAuth } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import type { UserProfile, SchoolClass } from '@/lib/types';

export default function TeacherStudentsScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('teacher');
  const { user } = useAuth();
  const teacherId = user?.uid || '';

  const [students, setStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      // Get classes assigned to this teacher
      const allClasses = await listClasses();
      const teacherClasses = allClasses.filter(c => c.teacherId === teacherId);
      setClasses(teacherClasses);

      // Get all students, then filter by selected class if any
      const allStudents = await listStudents(selectedClass || undefined);
      
      // If no class is selected, show students from all teacher's classes
      if (!selectedClass && teacherClasses.length > 0) {
        const teacherClassIds = teacherClasses.map(c => c.id);
        const studentsInTeacherClasses = allStudents.filter(student => 
          student.classes && teacherClassIds.includes(student.classes)
        );
        setStudents(studentsInTeacherClasses);
      } else {
        setStudents(allStudents);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      Alert.alert('Error', 'Failed to load students');
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedClass]);

  useFocusEffect(useCallback(() => { 
    if (allowed) { 
      load(); 
    } 
  }, [allowed, load]));

  const getClassName = (classId: string | null | undefined) => {
    if (!classId) return 'No Class Assigned';
    const cls = classes.find(c => c.id === classId);
    return cls ? cls.name : 'Unknown Class';
  };

  const renderStudent = ({ item: student }: { item: UserProfile }) => (
    <View style={styles.studentCard}>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{student.name || 'Unnamed Student'}</Text>
        <Text style={styles.studentMeta}>
          Class: {getClassName(student.classes)}
        </Text>
        {student.gender && (
          <Text style={styles.studentMeta}>
            Gender: {student.gender}
          </Text>
        )}
        {student.contactNumber && (
          <Text style={styles.studentMeta}>
            Contact: {student.contactNumber}
          </Text>
        )}
      </View>
      <View style={styles.studentActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Student Info', `Name: ${student.name}\nClass: ${getClassName(student.classes)}\nGender: ${student.gender || 'Not specified'}`)}
        >
          <Ionicons name="information-circle-outline" size={20} color="#1E90FF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (!allowed || roleLoading) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* <View style={styles.header}>
        <Text style={styles.title}>My Students</Text>
        <Text style={styles.subtitle}>Students in your classes</Text>
      </View> */}

      {/* Class Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.filterLabel}>Filter by Class:</Text>
        <View style={styles.classChips}>
          <TouchableOpacity 
            style={[styles.classChip, !selectedClass && styles.classChipActive]}
            onPress={() => setSelectedClass(null)}
          >
            <Text style={[styles.classChipText, !selectedClass && styles.classChipTextActive]}>
              All My Classes
            </Text>
          </TouchableOpacity>
          {classes.map(cls => (
            <TouchableOpacity 
              key={cls.id}
              style={[styles.classChip, selectedClass === cls.id && styles.classChipActive]}
              onPress={() => setSelectedClass(cls.id)}
            >
              <Text style={[styles.classChipText, selectedClass === cls.id && styles.classChipTextActive]}>
                {cls.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Students List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1E90FF" />
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.uid}
          renderItem={renderStudent}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>
                {classes.length === 0 
                  ? "No classes assigned to you yet" 
                  : "No students found in your classes"
                }
              </Text>
              {classes.length === 0 && (
                <Text style={styles.emptySubtext}>
                  Contact your administrator to get assigned to classes
                </Text>
              )}
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Summary */}
      {!loading && students.length > 0 && (
        <View style={styles.summaryCard}>
          <Text style={styles.summaryText}>
            Total Students: {students.length} • Classes: {classes.length}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1E90FF',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  filterSection: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  classChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#f9fafb',
  },
  classChipActive: {
    backgroundColor: '#1E90FF',
    borderColor: '#1E90FF',
  },
  classChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  classChipTextActive: {
    color: '#fff',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  studentMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 2,
  },
  studentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
  summaryCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
});
