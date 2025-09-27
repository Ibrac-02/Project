import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { listUsersByRole, deleteUser } from '@/lib/users';
import type { UserProfile } from '@/lib/types';

export default function AdminHeadteachersList() {
  const [items, setItems] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUsersByRole('headteacher');
      setItems(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const confirmDelete = (u: UserProfile) => {
    Alert.alert('Delete headteacher', `Delete ${u.name || u.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteUser(u.uid); await load(); } }
    ]);
  };

  const filtered = items.filter(u => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    return (u.name || '').toLowerCase().includes(term) || (u.email || '').toLowerCase().includes(term) || (u.employeeId || '').toLowerCase().includes(term);
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Headteachers</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push({ pathname: '/(admin)/headteachers/new' as any })}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <TextInput placeholder="Search name, email, ID" style={styles.search} value={q} onChangeText={setQ} />

      {loading ? (
        <ActivityIndicator size="large" color="#1E90FF" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.name || 'Unnamed'}</Text>
                <Text style={styles.meta}>{item.email || 'No email'} · {(item.department || 'No dept')}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push({ pathname: '/(admin)/headteachers/[id]', params: { id: item.uid } as any } as any)} style={styles.rowBtn}>
                <Ionicons name="create-outline" size={22} color="#1E90FF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => confirmDelete(item)} style={styles.rowBtn}>
                <Ionicons name="trash-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc', padding: 16 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '700', color: '#0f172a' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '700' },
  search: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  rowBtn: { padding: 8, marginLeft: 6 },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 2 },
});
