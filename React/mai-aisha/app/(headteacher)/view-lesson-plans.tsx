import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useRequireRole } from '@/lib/access';
import { getAllUsers } from '@/lib/auth';

interface LessonPlanDoc {
  id: string;
  teacherId: string;
  title: string;
  subjectId?: string;
  classId?: string;
  date?: string;
  status?: string;
}

export default function HeadteacherViewLessonPlansScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('headteacher');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LessonPlanDoc[]>([]);
  const [teachers, setTeachers] = useState<{ uid: string; name: string | null; email: string | null }[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const [lpSnap, users] = await Promise.all([
      getDocs(collection(db, 'lessonPlans')),
      getAllUsers(),
    ]);
    setItems(lpSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    setTeachers(users.filter(u => u.role === 'teacher').map(u => ({ uid: u.uid, name: u.name || null, email: u.email || null })));
    setLoading(false);
  }, []);

  useEffect(() => { if (allowed) { load(); } }, [allowed, load]);

  const teacherName = useMemo(() => new Map(teachers.map(t => [t.uid, t.name || t.email || t.uid])), [teachers]);

  return (
    !allowed || roleLoading ? null : (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lesson Plans</Text>
      <Text style={styles.subtitle}>All submitted lesson plans</Text>

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}><ActivityIndicator /></View>
      ) : (
        <FlatList
          style={{ marginTop: 12 }}
          data={items}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>Teacher: {teacherName.get(item.teacherId) || item.teacherId}</Text>
                {!!item.date && <Text style={styles.cardMeta}>Date: {item.date}</Text>}
                {!!item.status && <Text style={styles.cardMeta}>Status: {item.status}</Text>}
                {!!item.classId && <Text style={styles.cardMeta}>Class: {item.classId}</Text>}
                {!!item.subjectId && <Text style={styles.cardMeta}>Subject: {item.subjectId}</Text>}
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#666' }}>No lesson plans found.</Text>}
        />
      )}
    </SafeAreaView>
  ));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  cardMeta: { color: '#666', marginTop: 2 },
});
