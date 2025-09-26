import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, getAllUsers } from '@/lib/auth';
import { createAnnouncement, getAnnouncements, type Announcement } from '@/lib/announcements';

export default function HeadteacherAnnouncementsScreen() {
  const { user, role } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope, setScope] = useState<'staff-only' | 'class'>('staff-only');
  const [teachers, setTeachers] = useState<{ uid: string; name: string | null; email: string | null }[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getAnnouncements(role || 'headteacher', user?.uid || undefined);
      setItems(list);
      const all = await getAllUsers();
      setTeachers(all.filter(u => u.role === 'teacher').map(u => ({ uid: u.uid, name: u.name || null, email: u.email || null })));
    } finally {
      setLoading(false);
    }
  }, [role, user?.uid]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!user?.uid || !role) { Alert.alert('Not allowed', 'You must be logged in.'); return; }
    if (!title.trim() || !content.trim()) { Alert.alert('Validation', 'Title and content are required.'); return; }
    let finalScope: string = 'staff-only';
    if (scope === 'class') {
      if (!selectedTeacherId) { Alert.alert('Validation', 'Select a teacher (class)'); return; }
      finalScope = `class-${selectedTeacherId}`;
    }
    setSubmitting(true);
    try {
      await createAnnouncement({
        title: title.trim(),
        content: content.trim(),
        createdByUserId: user.uid,
        createdByUserRole: role,
        scope: finalScope,
      });
      setTitle('');
      setContent('');
      setSelectedTeacherId(null);
      await load();
      Alert.alert('Success', 'Announcement posted');
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not post announcement');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Headteacher Announcements</Text>
      <Text style={styles.subtitle}>Post to staff or a specific class (by teacher)</Text>

      <View style={styles.card}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Title" style={styles.input} />
        <TextInput value={content} onChangeText={setContent} placeholder="Content" multiline style={[styles.input, { height: 90, textAlignVertical: 'top' }]} />
        <View style={styles.row}>
          {(['staff-only', 'class'] as const).map(s => (
            <TouchableOpacity key={s} onPress={() => setScope(s)} style={[styles.chip, scope === s && styles.chipActive]}>
              <Text style={[styles.chipText, scope === s && styles.chipTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {scope === 'class' && (
          <View>
            <Text style={styles.label}>Select Teacher (class)</Text>
            <View style={styles.chipsRow}>
              {teachers.map(t => {
                const active = selectedTeacherId === t.uid;
                return (
                  <TouchableOpacity key={t.uid} onPress={() => setSelectedTeacherId(t.uid)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.name || t.email}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}
        <TouchableOpacity disabled={submitting} onPress={submit} style={[styles.btn, styles.btnPrimary, submitting && { opacity: 0.6 }]}>
          <Ionicons name="send" size={18} color="#fff" />
          <Text style={styles.btnPrimaryText}>Post</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Recent</Text>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.annItem}>
            <View style={{ flex: 1 }}>
              <Text style={styles.annTitle}>{item.title}</Text>
              <Text style={styles.annScope}>{item.scope}</Text>
              <Text style={styles.annContent}>{item.content}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No announcements yet.</Text>) : null}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 16, borderWidth: 1, borderColor: '#eee', marginTop: 12 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 8 },
  row: { flexDirection: 'row', marginTop: 8 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600', color: '#555' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 16, marginRight: 8, marginBottom: 8 },
  chipActive: { borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  chipText: { color: '#444' },
  chipTextActive: { color: '#1E90FF', fontWeight: '600' },
  btn: { height: 42, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginTop: 10 },
  btnPrimary: { backgroundColor: '#1E90FF' },
  btnPrimaryText: { color: '#fff', fontWeight: '600', marginLeft: 6 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  annItem: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  annTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  annScope: { color: '#666', marginTop: 2 },
  annContent: { color: '#444', marginTop: 6 },
});
