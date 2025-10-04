import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { getUserById, updateUser, deleteUser } from '@/lib/users';
import type { UserProfile } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

export default function HeadteacherDetailScreen() {
  const { colors } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('Headteacher');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const u = await getUserById(id);
      if (!u) { Alert.alert('Not found', 'Headteacher does not exist'); router.back(); return; }
      setUser(u);
      setName(u.name || '');
      setEmail(u.email || '');
      setDepartment(u.department || '');
      setTitle(u.title || 'Headteacher');
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
      router.replace('/(admin)/headteachers');
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!user) return;
    Alert.alert('Delete headteacher', `Delete ${user.name || user.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteUser(user.uid); router.replace('/(admin)/headteachers'); } }
    ]);
  };

  if (loading) return <ActivityIndicator size="large" color={colors.primaryBlue} style={{ marginTop: 40 }} />

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Edit Headteacher</Text>
      <View style={styles.formRow}>
        <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Full name" placeholderTextColor={colors.text + '70'} style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} />
      </View>
      <View style={styles.formRow}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput value={email} onChangeText={setEmail} placeholder="email@example.com" placeholderTextColor={colors.text + '70'} style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} keyboardType="email-address" />
      </View>
      <View style={styles.formRow}>
        <Text style={[styles.label, { color: colors.text }]}>Department</Text>
        <TextInput value={department} onChangeText={setDepartment} placeholder="e.g. Academics" placeholderTextColor={colors.text + '70'} style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} />
      </View>
      <View style={styles.formRow}>
        <Text style={[styles.label, { color: colors.text }]}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder="Headteacher" placeholderTextColor={colors.text + '70'} style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryBlue, marginRight: 8 }]} onPress={save} disabled={saving}>
          <Ionicons name="save-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>{saving ? 'Saving...' : 'Save'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.btn, { backgroundColor: colors.danger, marginLeft: 8 }]} onPress={confirmDelete}>
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={styles.btnText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  formRow: { marginBottom: 12 },
  label: { fontWeight: '700', marginBottom: 6 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  btn: { marginTop: 10, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  btnText: { color: '#fff', marginLeft: 8, fontWeight: '800' },
});
