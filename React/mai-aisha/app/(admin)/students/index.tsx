import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { listStudents, deleteStudent, updateStudent, createStudent } from '@/lib/students-offline';
import { listClasses } from '@/lib/classes';
import type { UserProfile, SchoolClass } from '@/lib/types';

export default function AdminStudentsList() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<UserProfile | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formClassId, setFormClassId] = useState<string | null>(null);
  const [formGender, setFormGender] = useState<'male' | 'female' | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cls = await listClasses();
      // Sort classes alphabetically
      const sortedClasses = cls.sort((a, b) => a.name.localeCompare(b.name));
      setClasses(sortedClasses);
      const data = await listStudents(selectedClass || undefined);
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const confirmDelete = (s: UserProfile) => {
    Alert.alert('Delete student', `Delete ${s.name || 'this student'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { 
        try {
          await deleteStudent(s.uid); 
          await load(); 
        } catch (error: any) {
          Alert.alert('Delete failed', error.message || 'Please try again');
        }
      } }
    ]);
  };

  const openEditModal = async (student: UserProfile) => {
    setEditingStudent(student);
    setFormName(student.name || '');
    setFormClassId((student as any).classes || null);
    setFormGender(student.gender || null);
    setShowEditModal(true);
  };

  const openNewModal = () => {
    setFormName('');
    setFormClassId(null);
    setFormGender(null);
    setShowNewModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowNewModal(false);
    setEditingStudent(null);
    setFormName('');
    setFormClassId(null);
    setFormGender(null);
  };

  const saveStudent = async () => {
    if (!formName.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    
    try {
      setSaving(true);
      if (editingStudent) {
        // Update existing student
        await updateStudent(editingStudent.uid, {
          name: formName.trim(),
          classes: formClassId || null,
          gender: formGender,
        });
      } else {
        // Create new student
        await createStudent({
          name: formName.trim(),
          classes: formClassId || null,
          gender: formGender,
          role: 'student',
        });
      }
      closeModals();
      await load();
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const confirmDeleteFromModal = () => {
    if (!editingStudent) return;
    Alert.alert('Delete student', `Delete ${editingStudent.name || 'this student'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { 
        try {
          await deleteStudent(editingStudent.uid); 
          closeModals();
          await load(); 
        } catch (error: any) {
          Alert.alert('Delete failed', error.message || 'Please try again');
        }
      }}
    ]);
  };

  const renderEditModal = () => {
    if (!showEditModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
        <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', minHeight: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Student</Text>
              <TouchableOpacity onPress={closeModals} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                value={formName} 
                onChangeText={setFormName} 
                placeholder="Student name" 
                style={styles.input} 
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity 
                  style={[styles.genderBtn, formGender === 'male' && styles.genderBtnActive]} 
                  onPress={() => setFormGender('male')}
                >
                  <Text style={[styles.genderBtnText, formGender === 'male' && styles.genderBtnTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderBtn, formGender === 'female' && styles.genderBtnActive]} 
                  onPress={() => setFormGender('female')}
                >
                  <Text style={[styles.genderBtnText, formGender === 'female' && styles.genderBtnTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Class</Text>
              <View style={styles.modalClassChips}>
                {classes.map(c => (
                  <TouchableOpacity 
                    key={c.id} 
                    style={[styles.modalClassChip, formClassId === c.id && styles.modalClassChipActive]} 
                    onPress={() => setFormClassId(c.id)}
                  >
                    <Text style={[styles.modalClassChipText, formClassId === c.id && styles.modalClassChipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btn, styles.editSaveBtn]} onPress={saveStudent} disabled={saving}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={confirmDeleteFromModal}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={styles.btnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  };

  const renderNewModal = () => {
    if (!showNewModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
        <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', minHeight: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Student</Text>
              <TouchableOpacity onPress={closeModals} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput 
                value={formName} 
                onChangeText={setFormName} 
                placeholder="Student name" 
                style={styles.input} 
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.genderButtons}>
                <TouchableOpacity 
                  style={[styles.genderBtn, formGender === 'male' && styles.genderBtnActive]} 
                  onPress={() => setFormGender('male')}
                >
                  <Text style={[styles.genderBtnText, formGender === 'male' && styles.genderBtnTextActive]}>Male</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderBtn, formGender === 'female' && styles.genderBtnActive]} 
                  onPress={() => setFormGender('female')}
                >
                  <Text style={[styles.genderBtnText, formGender === 'female' && styles.genderBtnTextActive]}>Female</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.formRow}>
              <Text style={styles.label}>Class</Text>
              <View style={styles.modalClassChips}>
                {classes.map(c => (
                  <TouchableOpacity 
                    key={c.id} 
                    style={[styles.modalClassChip, formClassId === c.id && styles.modalClassChipActive]} 
                    onPress={() => setFormClassId(c.id)}
                  >
                    <Text style={[styles.modalClassChipText, formClassId === c.id && styles.modalClassChipTextActive]}>{c.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveStudent} disabled={saving}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Student'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const filtered = students.filter(s => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    const name = (s.name || '').toLowerCase();
    return name.includes(term);
  });

  // Group students by class
  const groupedStudents = filtered.reduce((acc, student) => {
    const classId = student.classes || 'unassigned';
    if (!acc[classId]) {
      acc[classId] = [];
    }
    acc[classId].push(student);
    return acc;
  }, {} as Record<string, UserProfile[]>);

  const groupedData = Object.entries(groupedStudents).map(([classId, students]) => {
    const className = classId === 'unassigned' ? 'Unassigned' : classes.find(c => c.id === classId)?.name || 'Unknown Class';
    return { classId, className, students };
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Students</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => openNewModal()}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TextInput
          placeholder="Search by name"
          style={styles.search}
          value={q}
          onChangeText={setQ}
        />
        <View style={styles.classFilter}>
          <TouchableOpacity onPress={() => setSelectedClass(null)} style={[styles.classChip, !selectedClass && styles.classChipActive]}>
            <Text style={[styles.classChipText, !selectedClass && styles.classChipTextActive]}>All</Text>
          </TouchableOpacity>
          {classes.map(c => (
            <TouchableOpacity key={c.id} onPress={() => setSelectedClass(c.id)} style={[styles.classChip, selectedClass === c.id && styles.classChipActive]}>
              <Text style={[styles.classChipText, selectedClass === c.id && styles.classChipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={groupedData}
          keyExtractor={(item) => item.classId}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item: classGroup }) => (
            <View style={styles.classCard}>
              <View style={styles.classHeader}>
                <Text style={styles.className}>{classGroup.className}</Text>
                <Text style={styles.classCount}>({classGroup.students.length} students)</Text>
              </View>
              {classGroup.students.map((student) => (
                <View key={student.uid} style={styles.studentRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{student.name || 'Unnamed'}</Text>
                    <Text style={styles.studentMeta}>
                      {student.gender ? `Gender: ${student.gender}` : 'No gender specified'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => openEditModal(student)} style={styles.rowBtn}>
                    <Ionicons name="create-outline" size={20} color="#1E90FF" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => confirmDelete(student)} style={styles.rowBtn}>
                    <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        />
      )}
      {renderEditModal()}
      {renderNewModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '700' },
  filters: { marginBottom: 12 },
  search: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  classFilter: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  classChip: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  classChipActive: { backgroundColor: '#1E90FF', borderColor: '#1E90FF' },
  classChipText: { color: '#334155', fontWeight: '600' },
  classChipTextActive: { color: '#fff' },
  classCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 16, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', overflow: 'hidden' },
  classHeader: { backgroundColor: '#f8fafc', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  className: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  classCount: { fontSize: 14, color: '#64748b', fontWeight: '600' },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#f1f5f9' },
  studentName: { fontSize: 16, fontWeight: '600', color: '#0f172a' },
  studentMeta: { color: '#64748b', marginTop: 2, fontSize: 14 },
  rowBtn: { padding: 8, marginLeft: 6 },
  
  // Modal styles
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  closeBtn: { padding: 4 },
  formRow: { marginBottom: 16 },
  label: { fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 16 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', fontSize: 16 },
  genderButtons: { flexDirection: 'row', gap: 12 },
  genderBtn: { flex: 1, borderWidth: 1.5, borderColor: '#cbd5e1', paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#f8fafc' },
  genderBtnActive: { backgroundColor: '#1E90FF', borderColor: '#1E90FF' },
  genderBtnText: { color: '#334155', fontWeight: '600', fontSize: 16 },
  genderBtnTextActive: { color: '#fff' },
  modalClassChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  modalClassChip: { borderWidth: 1.5, borderColor: '#cbd5e1', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 25, backgroundColor: '#f8fafc' },
  modalClassChipActive: { backgroundColor: '#1E90FF', borderColor: '#1E90FF' },
  modalClassChipText: { color: '#334155', fontWeight: '600', fontSize: 14 },
  modalClassChipTextActive: { color: '#fff' },
  saveBtn: { marginTop: 24, backgroundColor: '#1E90FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  saveBtnText: { color: '#fff', marginLeft: 8, fontWeight: '700', fontSize: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb' },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  editSaveBtn: { backgroundColor: '#1E90FF' },
  deleteBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', marginLeft: 8, fontWeight: '700', fontSize: 16 },
});
