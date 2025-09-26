import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createExam, deleteExam, listExams, updateExam, type ExamSchedule } from '@/lib/exams';
import { listClasses } from '@/lib/classes';
import { listSubjects } from '@/lib/subjects';

export default function ExamsScreen() {
  const [items, setItems] = useState<ExamSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ExamSchedule | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');

  async function load() {
    setLoading(true);
    const [exams, cls, subs] = await Promise.all([
      listExams(),
      listClasses(),
      listSubjects(),
    ]);
    setItems(exams);
    setClasses(cls.map(c => ({ id: c.id, name: c.name })));
    setSubjects(subs.map(s => ({ id: s.id, name: s.name })));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setDate('');
    setClassId('');
    setSubjectId('');
    setModalOpen(true);
  };

  const openEdit = (e: ExamSchedule) => {
    setEditing(e);
    setTitle(e.title);
    setDate(e.date);
    setClassId(e.classId);
    setSubjectId(e.subjectId);
    setModalOpen(true);
  };

  const save = async () => {
    if (!title.trim() || !date.trim() || !classId || !subjectId) {
      Alert.alert('Validation', 'Title, date, class and subject are required.');
      return;
    }
    try {
      const payload = { title: title.trim(), date: date.trim(), classId, subjectId } as Omit<ExamSchedule, 'id'>;
      if (editing) await updateExam(editing.id, payload);
      else await createExam(payload);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not save exam');
    }
  };

  const remove = (e: ExamSchedule) => {
    Alert.alert('Delete exam', `Delete ${e.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteExam(e.id); await load(); } }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Exam Schedules</Text>
      <Text style={styles.subtitle}>Create and manage exam schedules</Text>

      <TouchableOpacity onPress={openNew} style={styles.addBtn}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>New Exam</Text>
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
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>Date: {item.date}</Text>
              <Text style={styles.cardMeta}>Class: {classes.find(c => c.id === item.classId)?.name || item.classId}</Text>
              <Text style={styles.cardMeta}>Subject: {subjects.find(s => s.id === item.subjectId)?.name || item.subjectId}</Text>
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}><Ionicons name="create-outline" size={20} color="#1E90FF" /></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item)} style={styles.iconBtn}><Ionicons name="trash-outline" size={20} color="#D11A2A" /></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No exams scheduled.</Text>) : null}
      />

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Exam' : 'New Exam'}</Text>
            <TextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input} />
            <TextInput value={date} onChangeText={setDate} placeholder="Date (YYYY-MM-DD)" style={styles.input} />
            <Text style={styles.label}>Class</Text>
            <View style={styles.chipsRow}>
              {classes.map(c => (
                <TouchableOpacity key={c.id} onPress={() => setClassId(c.id)} style={[styles.chip, classId === c.id && styles.chipActive]}>
                  <Text style={[styles.chipText, classId === c.id && styles.chipTextActive]}>{c.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.label}>Subject</Text>
            <View style={styles.chipsRow}>
              {subjects.map(s => (
                <TouchableOpacity key={s.id} onPress={() => setSubjectId(s.id)} style={[styles.chip, subjectId === s.id && styles.chipActive]}>
                  <Text style={[styles.chipText, subjectId === s.id && styles.chipTextActive]}>{s.name}</Text>
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
  );
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
