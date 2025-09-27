import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers, updateUserProfile, deleteUserById } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import type { UserProfile } from '@/lib/types';

export default function ManageUserScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('admin');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'teacher' | 'headteacher'>('all');
  const [query, setQuery] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editRole, setEditRole] = useState<'teacher' | 'headteacher' | 'admin' | 'student' | ''>('');

  async function load() {
    setLoading(true);
    const res = await getAllUsers();
    setUsers(res);
    setLoading(false);
  }

  useEffect(() => { if (allowed) { load(); } }, [allowed]);

  const filtered = useMemo(() => {
    let data = users;
    if (filter !== 'all') data = data.filter(u => u.role === filter);
    if (query.trim()) {
      const q = query.toLowerCase();
      data = data.filter(u => (u.name || u.email || '').toLowerCase().includes(q));
    }
    return data;
  }, [users, filter, query]);

  const onEdit = (u: UserProfile) => {
    setSelectedUser(u);
    setEditName(u.name || '');
    setEditTitle(u.title || '');
    setEditRole((u.role as any) || '');
    setEditModalVisible(true);
  };

  const onSave = async () => {
    if (!selectedUser) return;
    try {
      await updateUserProfile(selectedUser.uid, {
        name: editName || null,
        title: editTitle || null,
        role: editRole || selectedUser.role,
      });
      setEditModalVisible(false);
      await load();
    } catch (e: any) {
      Alert.alert('Update failed', e.message || 'Please try again');
    }
  };

  const onDelete = (u: UserProfile) => {
    Alert.alert('Delete user', `Delete profile for ${u.name || u.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          try {
            await deleteUserById(u.uid);
            await load();
          } catch (e: any) {
            Alert.alert('Delete failed', e.message || 'Please try again');
          }
        }
      }
    ]);
  };

  return (
    !allowed || roleLoading ? null : (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>User Management</Text>
      <Text style={styles.subtitle}>Manage Teachers and Headteachers</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color="#888" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name or email"
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <View style={styles.filters}>
          {(['all', 'teacher', 'headteacher'] as const).map(key => (
            <Pressable key={key} onPress={() => setFilter(key)} style={[styles.filterChip, filter === key && styles.filterChipActive]}>
              <Text style={[styles.filterText, filter === key && styles.filterTextActive]}>
                {key}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.uid}
        refreshing={loading}
        onRefresh={load}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name || 'Unnamed'}</Text>
              <Text style={styles.email}>{item.email}</Text>
              <Text style={styles.meta}>Role: {item.role || '-' } {item.title ? ` • ${item.title}` : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => onEdit(item)} style={styles.iconBtn}>
              <Ionicons name="create-outline" size={20} color="#1E90FF" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onDelete(item)} style={styles.iconBtn}>
              <Ionicons name="trash-outline" size={20} color="#D11A2A" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyBox}>
            <Text>No users found.</Text>
            <Text style={styles.helper}>Note: Creating new login accounts requires a backend admin API. You can edit roles/titles here.</Text>
          </View>
        ) : null}
      />

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit User</Text>
            <TextInput value={editName} onChangeText={setEditName} placeholder="Full name" style={styles.input} />
            <TextInput value={editTitle} onChangeText={setEditTitle} placeholder="Title (e.g. Mr, Ms)" style={styles.input} />
            <View style={styles.roleRow}>
              {(['teacher', 'headteacher', 'admin'] as const).map(r => (
                <Pressable key={r} onPress={() => setEditRole(r)} style={[styles.roleChip, editRole === r && styles.roleChipActive]}>
                  <Text style={[styles.roleText, editRole === r && styles.roleTextActive]}>{r}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSave} style={[styles.btn, styles.btnPrimary]}>
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
  searchRow: { marginTop: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e9e9e9' },
  searchInput: { flex: 1, height: 40, marginLeft: 8 },
  filters: { flexDirection: 'row', marginTop: 8 },
  filterChip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 16, marginRight: 8 },
  filterChipActive: { borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  filterText: { color: '#444' },
  filterTextActive: { color: '#1E90FF', fontWeight: '600' },
  sep: { height: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16, fontWeight: '600', color: '#222' },
  email: { color: '#666' },
  meta: { marginTop: 2, color: '#555' },
  iconBtn: { padding: 8, marginLeft: 8 },
  emptyBox: { marginTop: 24, alignItems: 'center' },
  helper: { marginTop: 6, color: '#888', textAlign: 'center', fontSize: 12 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 8 },
  roleRow: { flexDirection: 'row', marginTop: 8 },
  roleChip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 16, marginRight: 8 },
  roleChipActive: { borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  roleText: { color: '#444' },
  roleTextActive: { color: '#1E90FF', fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  btn: { height: 42, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  btnGhostText: { color: '#333' },
  btnPrimary: { backgroundColor: '#1E90FF' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
