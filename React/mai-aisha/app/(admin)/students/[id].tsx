import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, router } from 'expo-router';
import { listClasses } from '@/lib/classes';
import { getStudentById, updateStudent, deleteStudent } from '@/lib/students-offline';
import type { SchoolClass, UserProfile } from '@/lib/types';

export default function AdminStudentEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<UserProfile | null>(null);

  const [name, setName] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cls = await listClasses();
      // Sort classes alphabetically by name
      const sortedClasses = cls.sort((a, b) => a.name.localeCompare(b.name));
      setClasses(sortedClasses);
      const s = await getStudentById(id);
      if (!s) {
        Alert.alert('Not found', 'Student does not exist');
        router.back();
        return;
      }
      setStudent(s);
      setName(s.name || '');
      setClassId((s as any).classes || null);
      setGender(s.gender || null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!student) return;
    if (!name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    try {
      setSaving(true);
      await updateStudent(student.uid, {
        name: name.trim(),
        classes: classId || null,
        gender: gender,
      });
      router.replace('/(admin)/students');
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!student) return;
    Alert.alert('Delete student', `Delete ${student.name || 'this student'}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteStudent(student.uid); router.replace('/(admin)/students'); } }
    ]);
  };

  if (loading) return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      <View style={styles.modalOverlay}>
        <ActivityIndicator size="large" color="#1E90FF" />
      </View>
    </View>
  )

  return (
    <View style={styles.fullScreen}>
      <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
      <View style={styles.modalOverlay}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>Edit Student</Text>
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#64748b" />
            </TouchableOpacity>
          </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Student name" style={styles.input} />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Gender</Text>
        <View style={styles.genderButtons}>
          <TouchableOpacity style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]} onPress={() => setGender('male')}>
            <Text style={[styles.genderBtnText, gender === 'male' && styles.genderBtnTextActive]}>Male</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]} onPress={() => setGender('female')}>
            <Text style={[styles.genderBtnText, gender === 'female' && styles.genderBtnTextActive]}>Female</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Class</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={classId}
            onValueChange={(itemValue) => setClassId(itemValue)}
            style={styles.picker}
            itemStyle={styles.pickerItem}
          >
            <Picker.Item label="Select a class..." value={null} />
            {classes.map(c => (
              <Picker.Item key={c.id} label={c.name} value={c.id} />
            ))}
          </Picker>
        </View>
      </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={save} disabled={saving}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={confirmDelete}>
              <Ionicons name="trash-outline" size={20} color="#fff" />
              <Text style={styles.btnText}>Delete</Text>
            </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fullScreen: { flex: 1, position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  scrollContent: { width: '100%', maxWidth: 500, justifyContent: 'center', minHeight: '100%' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)', elevation: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  closeBtn: { padding: 4 },
  formRow: { marginBottom: 16 },
  label: { fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 16 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', fontSize: 16 },
  pickerContainer: { backgroundColor: '#f8fafc', borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', overflow: 'hidden' },
  picker: { height: 50, width: '100%' },
  pickerItem: { fontSize: 16, color: '#334155' },
  genderButtons: { flexDirection: 'row', gap: 12 },
  genderBtn: { flex: 1, borderWidth: 1.5, borderColor: '#cbd5e1', paddingVertical: 16, borderRadius: 12, alignItems: 'center', backgroundColor: '#f8fafc' },
  genderBtnActive: { backgroundColor: '#1E90FF', borderColor: '#1E90FF' },
  genderBtnText: { color: '#334155', fontWeight: '600', fontSize: 16 },
  genderBtnTextActive: { color: '#fff' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb' },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  saveBtn: { backgroundColor: '#1E90FF' },
  deleteBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', marginLeft: 8, fontWeight: '700', fontSize: 16 },
});
