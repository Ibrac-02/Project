import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createAttendance, deleteAttendance, listAttendanceForTeacher, updateAttendance, type AttendanceRecord, type AttendanceStatus } from '@/lib/attendance';
import { useAuth } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import { listClasses } from '@/lib/classes';

export default function TeacherAttendanceScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('teacher');
  const { user } = useAuth();
  const teacherId = user?.uid || '';

  const [items, setItems] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [date, setDate] = useState('');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('present');

  const load = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const [att, cls] = await Promise.all([
      listAttendanceForTeacher(teacherId),
      listClasses(),
    ]);
    setItems(att);
    setClasses(cls.map(c => ({ id: c.id, name: c.name })));
    setLoading(false);
  }, [teacherId]);

  useEffect(() => { if (allowed) { load(); } }, [allowed, load]);

  const openNew = () => {
    setEditing(null);
    setDate('');
    setClassId('');
    setStudentId('');
    setStatus('present');
    setModalOpen(true);
  };

  const openEdit = (rec: AttendanceRecord) => {
    setEditing(rec);
    setDate(rec.date);
    setClassId(rec.classId || '');
    setStudentId(rec.studentId);
    setStatus(rec.status);
    setModalOpen(true);
  };

  const save = async () => {
    if (!teacherId) { Alert.alert('Not allowed'); return; }
    if (!date.trim() || !studentId.trim()) { Alert.alert('Validation', 'Date and student ID are required.'); return; }
    const payload = {
      date: date.trim(),
      classId: classId || undefined,
      studentId: studentId.trim(),
      status,
      teacherId,
    } as Omit<AttendanceRecord, 'id'>;
    try {
      if (editing) await updateAttendance(editing.id, payload);
      else await createAttendance(payload);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not save attendance');
    }
  };

  const remove = (rec: AttendanceRecord) => {
    Alert.alert('Delete record', `Delete attendance for ${rec.studentId} on ${rec.date}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteAttendance(rec.id); await load(); } }
    ]);
  };

  const className = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);

  return (
    !allowed || roleLoading ? null : (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Student Attendance</Text>
      <Text style={styles.subtitle}>Mark, edit and view attendance</Text>

      <TouchableOpacity onPress={openNew} style={styles.addBtn}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>New Record</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.studentId}</Text>
              <Text style={styles.cardMeta}>Date: {item.date} • Status: {item.status}</Text>
              {!!item.classId && <Text style={styles.cardMeta}>Class: {className.get(item.classId) || item.classId}</Text>}
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}><Ionicons name="create-outline" size={20} color="#1E90FF" /></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item)} style={styles.iconBtn}><Ionicons name="trash-outline" size={20} color="#D11A2A" /></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No attendance yet.</Text>) : null}
      />

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Attendance' : 'New Attendance'}</Text>
            <TextInput value={date} onChangeText={setDate} placeholder="Date (YYYY-MM-DD)" style={styles.input} />
            <Text style={styles.label}>Class</Text>
            <View style={styles.chipsRow}>
              {classes.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setClassId(c.id)} style={[styles.chip, classId === c.id && styles.chipActive]}>
                  <Text style={[styles.chipText, classId === c.id && styles.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput value={studentId} onChangeText={setStudentId} placeholder="Student ID" style={styles.input} />
            <Text style={styles.label}>Status</Text>
            <View style={styles.chipsRow}>
              {(['present','absent','late'] as AttendanceStatus[]).map(s => (
                <TouchableOpacity key={s} onPress={() => setStatus(s)} style={[styles.chip, status === s && styles.chipActive]}>
                  <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  ));
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  addBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', paddingHorizontal: 12, height: 36, borderRadius: 8, marginTop: 12, marginBottom: 8 },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardMeta: { color: '#666', marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 8 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600', color: '#555' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 16, marginRight: 8, marginBottom: 8 },
  chipActive: { borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  chipText: { color: '#444' },
  chipTextActive: { color: '#1E90FF', fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  btn: { height: 42, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  btnGhostText: { color: '#333' },
  btnPrimary: { backgroundColor: '#1E90FF' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
