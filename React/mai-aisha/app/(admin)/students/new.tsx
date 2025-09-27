import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { listClasses } from '@/lib/classes';
import { createStudent } from '@/lib/students';
import type { SchoolClass } from '@/lib/types';

export default function AdminStudentNew() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [classId, setClassId] = useState<string | null>(null);
  const [admissionNo, setAdmissionNo] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [classes, setClasses] = useState<SchoolClass[]>([]);

  const load = useCallback(async () => {
    const cls = await listClasses();
    setClasses(cls);
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    try {
      setSaving(true);
      await createStudent({
        name: name.trim(),
        email: email.trim() || null,
        classes: classId || null,
        employeeId: admissionNo.trim() || null,
        parentName: parentName.trim() || null,
        parentEmail: parentEmail.trim() || null,
        parentContactNumber: parentPhone.trim() || null,
        role: 'student',
      });
      router.replace('/(admin)/students');
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Student</Text>
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

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Student'}</Text>
      </TouchableOpacity>
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
  saveBtn: { marginTop: 10, backgroundColor: '#1E90FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  saveBtnText: { color: '#fff', marginLeft: 8, fontWeight: '800' },
});
