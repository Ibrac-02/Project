import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listGradesAll, updateGrade, type GradeRecord } from '@/lib/grades';
import { useRequireRole } from '@/lib/access';
import { useTheme } from '@/contexts/ThemeContext';

interface GradeDoc {
  id: string;
  studentId: string;
  subjectId: string;
  teacherId: string;
  marksObtained: number;
  totalMarks: number;
  status: 'pending' | 'approved' | 'rejected' | string;
}

export default function ReportsApprovalsScreen() {
  const { colors } = useTheme();
  const { allowed, loading: roleLoading } = useRequireRole('headteacher');
  const [items, setItems] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const grades = await listGradesAll();
      setItems(grades.filter(g => g.status === 'pending'));
    } catch (error) {
      console.error('Error loading grades:', error);
    }
    setLoading(false);
  }

  useEffect(() => { if (allowed) { load(); } }, [allowed]);

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateGrade(id, { status });
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not update status');
    }
  };

  if (!allowed || roleLoading) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Approve Reports</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Review class performance submissions</Text>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Student: {item.studentId}</Text>
              <Text style={styles.cardMeta}>Subject: {item.subjectId} • Teacher: {item.teacherId}</Text>
              <Text style={styles.cardMeta}>Marks: {item.marksObtained}/{item.totalMarks}</Text>
            </View>
            <View style={styles.row}>
              <TouchableOpacity onPress={() => setStatus(item.id, 'approved')} style={[styles.btn, styles.btnApprove]}>
                <Text style={styles.btnApproveText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setStatus(item.id, 'rejected')} style={[styles.btn, styles.btnReject]}>
                <Text style={styles.btnRejectText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? (<Text style={{ color: colors.text + '70' }}>No pending grades.</Text>) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 2 },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, borderWidth: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { marginTop: 2 },
  row: { flexDirection: 'row' },
  btn: { height: 36, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  btnApprove: { backgroundColor: '#2E7D32' },
  btnApproveText: { color: '#fff', fontWeight: '600' },
  btnReject: { backgroundColor: '#D11A2A' },
  btnRejectText: { color: '#fff', fontWeight: '600' },
});
