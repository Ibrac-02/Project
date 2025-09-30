import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';
// import { collection, getDocs } from 'firebase/firestore';
// import { db } from '@/config/firebase';
// import { useRequireRole } from '@/lib/access';

interface GradeDoc {
  marksObtained: number;
  totalMarks: number;
}

interface AttendanceDoc {
  status: 'present' | 'absent' | 'late' | string;
}

export default function GradeReportScreen() {
  // const { allowed, loading: roleLoading } = useRequireRole('admin');
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Reports & Analytics</Text>
      <Text style={styles.subtitle}>Overview of performance and attendance</Text>

      {loading ? (
        <View style={styles.center}><ActivityIndicator /></View>
      ) : error ? (
        <View style={styles.center}><Text style={{ color: '#D11A2A' }}>{error}</Text></View>
      ) : (
        <View style={{ marginTop: 16 }}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Performance</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.metricLabel}>Grades Recorded</Text>
              <Text style={styles.metricValue}>{gradeAgg.count}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.metricLabel}>Average Score</Text>
              <Text style={styles.metricValue}>{gradeAgg.avgPercent.toFixed(1)}%</Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Attendance</Text>
            <View style={styles.rowBetween}><Text style={styles.metricLabel}>Records</Text><Text style={styles.metricValue}>{attendanceAgg.total}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.metricLabel}>Present</Text><Text style={styles.metricValue}>{attendanceAgg.present}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.metricLabel}>Absent</Text><Text style={styles.metricValue}>{attendanceAgg.absent}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.metricLabel}>Late</Text><Text style={styles.metricValue}>{attendanceAgg.late}</Text></View>
            <View style={styles.rowBetween}><Text style={styles.metricLabel}>Present Rate</Text><Text style={styles.metricValue}>{attendanceAgg.presentRate.toFixed(1)}%</Text></View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  center: { marginTop: 20, alignItems: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee', marginTop: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  metricLabel: { color: '#555' },
  metricValue: { color: '#111', fontWeight: '700' },
});
