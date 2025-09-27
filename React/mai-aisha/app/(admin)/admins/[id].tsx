import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { getUserById, updateUser, deleteUser } from '@/lib/users';
import type { UserProfile } from '@/lib/types';

export default function AdminEdit() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('Admin');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getUserById(id);
      if (!u) { Alert.alert('Not found', 'Admin does not exist'); router.back(); return; }
      setUser(u);
      setName(u.name || '');
      setEmail(u.email || '');
      setDepartment(u.department || '');
      setTitle(u.title || 'Admin');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const save = async () => {
    if (!user) return;
    if (!name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    try {
      setSaving(true);
      await updateUser(user.uid, {
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

  const confirmDelete = () => {
    if (!user) return;
    Alert.alert('Delete admin', `Delete ${user.name || user.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteUser(user.uid); router.replace('/(admin)/admins'); } }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color="#1E90FF" style={{ marginTop: 40 }} />

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit Admin</Text>
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
  btn: { marginTop: 10, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  saveBtn: { backgroundColor: '#1E90FF', marginRight: 8 },
  deleteBtn: { backgroundColor: '#ef4444', marginLeft: 8 },
  btnText: { color: '#fff', marginLeft: 8, fontWeight: '800' },
});
