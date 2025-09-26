import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { listGradesForTeacher, type GradeRecord } from '@/lib/grades';

export default function TeacherPerformanceScreen() {
  const { user } = useAuth();
  const teacherId = user?.uid || '';

  const [items, setItems] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const grades = await listGradesForTeacher(teacherId);
    setItems(grades);
    setLoading(false);
  }, [teacherId]);

  useEffect(() => { load(); }, [load]);

  const byClass = useMemo(() => {
    const map = new Map<string, { total: number; sumPct: number }>();
    for (const g of items) {
      const key = g.classId || 'Unassigned';
      const pct = g.totalMarks > 0 ? (g.marksObtained / g.totalMarks) * 100 : 0;
      const cur = map.get(key) || { total: 0, sumPct: 0 };
      cur.total += 1; cur.sumPct += pct;
      map.set(key, cur);
    }
    return Array.from(map.entries()).map(([classId, { total, sumPct }]) => ({ classId, count: total, avgPct: total > 0 ? sumPct / total : 0 }));
  }, [items]);

  const overall = useMemo(() => {
    if (!items.length) return { count: 0, avgPct: 0 };
    let sum = 0; let denom = 0;
    for (const g of items) { sum += g.marksObtained; denom += g.totalMarks; }
    return { count: items.length, avgPct: denom > 0 ? (sum / denom) * 100 : 0 };
  }, [items]);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Class Performance</Text>
      <Text style={styles.subtitle}>Aggregates based on your submitted grades</Text>

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}><ActivityIndicator /></View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Overall</Text>
            <View style={styles.rowBetween}><Text style={styles.label}>Grades Recorded</Text><Text style={styles.value}>{overall.count}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.label}>Average</Text><Text style={styles.value}>{overall.avgPct.toFixed(1)}%</Text></View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 16 }]}>By Class</Text>
          {byClass.length === 0 ? (
            <Text style={{ color: '#666' }}>No data yet.</Text>
          ) : byClass.map((row) => (
            <View key={row.classId} style={styles.card}>
              <Text style={styles.cardTitle}>Class: {row.classId}</Text>
              <View style={styles.rowBetween}><Text style={styles.label}>Grades</Text><Text style={styles.value}>{row.count}</Text></View>
              <View style={styles.rowBetween}><Text style={styles.label}>Average</Text><Text style={styles.value}>{row.avgPct.toFixed(1)}%</Text></View>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee', marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: { color: '#555' },
  value: { color: '#111', fontWeight: '700' },
});
