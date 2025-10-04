import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput, SafeAreaView, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllUsers } from '@/lib/auth';
import { UserProfile } from '@/lib/types';
import { useTheme } from '@/contexts/ThemeContext';

export default function ManageUserScreen() {
  const { colors } = useTheme();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'teachers' | 'admin'>('all');
  const [query, setQuery] = useState('');

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [editName, setEditName] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editRole, setEditRole] = useState<'teacher' | 'headteacher' | 'admin' | ''>('');

  const load = useCallback(async (): Promise<void> => {
    setLoading(true);
    const res = await getAllUsers();
    // Filter out students - they are managed separately in the students collection
    const staffUsers = res.filter(user => user.role !== 'student');
    setUsers(staffUsers);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let data = users;
    
    // Apply role filter
    if (filter === 'teachers') {
      // Group teachers and headteachers together as "teaching staff"
      data = data.filter(u => u.role === 'teacher' || u.role === 'headteacher');
    } else if (filter === 'admin') {
      data = data.filter(u => u.role === 'admin');
    }
    // 'all' shows all staff (admin, teacher, headteacher) but no students
    
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
      // TODO: Implement updateUserProfile function in auth library
      // await updateUserProfile(selectedUser.uid, {
      //   name: editName || null,
      //   title: editTitle || null,
      //   role: editRole || selectedUser.role,
      // });
      Alert.alert('Info', 'User update functionality will be implemented soon.');
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
            // TODO: Implement deleteUser function in auth library
            // await deleteUser(u.uid);
            Alert.alert('Info', 'User delete functionality will be implemented soon.');
            // await load();
          } catch (e: any) {
            Alert.alert('Delete failed', e.message || 'Please try again');
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Staff Management</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Manage Administrative and Teaching Staff</Text>

      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20' }]}>
          <Ionicons name="search" size={20} color={colors.text + '60'} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search by name or email"
            placeholderTextColor={colors.text + '50'}
            value={query}
            onChangeText={setQuery}
          />
        </View>
        <View style={styles.filters}>
          {([
            { key: 'all', label: 'All Staff' },
            { key: 'teachers', label: 'Teachers' },
            { key: 'admin', label: 'Administrators' }
          ] as const).map(({ key, label }) => (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[
                styles.filterChip,
                { backgroundColor: colors.cardBackground, borderColor: colors.text + '20' },
                filter === key && { borderColor: colors.primaryBlue, backgroundColor: colors.primaryBlue + '15', shadowColor: colors.primaryBlue, shadowOpacity: 0.2 },
              ]}
            >
              <Text style={[styles.filterText, { color: colors.text }, filter === key && { color: colors.primaryBlue, fontWeight: '700' }]}>
                {label}
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
          <View style={[styles.row, { backgroundColor: colors.cardBackground, borderColor: colors.text + '10' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.name, { color: colors.text }]}>{item.name || 'Unnamed'}</Text>
              <Text style={[styles.email, { color: colors.text }]}>{item.email}</Text>
              <Text style={[styles.meta, { color: colors.text }]}>Role: {item.role || '-' } {item.title ? ` • ${item.title}` : ''}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity onPress={() => onEdit(item)} style={[styles.iconBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="create-outline" size={20} color={colors.primaryBlue} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onDelete(item)} style={[styles.iconBtn, { backgroundColor: colors.background }]}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyBox}>
            <Ionicons name="people-outline" size={64} color={colors.text + '30'} style={{ marginBottom: 16 }} />
            <Text style={[{ fontSize: 18, fontWeight: '600' }, { color: colors.text }]}>No staff members found</Text>
          </View>
        ) : null}
      />

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit User</Text>
            <TextInput value={editName} onChangeText={setEditName} placeholder="Full name" placeholderTextColor={colors.text + '50'} style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]} />
            <TextInput value={editTitle} onChangeText={setEditTitle} placeholder="Title (e.g. Mr, Ms)" placeholderTextColor={colors.text + '50'} style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '20' }]} />
            <View style={styles.roleRow}>
              {(['teacher', 'headteacher', 'admin'] as const).map(r => (
                <Pressable
                  key={r}
                  onPress={() => setEditRole(r)}
                  style={[
                    styles.roleChip,
                    { backgroundColor: colors.background, borderColor: colors.text + '20' },
                    editRole === r && { borderColor: colors.primaryBlue, backgroundColor: colors.primaryBlue + '15' },
                  ]}
                >
                  <Text style={[styles.roleText, { color: colors.text }, editRole === r && { color: colors.primaryBlue, fontWeight: '700' }]}>{r}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.btn, styles.btnGhost, { backgroundColor: colors.background, borderColor: colors.text + '20' }]}>
                <Text style={[styles.btnGhostText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onSave} style={[styles.btn, { backgroundColor: colors.primaryBlue }]}>
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 24,
  },
  searchRow: {
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    height: 48,
    marginLeft: 12,
    fontSize: 16,
  },
  filters: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterChipActive: {
    borderColor: '#1E90FF',
    backgroundColor: '#1E90FF15',
    shadowColor: '#1E90FF',
    shadowOpacity: 0.2,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#1E90FF',
    fontWeight: '700',
  },
  sep: {
    height: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  email: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    opacity: 0.6,
    fontWeight: '500',
  },
  iconBtn: {
    padding: 12,
    marginLeft: 8,
    borderRadius: 10,
    backgroundColor: '#f8f9fa',
  },
  emptyBox: {
    marginTop: 60,
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  helper: {
    marginTop: 12,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.6,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginTop: 12,
    fontSize: 16,
  },
  roleRow: {
    flexDirection: 'row',
    marginTop: 16,
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 20,
    flex: 1,
    alignItems: 'center',
  },
  roleChipActive: {
    borderColor: '#1E90FF',
    backgroundColor: '#1E90FF15',
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  roleTextActive: {
    color: '#1E90FF',
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  btn: {
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnGhost: {
    borderWidth: 1,
  },
  btnGhostText: {
    fontSize: 16,
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#1E90FF',
  },
  btnPrimaryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
