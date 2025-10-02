import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import { createGrade, deleteGrade, listGradesForTeacher, updateGrade, type GradeRecord } from '@/lib/grades';
import { listClasses } from '@/lib/classes';
import { listSubjects } from '@/lib/subjects';
import AutoComplete from '@/components/AutoComplete';

export default function TeacherMarksScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('teacher');
  const { user } = useAuth();
  const teacherId = user?.uid || '';

  const [items, setItems] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GradeRecord | null>(null);
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [totalMarks, setTotalMarks] = useState('');

  const load = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const [grades, cls, subs] = await Promise.all([
      listGradesForTeacher(teacherId),
      listClasses(),
      listSubjects(),
    ]);
    setItems(grades);
    setClasses(cls.map(c => ({ id: c.id, name: c.name })));
    setSubjects(subs.map(s => ({ id: s.id, name: s.name })));
    setLoading(false);
  }, [teacherId]);

  useEffect(() => { if (allowed) { load(); } }, [allowed, load]);

  const openNew = () => {
    setEditing(null);
    setClassId('');
    setSubjectId('');
    setStudentId('');
    setMarksObtained('');
    setTotalMarks('');
    setModalOpen(true);
  };

  const openEdit = (rec: GradeRecord) => {
    setEditing(rec);
    setClassId(rec.classId || '');
    setSubjectId(rec.subjectId);
    setStudentId(rec.studentId);
    setMarksObtained(String(rec.marksObtained));
    setTotalMarks(String(rec.totalMarks));
    setModalOpen(true);
  };

  const save = async () => {
    if (!teacherId) { Alert.alert('Not allowed'); return; }
    if (!subjectId || !studentId.trim() || !marksObtained || !totalMarks) { Alert.alert('Validation', 'Subject, student, and marks are required.'); return; }
    const mo = Number(marksObtained); const tm = Number(totalMarks);
    if (Number.isNaN(mo) || Number.isNaN(tm) || tm <= 0) { Alert.alert('Validation', 'Marks must be valid numbers and total > 0'); return; }
    const payload = {
      classId: classId || '',
      subjectId,
      studentId: studentId.trim(),
      teacherId,
      marksObtained: mo,
      totalMarks: tm,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    } as Omit<GradeRecord, 'id'>;
    try {
      if (editing) await updateGrade(editing.id, payload);
      else await createGrade(payload);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not save marks');
    }
  };

  const remove = (rec: GradeRecord) => {
    Alert.alert('Delete record', `Delete marks for ${rec.studentId}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteGrade(rec.id); await load(); } }
    ]);
  };

  const className = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
  const subjectName = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);
  const classOptions = useMemo(() => classes.map(c => ({ id: c.id, name: c.name })), [classes]);
  const subjectOptions = useMemo(() => subjects.map(s => ({ id: s.id, name: s.name })), [subjects]);
  const studentOptions = useMemo(() => {
    const set = new Set<string>();
    for (const it of items) { if (it.studentId) set.add(it.studentId); }
    if (studentId && !set.has(studentId)) set.add(studentId);
    return Array.from(set).map(s => ({ id: s, name: s }));
  }, [items, studentId]);

  return (
    !allowed || roleLoading ? null : (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Student Marks</Text>
      <Text style={styles.subtitle}>Add and edit exam results</Text>

      <TouchableOpacity onPress={openNew} style={styles.addBtn}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>New Marks</Text>
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
              <Text style={styles.cardMeta}>Subject: {subjectName.get(item.subjectId) || item.subjectId} {item.classId ? `• Class: ${className.get(item.classId) || item.classId}` : ''}</Text>
              <Text style={styles.cardMeta}>Marks: {item.marksObtained}/{item.totalMarks} • Status: {item.status}</Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}><Ionicons name="create-outline" size={20} color="#1E90FF" /></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item)} style={styles.iconBtn}><Ionicons name="trash-outline" size={20} color="#D11A2A" /></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No marks yet.</Text>) : null}
      />

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Marks' : 'New Marks'}</Text>
            <Text style={styles.label}>Class</Text>
            <AutoComplete
              value={classId ? (className.get(classId) || '') : ''}
              placeholder="Search class..."
              data={classOptions}
              labelExtractor={(i) => i.name}
              onChangeText={() => { /* search-only */ }}
              onSelectItem={(it) => setClassId(it.id)}
            />
            <Text style={styles.label}>Subject</Text>
            <AutoComplete
              value={subjectId ? (subjectName.get(subjectId) || '') : ''}
              placeholder="Search subject..."
              data={subjectOptions}
              labelExtractor={(i) => i.name}
              onChangeText={() => { /* search-only */ }}
              onSelectItem={(it) => setSubjectId(it.id)}
            />
            <Text style={styles.label}>Student</Text>
            <AutoComplete
              value={studentId}
              placeholder="Type or select student ID..."
              data={studentOptions}
              labelExtractor={(i) => i.name}
              onChangeText={setStudentId}
              onSelectItem={(it) => setStudentId(it.id)}
            />
            <View style={{ flexDirection: 'row' }}>
              <TextInput value={marksObtained} onChangeText={setMarksObtained} placeholder="Marks" keyboardType="numeric" style={[styles.input, { flex: 1, marginRight: 6 }]} />
              <TextInput value={totalMarks} onChangeText={setTotalMarks} placeholder="Total" keyboardType="numeric" style={[styles.input, { flex: 1, marginLeft: 6 }]} />
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
