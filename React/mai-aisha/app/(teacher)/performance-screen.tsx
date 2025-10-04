import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import { useTheme } from '@/contexts/ThemeContext';
import { listGradesForTeacher, type GradeRecord } from '@/lib/grades';

export default function TeacherPerformanceScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('teacher');
  const { user } = useAuth();
  const { colors } = useTheme();
  const teacherId = user?.uid || '';

  const [items, setItems] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
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

  if (!allowed || roleLoading) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Class Performance</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Aggregates based on your submitted grades</Text>

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}><ActivityIndicator color={colors.primaryBlue} /></View>
      ) : (
        <View style={{ marginTop: 12 }}>
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Overall</Text>
            <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Grades Recorded</Text><Text style={[styles.value, { color: colors.text }]}>{overall.count}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Average</Text><Text style={[styles.value, { color: colors.text }]}>{overall.avgPct.toFixed(1)}%</Text></View>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 16, color: colors.text }]}>By Class</Text>
          {byClass.length === 0 ? (
            <Text style={{ color: colors.text + '70' }}>No data yet.</Text>
          ) : byClass.map((row) => (
            <View key={row.classId} style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Class: {row.classId}</Text>
              <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Grades</Text><Text style={[styles.value, { color: colors.text }]}>{row.count}</Text></View>
              <View style={styles.rowBetween}><Text style={[styles.label, { color: colors.text }]}>Average</Text><Text style={[styles.value, { color: colors.text }]}>{row.avgPct.toFixed(1)}%</Text></View>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 2 },
  card: { borderRadius: 10, padding: 16, borderWidth: 1, marginTop: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 6 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  label: {},
  value: { fontWeight: '700' },
  sectionTitle: { fontSize: 18, fontWeight: '700' },
});
