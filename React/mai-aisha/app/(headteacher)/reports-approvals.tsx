import React, { useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { collection, getDocs, query, updateDoc, where, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

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
  const [items, setItems] = useState<GradeDoc[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const snap = await getDocs(query(collection(db, 'grades'), where('status', '==', 'pending')));
    setItems(snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'grades', id), { status });
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not update status');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Approve Reports</Text>
      <Text style={styles.subtitle}>Review class performance submissions</Text>

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
        ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No pending reports.</Text>) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardMeta: { color: '#666', marginTop: 2 },
  row: { flexDirection: 'row' },
  btn: { height: 36, paddingHorizontal: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  btnApprove: { backgroundColor: '#2E7D32' },
  btnApproveText: { color: '#fff', fontWeight: '600' },
  btnReject: { backgroundColor: '#D11A2A' },
  btnRejectText: { color: '#fff', fontWeight: '600' },
});
