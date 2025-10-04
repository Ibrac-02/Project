import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { createUserWithRole } from '@/lib/users';
import { useTheme } from '@/contexts/ThemeContext';

export default function NewHeadteacherScreen() {
  const { colors } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [title, setTitle] = useState('Headteacher');
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!name.trim()) { Alert.alert('Validation', 'Name is required'); return; }
    try {
      setSaving(true);
      await createUserWithRole('headteacher', {
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

  return (
    <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>New Headteacher</Text>
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

      <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primaryBlue }]} onPress={save} disabled={saving}>
        <Ionicons name="save-outline" size={20} color="#fff" />
        <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Headteacher'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  formRow: { marginBottom: 12 },
  label: { fontWeight: '700', marginBottom: 6 },
  input: { borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, marginBottom: 8 },
  saveBtn: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  saveBtnText: { color: '#fff', marginLeft: 8, fontWeight: '800' },
});
