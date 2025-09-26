import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { getAllUsers } from '@/lib/auth';
import type { UserProfile } from '@/lib/types';

interface AttendanceDoc {
  id: string;
  teacherId: string;
  classId?: string;
  date?: string;
  status?: string;
}

interface LessonPlanDoc {
  id: string;
  teacherId: string;
  title: string;
  subjectId?: string;
  classId?: string;
  date?: string;
  status?: string;
}

export default function TeacherSupervisionScreen() {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<AttendanceDoc[]>([]);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanDoc[]>([]);

  async function loadTeachers() {
    const users = await getAllUsers();
    setTeachers(users.filter(u => u.role === 'teacher'));
  }

  async function loadForTeacher(teacherId: string | null) {
    setLoading(true);
    try {
      // If none selected, show all teachers' latest 50
      if (!teacherId) {
        const [attSnap, lpSnap] = await Promise.all([
          getDocs(collection(db, 'attendance')),
          getDocs(collection(db, 'lessonPlans')),
        ]);
        setAttendance(attSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        setLessonPlans(lpSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      } else {
        const [attSnap, lpSnap] = await Promise.all([
          getDocs(query(collection(db, 'attendance'), where('teacherId', '==', teacherId))),
          getDocs(query(collection(db, 'lessonPlans'), where('teacherId', '==', teacherId))),
        ]);
        setAttendance(attSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
        setLessonPlans(lpSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    loadForTeacher(selectedTeacher);
  }, [selectedTeacher]);

  const teacherMap = useMemo(() => new Map(teachers.map(t => [t.uid, t])), [teachers]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Teacher Supervision</Text>
      <Text style={styles.subtitle}>View teacher attendance submissions and lesson plans</Text>

      <View style={styles.filtersRow}>
        <TouchableOpacity onPress={() => setSelectedTeacher(null)} style={[styles.filterChip, !selectedTeacher && styles.filterChipActive]}>
          <Text style={[styles.filterText, !selectedTeacher && styles.filterTextActive]}>All Teachers</Text>
        </TouchableOpacity>
        <FlatList
          data={teachers}
          horizontal
          keyExtractor={(t) => t.uid}
          contentContainerStyle={{ paddingHorizontal: 4 }}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => {
            const active = selectedTeacher === item.uid;
            return (
              <TouchableOpacity onPress={() => setSelectedTeacher(active ? null : item.uid)} style={[styles.filterChip, active && styles.filterChipActive]}>
                <Text style={[styles.filterText, active && styles.filterTextActive]}>{item.name || item.email}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}><ActivityIndicator /></View>
      ) : (
        <View>
          <Text style={styles.sectionTitle}>Attendance</Text>
          <FlatList
            data={attendance}
            keyExtractor={(i) => i.id}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{teacherMap.get(item.teacherId || '')?.name || item.teacherId || 'Unknown'}</Text>
                <Text style={styles.cardMeta}>Date: {item.date || '-'}</Text>
                <Text style={styles.cardMeta}>Status: {item.status || '-'}</Text>
                {!!item.classId && <Text style={styles.cardMeta}>Class: {item.classId}</Text>}
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#666' }}>No attendance records.</Text>}
          />

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Lesson Plans</Text>
          <FlatList
            data={lessonPlans}
            keyExtractor={(i) => i.id}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>Teacher: {teacherMap.get(item.teacherId || '')?.name || item.teacherId || 'Unknown'}</Text>
                <Text style={styles.cardMeta}>Date: {item.date || '-'}</Text>
                <Text style={styles.cardMeta}>Status: {item.status || '-'}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={{ color: '#666' }}>No lesson plans.</Text>}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  filtersRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 16, marginRight: 8 },
  filterChipActive: { borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  filterText: { color: '#444' },
  filterTextActive: { color: '#1E90FF', fontWeight: '600' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333', marginVertical: 10 },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardMeta: { color: '#666', marginTop: 2 },
});
