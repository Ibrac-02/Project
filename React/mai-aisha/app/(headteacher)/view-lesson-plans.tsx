import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { getAllUsers } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import { useTheme } from '@/contexts/ThemeContext';
import type { UserProfile } from '@/lib/types';

interface LessonPlanDoc {
  id: string;
  teacherId: string;
  title: string;
  subjectId?: string;
  classId?: string;
  date?: string;
  status?: string;
}

export default function ViewLessonPlansScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('headteacher');
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (allowed) {
      loadTeachers();
    }
  }, [allowed]);

  const loadTeachers = async () => {
    setLoading(true);
    try {
      const users = await getAllUsers();
      setTeachers(users.filter(u => u.role === 'teacher'));
    } catch (error) {
      console.error('Error loading teachers:', error);
    }
    setLoading(false);
  };

  if (!allowed || roleLoading) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Lesson Plans</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>View all teacher lesson plans</Text>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading lesson plans...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Teachers ({teachers.length})</Text>
          {teachers.map((teacher) => (
            <View key={teacher.uid} style={[styles.teacherCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.teacherName, { color: colors.text }]}>{teacher.name || 'Unnamed Teacher'}</Text>
              <Text style={[styles.teacherEmail, { color: colors.text }]}>{teacher.email}</Text>
              <Text style={[styles.teacherMeta, { color: colors.text }]}>Lesson plans: Coming soon</Text>
            </View>
          ))}
          {teachers.length === 0 && (
            <Text style={[styles.emptyText, { color: colors.text }]}>No teachers found</Text>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { fontSize: 16, color: '#666', marginTop: 8 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 12 },
  teacherCard: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee', marginBottom: 12 },
  teacherName: { fontSize: 16, fontWeight: '700', color: '#333' },
  teacherEmail: { fontSize: 14, color: '#666', marginTop: 2 },
  teacherMeta: { fontSize: 14, color: '#666', marginTop: 4 },
  emptyText: { fontSize: 16, color: '#666', textAlign: 'center', marginTop: 20 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  cardMeta: { color: '#666', marginTop: 2 },
});
