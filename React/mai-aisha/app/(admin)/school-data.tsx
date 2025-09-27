import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listClasses, createClass, updateClass, deleteClass } from '@/lib/classes';
import { listSubjects, createSubject, updateSubject, deleteSubject } from '@/lib/subjects';
import { getAllUsers } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import type { SchoolClass, Subject, UserProfile } from '@/lib/types';

export default function SchoolDataScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('admin');
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Class modal state
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [className, setClassName] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [classTeacherId, setClassTeacherId] = useState<string | undefined>(undefined);

  // Subject modal state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [subjectTeachersAssigned, setSubjectTeachersAssigned] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    const [cls, subs, users] = await Promise.all([
      listClasses(),
      listSubjects(),
      getAllUsers(),
    ]);
    setClasses(cls);
    setSubjects(subs);
    setTeachers(users.filter(u => u.role === 'teacher'));
    setLoading(false);
  }

  useEffect(() => { if (allowed) { load(); } }, [allowed]);

  // Create/Edit Class
  const openNewClass = () => {
    setEditingClass(null);
    setClassName('');
    setClassDesc('');
    setClassTeacherId(undefined);
    setClassModalOpen(true);
  };
  const openEditClass = (c: SchoolClass) => {
    setEditingClass(c);
    setClassName(c.name);
    setClassDesc(c.description || '');
    setClassTeacherId(c.teacherId);
    setClassModalOpen(true);
  };
  const saveClass = async () => {
    try {
      const name = className.trim();
      if (!name) { Alert.alert('Validation', 'Class name is required'); return; }
      const desc = classDesc.trim();
      const payload: Partial<SchoolClass> & { name: string } = { name };
      if (desc) payload.description = desc;
      if (classTeacherId) payload.teacherId = classTeacherId;
      if (editingClass) {
        await updateClass(editingClass.id, payload as Omit<SchoolClass, 'id'>);
      } else {
        await createClass(payload as Omit<SchoolClass, 'id'>);
      }
      setClassModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    }
  };
  const removeClass = (c: SchoolClass) => {
    Alert.alert('Delete class', `Delete ${c.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteClass(c.id); await load(); } }
    ]);
  };

  // Create/Edit Subject
  const openNewSubject = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectDesc('');
    setSubjectTeachersAssigned([]);
    setSubjectModalOpen(true);
  };
  const openEditSubject = (s: Subject) => {
    setEditingSubject(s);
    setSubjectName(s.name);
    setSubjectDesc(s.description || '');
    setSubjectTeachersAssigned(s.teachersAssigned || []);
    setSubjectModalOpen(true);
  };
  const saveSubject = async () => {
    try {
      const name = subjectName.trim();
      if (!name) { Alert.alert('Validation', 'Subject name is required'); return; }
      const desc = subjectDesc.trim();
      const payload: Partial<Subject> & { name: string } = { name };
      if (desc) payload.description = desc;
      // Use null only when explicitly desired; omit field if empty
      if (subjectTeachersAssigned.length) payload.teachersAssigned = subjectTeachersAssigned;
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload as Omit<Subject, 'id'>);
      } else {
        await createSubject(payload as Omit<Subject, 'id'>);
      }
      setSubjectModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    }
  };
  const removeSubject = (s: Subject) => {
    Alert.alert('Delete subject', `Delete ${s.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSubject(s.id); await load(); } }
    ]);
  };

  // Assignment helpers
  const toggleTeacherAssigned = (teacherId: string) => {
    setSubjectTeachersAssigned(prev => prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]);
  };

  return (
    !allowed || roleLoading ? null : (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.title}>School Data</Text>
        <Text style={styles.subtitle}>Manage Classes and Subjects</Text>

        {/* Classes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Classes</Text>
            <TouchableOpacity onPress={openNewClass} style={styles.addBtn}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>New Class</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={classes}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {!!item.description && <Text style={styles.cardMeta}>{item.description}</Text>}
                  {!!item.teacherId && <Text style={styles.cardMeta}>Teacher: {teachers.find(t => t.uid === item.teacherId)?.name || item.teacherId}</Text>}
                </View>
                <TouchableOpacity onPress={() => openEditClass(item)} style={styles.iconBtn}>
                  <Ionicons name="create-outline" size={20} color="#1E90FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeClass(item)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={20} color="#D11A2A" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No classes yet.</Text>) : null}
          />
        </View>

        {/* Subjects Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Subjects</Text>
            <TouchableOpacity onPress={openNewSubject} style={styles.addBtn}>
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.addBtnText}>New Subject</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={subjects}
            keyExtractor={(i) => i.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {!!item.description && <Text style={styles.cardMeta}>{item.description}</Text>}
                  {!!item.teachersAssigned?.length && <Text style={styles.cardMeta}>Teachers: {item.teachersAssigned.map(id => teachers.find(t => t.uid === id)?.name || id).join(', ')}</Text>}
                </View>
                <TouchableOpacity onPress={() => openEditSubject(item)} style={styles.iconBtn}>
                  <Ionicons name="create-outline" size={20} color="#1E90FF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => removeSubject(item)} style={styles.iconBtn}>
                  <Ionicons name="trash-outline" size={20} color="#D11A2A" />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No subjects yet.</Text>) : null}
          />
        </View>
      </ScrollView>

      {/* Class Modal */}
      <Modal visible={classModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingClass ? 'Edit Class' : 'New Class'}</Text>
            <TextInput value={className} onChangeText={setClassName} placeholder="Class name" style={styles.input} />
            <TextInput value={classDesc} onChangeText={setClassDesc} placeholder="Description (optional)" style={styles.input} />
            <Text style={styles.label}>Assign Teacher</Text>
            <View style={styles.chipsRow}>
              {teachers.map(t => (
                <Pressable key={t.uid} onPress={() => setClassTeacherId(classTeacherId === t.uid ? undefined : t.uid)} style={[styles.chip, classTeacherId === t.uid && styles.chipActive]}>
                  <Text style={[styles.chipText, classTeacherId === t.uid && styles.chipTextActive]}>{t.name || t.email}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setClassModalOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveClass} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subject Modal */}
      <Modal visible={subjectModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingSubject ? 'Edit Subject' : 'New Subject'}</Text>
            <TextInput value={subjectName} onChangeText={setSubjectName} placeholder="Subject name" style={styles.input} />
            <TextInput value={subjectDesc} onChangeText={setSubjectDesc} placeholder="Description (optional)" style={styles.input} />
            <Text style={styles.label}>Assign Teachers</Text>
            <View style={styles.chipsRow}>
              {teachers.map(t => {
                const active = subjectTeachersAssigned.includes(t.uid);
                return (
                  <Pressable key={t.uid} onPress={() => toggleTeacherAssigned(t.uid)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.name || t.email}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setSubjectModalOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveSubject} style={[styles.btn, styles.btnPrimary]}>
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
  container: { flex: 1, backgroundColor: '#f0f2f5', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  section: { marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', paddingHorizontal: 12, height: 36, borderRadius: 8 },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: '#222' },
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
