import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { createLessonPlan, deleteLessonPlan, listLessonPlansForTeacher, updateLessonPlan, type LessonPlanRecord } from '@/lib/lessonPlans';
import { listClasses } from '@/lib/classes';
import { useRequireRole } from '@/lib/access';
import { listSubjects } from '@/lib/subjects';
import { useTheme } from '@/contexts/ThemeContext';

export default function TeacherLessonPlanScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('teacher');
  const { user } = useAuth();
  const { colors } = useTheme();
  const teacherId = user?.uid || '';

  const [items, setItems] = useState<LessonPlanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<LessonPlanRecord | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [classId, setClassId] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    const [plans, cls, subs] = await Promise.all([
      listLessonPlansForTeacher(teacherId),
      listClasses(),
      listSubjects(),
    ]);
    setItems(plans);
    setClasses(cls.map(c => ({ id: c.id, name: c.name })));
    setSubjects(subs.map(s => ({ id: s.id, name: s.name })));
    setLoading(false);
  }, [teacherId]);

  useEffect(() => { if (allowed) { load(); } }, [allowed, load]);

  const openNew = () => {
    setEditing(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]); // Set current date
    setClassId('');
    setSubjectId('');
    setNotes('');
    setModalOpen(true);
  };

  const openEdit = (rec: LessonPlanRecord) => {
    setEditing(rec);
    setTitle(rec.title);
    setDate(rec.date);
    setClassId(rec.classId);
    setSubjectId(rec.subjectId);
    setNotes(rec.notes || '');
    setModalOpen(true);
  };

  const save = async () => {
    if (!teacherId) { Alert.alert('Not allowed'); return; }
    if (!title.trim() || !date.trim() || !classId || !subjectId) { Alert.alert('Validation', 'Title, date, class and subject are required.'); return; }
    const payload = {
      title: title.trim(),
      subjectId,
      classId,
      teacherId,
      date: date.trim(),
      status: 'pending' as const,
      notes: notes.trim() || '',
    } as Omit<LessonPlanRecord, 'id'>;
    try {
      if (editing) await updateLessonPlan(editing.id, payload);
      else await createLessonPlan(payload);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not save lesson plan');
    }
  };

  const remove = (rec: LessonPlanRecord) => {
    Alert.alert('Delete plan', `Delete lesson plan '${rec.title}'?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteLessonPlan(rec.id); await load(); } }
    ]);
  };

  const className = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
  const subjectName = useMemo(() => new Map(subjects.map(s => [s.id, s.name])), [subjects]);

  return (
    !allowed || roleLoading ? null : (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Lesson Plans</Text>
      <Text style={styles.subtitle}>Upload lesson plans for approval</Text>

      <TouchableOpacity onPress={openNew} style={styles.addBtn}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>New Plan</Text>
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
              <Text style={styles.cardMeta}>Subject: {subjectName.get(item.subjectId) || item.subjectId} • Class: {className.get(item.classId) || item.classId}</Text>
              <Text style={styles.cardMeta}>Date: {item.date} • Status: {item.status}</Text>
              {!!item.notes && <Text style={styles.cardMeta}>Notes: {item.notes}</Text>}
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}><Ionicons name="create-outline" size={20} color="#1E90FF" /></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item)} style={styles.iconBtn}><Ionicons name="trash-outline" size={20} color="#D11A2A" /></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No lesson plans yet.</Text>) : null}
      />

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editing ? 'Edit Lesson Plan' : 'New Lesson Plan'}</Text>
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
            <TextInput value={notes} onChangeText={setNotes} placeholder="Notes (optional)" style={styles.input} />
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
