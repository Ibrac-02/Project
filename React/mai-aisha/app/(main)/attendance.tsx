import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface AttendanceDoc {
  id: string;
  teacherId?: string;
  classId?: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | string;
}

export default function AttendanceOverviewScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<AttendanceDoc[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, 'attendance'));
    const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    setItems(data as AttendanceDoc[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const aggregates = useMemo(() => {
    const total = items.length;
    const present = items.filter(i => i.status === 'present').length;
    const absent = items.filter(i => i.status === 'absent').length;
    const late = items.filter(i => i.status === 'late').length;
    const presentRate = total > 0 ? (present / total) * 100 : 0;
    return { total, present, absent, late, presentRate };
  }, [items]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Attendance Overview</Text>
      <Text style={styles.subtitle}>School-wide attendance summary</Text>

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}><ActivityIndicator /></View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Summary</Text>
            <View style={styles.rowBetween}><Text style={styles.label}>Records</Text><Text style={styles.value}>{aggregates.total}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.label}>Present</Text><Text style={styles.value}>{aggregates.present}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.label}>Absent</Text><Text style={styles.value}>{aggregates.absent}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.label}>Late</Text><Text style={styles.value}>{aggregates.late}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.label}>Present Rate</Text><Text style={styles.value}>{aggregates.presentRate.toFixed(1)}%</Text></View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee', marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#555' },
  value: { color: '#111', fontWeight: '700' },
})
