import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '@/config/firebase';
// import { useRequireRole } from '@/lib/access';
import { useTheme } from '@/contexts/ThemeContext';

interface GradeDoc {
  marksObtained: number;
  totalMarks: number;
}

interface AttendanceDoc {
  status: 'present' | 'absent' | 'late' | string;
}

export default function GradeReportScreen() {
  // const { allowed, loading: roleLoading } = useRequireRole('admin');
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [grades, setGrades] = useState<GradeDoc[]>([]);
  const [attendance, setAttendance] = useState<AttendanceDoc[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // TODO: Implement grade and attendance fetching
      // const [gradesSnap, attendanceSnap] = await Promise.all([
      //   getDocs(collection(db, 'grades')),
      //   getDocs(collection(db, 'attendance')),
      // ]);
      // setGrades(gradesSnap.docs.map((d) => d.data() as GradeDoc));
      // setAttendance(attendanceSnap.docs.map((d) => d.data() as AttendanceDoc));
      setGrades([]);
      setAttendance([]);
    } catch (error: any) {
      setError(error?.message || 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const gradeAgg = useMemo(() => {
    if (!grades.length) return { count: 0, avgPercent: 0 };
    let sum = 0;
    let denom = 0;
    for (const g of grades) {
      sum += (g.marksObtained || 0);
      denom += (g.totalMarks || 0);
    }
    const avgPercent = denom > 0 ? (sum / denom) * 100 : 0;
    return { count: grades.length, avgPercent };
  }, [grades]);

  const attendanceAgg = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const presentRate = total > 0 ? (present / total) * 100 : 0;
    return { total, present, absent, late, presentRate };
  }, [attendance]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Reports & Analytics</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Overview of performance and attendance</Text>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color={colors.primaryBlue} /></View>
      ) : error ? (
        <View style={styles.center}><Text style={{ color: colors.danger }}>{error}</Text></View>
      ) : (
        <View style={{ marginTop: 16 }}>
          {(gradeAgg.count === 0 && attendanceAgg.total === 0) ? (
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Text style={{ color: colors.text + '70' }}>No reports available yet.</Text>
            </View>
          ) : (
            <></>
          )}
          {gradeAgg.count > 0 && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
            <Text style={[styles.cardTitle, { color: colors.text }]}>Performance</Text>
            <View style={styles.rowBetween}>
              <Text style={[styles.metricLabel, { color: colors.text }]}>Grades Recorded</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{gradeAgg.count}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={[styles.metricLabel, { color: colors.text }]}>Average Score</Text>
              <Text style={[styles.metricValue, { color: colors.text }]}>{gradeAgg.avgPercent.toFixed(1)}%</Text>
            </View>
          </View>
          )}
          {attendanceAgg.total > 0 && (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
            <Text style={[styles.cardTitle, { color: colors.text }]}>Attendance</Text>
            <View style={styles.rowBetween}><Text style={[styles.metricLabel, { color: colors.text }]}>Records</Text><Text style={[styles.metricValue, { color: colors.text }]}>{attendanceAgg.total}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.metricLabel, { color: colors.text }]}>Present</Text><Text style={[styles.metricValue, { color: colors.text }]}>{attendanceAgg.present}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.metricLabel, { color: colors.text }]}>Absent</Text><Text style={[styles.metricValue, { color: colors.text }]}>{attendanceAgg.absent}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.metricLabel, { color: colors.text }]}>Late</Text><Text style={[styles.metricValue, { color: colors.text }]}>{attendanceAgg.late}</Text></View>
            <View style={styles.rowBetween}><Text style={[styles.metricLabel, { color: colors.text }]}>Present Rate</Text><Text style={[styles.metricValue, { color: colors.text }]}>{attendanceAgg.presentRate.toFixed(1)}%</Text></View>
          </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 2 },
  center: { marginTop: 20, alignItems: 'center' },
  card: { borderRadius: 10, padding: 16, borderWidth: 1, marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metricLabel: {},
  metricValue: { fontWeight: '700' },
});
