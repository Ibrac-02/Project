import React, { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { getAllUsers } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import { useTheme } from '@/contexts/ThemeContext';
import type { UserProfile } from '@/lib/types';

export default function TeacherSupervisionScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('headteacher');
  const { colors } = useTheme();
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

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
      <Text style={[styles.title, { color: colors.text }]}>Teacher Supervision</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Monitor teacher performance and activities</Text>
      
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading teachers...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Teachers ({teachers.length})</Text>
          {teachers.map((teacher) => (
            <View key={teacher.uid} style={[styles.teacherCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.teacherName, { color: colors.text }]}>{teacher.name || 'Unnamed Teacher'}</Text>
              <Text style={[styles.teacherEmail, { color: colors.text }]}>{teacher.email}</Text>
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
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  teacherCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  teacherEmail: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
  },
});
