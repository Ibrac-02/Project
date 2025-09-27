import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithRole } from '@/lib/users';

export default function AdminNew() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('Admin');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    try {
      setSaving(true);
      await createUserWithRole('admin', {
        name: name.trim(),
        email: email.trim() || null,
        department: department.trim() || null,
        title: title.trim() || null,
      });
      router.replace('/(admin)/admins');
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>New Admin</Text>
      <View style={styles.formRow}>
        <Text style={styles.label}>Full Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="email@example.com" style={styles.input} keyboardType="email-address" />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Department</Text>
        <TextInput value={department} onChangeText={setDepartment} placeholder="e.g. Administration" style={styles.input} />
      </View>
      <View style={styles.formRow}>
        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Admin" style={styles.input} />
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={save} disabled={saving}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Admin'}</Text>
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
  saveBtn: { marginTop: 10, backgroundColor: '#1E90FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  saveBtnText: { color: '#fff', marginLeft: 8, fontWeight: '800' },
});
