import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { listStudents, deleteStudent } from '@/lib/students';
import { listClasses } from '@/lib/classes';
import type { UserProfile, SchoolClass } from '@/lib/types';

export default function AdminStudentsList() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cls = await listClasses();
      setClasses(cls);
      const data = await listStudents(selectedClass || undefined);
      setStudents(data);
    } finally {
      setLoading(false);
    }
  }, [selectedClass]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const confirmDelete = (s: UserProfile) => {
    Alert.alert('Delete student', `Delete ${s.name || s.email}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteStudent(s.uid); await load(); } }
    ]);
  };

  const filtered = students.filter(s => {
    const term = q.trim().toLowerCase();
    if (!term) return true;
    const name = (s.name || '').toLowerCase();
    const email = (s.email || '').toLowerCase();
    const id = (s.employeeId || '').toLowerCase();
    return name.includes(term) || email.includes(term) || id.includes(term);
  });

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <Text style={styles.title}>Students</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => router.push('/(admin)/students/new')}>
          <Ionicons name="add-circle" size={24} color="#fff" />
          <Text style={styles.addBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filters}>
        <TextInput
          placeholder="Search name, email, ID"
          style={styles.search}
          value={q}
          onChangeText={setQ}
        />
        <View style={styles.classFilter}>
          <TouchableOpacity onPress={() => setSelectedClass(null)} style={[styles.classChip, !selectedClass && styles.classChipActive]}>
            <Text style={[styles.classChipText, !selectedClass && styles.classChipTextActive]}>All</Text>
          </TouchableOpacity>
          {classes.map(c => (
            <TouchableOpacity key={c.id} onPress={() => setSelectedClass(c.id)} style={[styles.classChip, selectedClass === c.id && styles.classChipActive]}>
              <Text style={[styles.classChipText, selectedClass === c.id && styles.classChipTextActive]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

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
                <Text style={styles.meta}>{item.email || 'No email'} · {item.classes || 'No class'}</Text>
              </View>
              <TouchableOpacity onPress={() => router.push({ pathname: '/(admin)/students/[id]', params: { id: item.uid } })} style={styles.rowBtn}>
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
  filters: { marginBottom: 12 },
  search: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  classFilter: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  classChip: { borderWidth: 1, borderColor: '#cbd5e1', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20, marginRight: 8, marginBottom: 8 },
  classChipActive: { backgroundColor: '#1E90FF', borderColor: '#1E90FF' },
  classChipText: { color: '#334155', fontWeight: '600' },
  classChipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10, borderWidth: StyleSheet.hairlineWidth, borderColor: '#e5e7eb' },
  rowBtn: { padding: 8, marginLeft: 6 },
  name: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  meta: { color: '#64748b', marginTop: 2 },
});
