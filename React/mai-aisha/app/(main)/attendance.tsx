import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useTheme } from '@/contexts/ThemeContext';

interface AttendanceDoc {
  id: string;
  teacherId?: string;
  classId?: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: 'present' | 'absent' | 'late' | string;
}

export default function AttendanceOverviewScreen() {
  const { colors } = useTheme();
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Attendance Overview</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>School-wide attendance summary</Text>

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}><ActivityIndicator color={colors.primaryBlue} /></View>
      ) : items.length === 0 ? (
        <View style={{ marginTop: 16, alignItems: 'center' }}>
          <Text style={{ color: colors.text + '70' }}>No attendance data available yet.</Text>
        </View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Summary</Text>
            <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Records</Text><Text style={[styles.value, { color: colors.text }]}>{aggregates.total}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Present</Text><Text style={[styles.value, { color: colors.text }]}>{aggregates.present}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Absent</Text><Text style={[styles.value, { color: colors.text }]}>{aggregates.absent}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Late</Text><Text style={[styles.value, { color: colors.text }]}>{aggregates.late}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Present Rate</Text><Text style={[styles.value, { color: colors.text }]}>{aggregates.presentRate.toFixed(1)}%</Text></View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 2 },
  card: { borderRadius: 10, padding: 16, borderWidth: 1, marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: {},
  value: { fontWeight: '700' },
})
