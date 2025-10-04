import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { listUsersByRole, deleteUser, updateUser, createUserWithRole } from '@/lib/users';
import type { UserProfile } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

export default function AdminTeachersList() {
  const { colors } = useTheme();
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  
  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDepartment, setFormDepartment] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsersByRole('teacher');
      setTeachers(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const confirmDelete = (t: UserProfile) => {
    Alert.alert('Delete teacher', `Delete ${t.name || t.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteUser(t.uid); await load(); } }
    ]);
  };

  const openEditModal = async (user: UserProfile) => {
    setEditingUser(user);
    setFormName(user.name || '');
    setFormEmail(user.email || '');
    setFormDepartment(user.department || '');
    setFormTitle(user.title || '');
    setShowEditModal(true);
  };

  const openNewModal = () => {
    setFormName('');
    setFormEmail('');
    setFormDepartment('');
    setFormTitle('');
    setShowNewModal(true);
  };

  const closeModals = () => {
    setShowEditModal(false);
    setShowNewModal(false);
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormDepartment('');
    setFormTitle('');
  };

  const saveUser = async () => {
    if (!formName.trim()) {
      Alert.alert('Validation', 'Name is required');
      return;
    }
    
    try {
      setSaving(true);
      if (editingUser) {
        // Update existing teacher
        await updateUser(editingUser.uid, {
          name: formName.trim(),
          email: formEmail.trim() || null,
          department: formDepartment.trim() || null,
          title: formTitle.trim() || null,
        });
      } else {
        // Create new teacher
        await createUserWithRole('teacher', {
          name: formName.trim(),
          email: formEmail.trim() || null,
          department: formDepartment.trim() || null,
          title: formTitle.trim() || null,
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
    if (!editingUser) return;
    Alert.alert('Delete teacher', `Delete ${editingUser.name || editingUser.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { 
        await deleteUser(editingUser.uid); 
        closeModals();
        await load(); 
      }}
    ]);
  };

  const renderEditModal = () => {
    if (!showEditModal) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <StatusBar barStyle="light-content" backgroundColor="rgba(0,0,0,0.8)" />
        <ScrollView contentContainerStyle={{ justifyContent: 'center', alignItems: 'center', minHeight: '100%' }} showsVerticalScrollIndicator={false}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Teacher</Text>
              <TouchableOpacity onPress={closeModals} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formRow}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput 
                value={formName} 
                onChangeText={setFormName} 
                placeholder="Teacher name" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} 
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput 
                value={formEmail} 
                onChangeText={setFormEmail} 
                placeholder="email@example.com" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={[styles.label, { color: colors.text }]}>Department</Text>
              <TextInput 
                value={formDepartment} 
                onChangeText={setFormDepartment} 
                placeholder="e.g. Mathematics" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} 
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={[styles.label, { color: colors.text }]}>Title</Text>
              <TextInput 
                value={formTitle} 
                onChangeText={setFormTitle} 
                placeholder="e.g. Senior Teacher" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} 
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryBlue }]} onPress={saveUser} disabled={saving}>
                <Ionicons name="save-outline" size={20} color="#fff" />
                <Text style={[styles.btnText, { color: '#fff' }]}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.btn, { backgroundColor: colors.danger }]} onPress={confirmDeleteFromModal}>
                <Ionicons name="trash-outline" size={20} color="#fff" />
                <Text style={[styles.btnText, { color: '#fff' }]}>Delete</Text>
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
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Teacher</Text>
              <TouchableOpacity onPress={closeModals} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.icon} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.formRow}>
              <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
              <TextInput 
                value={formName} 
                onChangeText={setFormName} 
                placeholder="Teacher name" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} 
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={[styles.label, { color: colors.text }]}>Email</Text>
              <TextInput 
                value={formEmail} 
                onChangeText={setFormEmail} 
                placeholder="email@example.com" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]}
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={[styles.label, { color: colors.text }]}>Department</Text>
              <TextInput 
                value={formDepartment} 
                onChangeText={setFormDepartment} 
                placeholder="e.g. Mathematics" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} 
              />
            </View>
            
            <View style={styles.formRow}>
              <Text style={[styles.label, { color: colors.text }]}>Title</Text>
              <TextInput 
                value={formTitle} 
                onChangeText={setFormTitle} 
                placeholder="e.g. Senior Teacher" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} 
              />
            </View>

            <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.primaryBlue }]} onPress={saveUser} disabled={saving}>
              <Ionicons name="save-outline" size={20} color="#fff" />
              <Text style={styles.saveBtnText}>{saving ? 'Saving...' : 'Save Teacher'}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  };

  const filtered = teachers.filter(u => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term) || (u.employeeId || '').toLowerCase().includes(term);
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.topBar, { backgroundColor: colors.cardBackground }]}> 
        <Text style={[styles.title, { color: colors.text }]}>Teachers</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primaryBlue }]} onPress={() => openNewModal()}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <TextInput 
        placeholder="Search name, email, ID" 
        placeholderTextColor={colors.text + '70'}
        style={[styles.search, { backgroundColor: colors.cardBackground, borderColor: colors.border, color: colors.text }]} 
        value={q} 
        onChangeText={setQ} 
      />

      {loading ? (
        <ActivityIndicator size="large" color={colors.primaryBlue} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}> 
              <View style={{ flex: 1 }}>
                <Text style={[styles.name, { color: colors.text }]}>{item.name || 'Unnamed'}</Text>
                <Text style={[styles.meta, { color: colors.text }]}>{item.email || 'No email'} · {(item.department || 'No dept')}</Text>
              </View>
              <TouchableOpacity onPress={() => openEditModal(item)} style={styles.rowBtn}>
                <Ionicons name="create-outline" size={22} color={colors.primaryBlue} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.rowBtn}>
                <Ionicons name="trash-outline" size={22} color={colors.danger} />
              </TouchableOpacity>
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
  container: { flex: 1, padding: 20 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '700' },
  search: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  rowBtn: { padding: 8, marginLeft: 6 },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 2 },
  
  // Modal styles
  modalOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', padding: 20, zIndex: 1000 },
  modalCard: { backgroundColor: '#fff', borderRadius: 16, padding: 24, width: '100%', maxWidth: 500, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e5e7eb' },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#0f172a' },
  closeBtn: { padding: 4 },
  formRow: { marginBottom: 16 },
  label: { fontWeight: '700', color: '#334155', marginBottom: 8, fontSize: 16 },
  input: { backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', fontSize: 16 },
  saveBtn: { marginTop: 24, backgroundColor: '#1E90FF', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  saveBtnText: { color: '#fff', marginLeft: 8, fontWeight: '700', fontSize: 16 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24, paddingTop: 20, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#e5e7eb' },
  btn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  editSaveBtn: { backgroundColor: '#1E90FF' },
  deleteBtn: { backgroundColor: '#ef4444' },
  btnText: { color: '#fff', marginLeft: 8, fontWeight: '700', fontSize: 16 },
});
