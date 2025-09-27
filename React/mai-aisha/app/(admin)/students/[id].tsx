import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { listClasses } from '@/lib/classes';
import { getStudentById, updateStudent, deleteStudent } from '@/lib/students';
import type { SchoolClass, UserProfile } from '@/lib/types';

export default function AdminStudentEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [student, setStudent] = useState<UserProfile | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [admissionNo, setAdmissionNo] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cls = await listClasses();
      setClasses(cls);
      const s = await getStudentById(id);
      if (!s) {
        Alert.alert('Not found', 'Student does not exist');
        router.back();
        return;
      }
      setStudent(s);
      setName(s.name || '');
      setEmail(s.email || '');
      setClassId((s as any).classes || null);
      setAdmissionNo(s.employeeId || '');
      setParentName(s.parentName || '');
      setParentEmail(s.parentEmail || '');
      setParentPhone(s.parentContactNumber || '');
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
        email: email.trim() || null,
        classes: classId || null,
        employeeId: admissionNo.trim() || null,
        parentName: parentName.trim() || null,
        parentEmail: parentEmail.trim() || null,
        parentContactNumber: parentPhone.trim() || null,
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
    Alert.alert('Delete student', `Delete ${student.name || student.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteStudent(student.uid); router.replace('/(admin)/students'); } }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#1E90FF" style={{ marginTop: 40 }} />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Student</Text>
      <View style={styles.formRow}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Student name" style={styles.input} />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="email@example.com" style={styles.input} keyboardType="email-address" />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Admission No</Text>
        <TextInput value={admissionNo} onChangeText={setAdmissionNo} placeholder="e.g. A-2025-001" style={styles.input} />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Class</Text>
        <View style={styles.classChips}>
          {classes.map(c => (
            <TouchableOpacity key={c.id} style={[styles.classChip, classId === c.id && styles.classChipActive]} onPress={() => setClassId(c.id)}>
              <Text style={[styles.classChipText, classId === c.id && styles.classChipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Parent/Guardian</Text>
        <TextInput value={parentName} onChangeText={setParentName} placeholder="Parent name" style={styles.input} />
        <TextInput value={parentEmail} onChangeText={setParentEmail} placeholder="Parent email" style={styles.input} keyboardType="email-address" />
        <TextInput value={parentPhone} onChangeText={setParentPhone} placeholder="Parent phone" style={styles.input} keyboardType="phone-pad" />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={[styles.btn, styles.saveBtn]} onPress={save} disabled={saving}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: '#f8fafc' },
  title: { fontSize: 20, fontWeight: '800', color: '#0f172a', marginBottom: 12 },
  formRow: { marginBottom: 12 },
  label: { fontWeight: '700', color: '#334155', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', marginBottom: 8 },
  classChips: { flexDirection: 'row', flexWrap: 'wrap' },
  classChip: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  classChipActive: { backgroundColor: '#1E90FF', borderColor: '#1E90FF' },
  classChipText: { color: '#334155', fontWeight: '600' },
  classChipTextActive: { color: '#fff' },
  btn: { marginTop: 10, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  saveBtn: { backgroundColor: '#1E90FF', marginRight: 8 },
  deleteBtn: { backgroundColor: '#ef4444', marginLeft: 8 },
  btnText: { color: '#fff', marginLeft: 8, fontWeight: '800' },
});
