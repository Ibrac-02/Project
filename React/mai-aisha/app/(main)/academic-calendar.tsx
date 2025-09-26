import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/config/firebase';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

const COLL = 'academicCalendar';

export default function AcademicCalendarScreen() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CalendarEvent[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, COLL));
    const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<CalendarEvent, 'id'>) }));
    // Sort by date ascending
    data.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const addEvent = async () => {
    if (!title.trim() || !date.trim()) return;
    await addDoc(collection(db, COLL), { title: title.trim(), date: date.trim(), description: description.trim() || undefined });
    setTitle(''); setDate(''); setDescription('');
    await load();
  };

  const remove = async (id: string) => {
    await deleteDoc(doc(db, COLL, id));
    await load();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Academic Calendar</Text>
      <Text style={styles.subtitle}>School-wide events and dates</Text>

      <View style={styles.newRow}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Event title" style={[styles.input, { flex: 2, marginRight: 6 }]} />
        <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={[styles.input, { flex: 1, marginLeft: 6 }]} />
      </View>
      <TextInput value={description} onChangeText={setDescription} placeholder="Description (optional)" style={styles.input} />
      <TouchableOpacity onPress={addEvent} style={styles.btnPrimary}>
        <Ionicons name="add" size={18} color="#fff" />
        <Text style={styles.btnPrimaryText}>Add Event</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}><ActivityIndicator /></View>
      ) : (
        <FlatList
          style={{ marginTop: 12 }}
          data={items}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>Date: {item.date}</Text>
                {!!item.description && <Text style={styles.cardMeta}>{item.description}</Text>}
              </View>
              <TouchableOpacity onPress={() => remove(item.id)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color="#D11A2A" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#666' }}>No events yet.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 8 },
  btnPrimary: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', paddingHorizontal: 12, height: 36, borderRadius: 8, marginTop: 10 },
  btnPrimaryText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  newRow: { flexDirection: 'row', alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardMeta: { color: '#666', marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 8 },
});
