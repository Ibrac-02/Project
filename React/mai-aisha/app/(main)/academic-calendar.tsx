import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
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
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
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

  // Helpers for calendar grid
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthLabel = currentMonth.toLocaleString(undefined, { month: 'long', year: 'numeric' });

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const e of items) {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    }
    return map;
  }, [items]);

  const toYmd = (d: Date) => {
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  };

  const getMonthMatrix = useMemo(() => {
    // Return 6 rows x 7 cols date objects to fill calendar grid
    const firstDay = new Date(year, month, 1);
    const startWeekday = firstDay.getDay(); // 0 Sun - 6 Sat
    const start = new Date(firstDay);
    start.setDate(firstDay.getDate() - startWeekday); // move back to Sunday
    const weeks: { date: Date; isCurrent: boolean }[][] = [];
    let cursor = new Date(start);
    for (let w = 0; w < 6; w++) {
      const row: { date: Date; isCurrent: boolean }[] = [];
      for (let d = 0; d < 7; d++) {
        const cell = new Date(cursor);
        row.push({ date: cell, isCurrent: cell.getMonth() === month });
        cursor.setDate(cursor.getDate() + 1);
      }
      weeks.push(row);
    }
    return weeks;
  }, [year, month]);

  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const goToday = () => {
    const d = new Date();
    setCurrentMonth(new Date(d.getFullYear(), d.getMonth(), 1));
    const ymd = toYmd(d);
    setSelectedDate(ymd);
    setDate(ymd);
  };

  const onSelectDate = (d: Date) => {
    const ymd = toYmd(d);
    setSelectedDate(ymd);
    setDate(ymd); // prefill add form date
  };

  const isToday = (d: Date) => {
    const now = new Date();
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
  };

  const [editingId, setEditingId] = useState<string | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Academic Calendar</Text>
      <Text style={styles.subtitle}>School-wide events and dates</Text>

      {/* Month header */}
      <View style={styles.monthHeader}>
        <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
          <Ionicons name="chevron-back" size={20} color="#1E90FF" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
          <Ionicons name="chevron-forward" size={20} color="#1E90FF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={goToday} style={[styles.monthNavBtn, { marginLeft: 8 }]}> 
          <Text style={{ color: '#1E90FF', fontWeight: '700' }}>Today</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday header */}
      <View style={styles.weekHeader}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <Text key={d} style={styles.weekHeaderText}>{d}</Text>
        ))}
      </View>

      {/* Calendar grid */}
      <View style={styles.grid}>
        {getMonthMatrix.map((row, ri) => (
          <View key={ri} style={styles.gridRow}>
            {row.map((cell, ci) => {
              const ymd = toYmd(cell.date);
              const hasEvents = eventsByDate.has(ymd);
              const isSelected = selectedDate === ymd;
              return (
                <TouchableOpacity key={ci} style={[styles.gridCell, !cell.isCurrent && styles.gridCellMuted, isSelected && styles.gridCellSelected, isToday(cell.date) && styles.gridCellToday]} onPress={() => onSelectDate(cell.date)}>
                  <Text style={[styles.gridCellText, !cell.isCurrent && styles.gridCellTextMuted]}>{cell.date.getDate()}</Text>
                  {hasEvents && <View style={styles.dot} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={styles.legendRow}>
        <View style={[styles.dot, { position: 'relative', bottom: 0, marginRight: 6 }]} />
        <Text style={{ color: '#666' }}>Date has events</Text>
        <View style={{ width: 10 }} />
        <View style={[styles.legendBox, styles.gridCellToday]} />
        <Text style={{ color: '#666', marginLeft: 6 }}>Today</Text>
      </View>

      <View style={styles.newRow}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Event title" style={[styles.input, { flex: 2, marginRight: 6 }]} />
        <TextInput value={date} onChangeText={setDate} placeholder="YYYY-MM-DD" style={[styles.input, { flex: 1, marginLeft: 6 }]} />
      </View>
      <TextInput value={description} onChangeText={setDescription} placeholder="Description (optional)" style={styles.input} />
      <View style={{ flexDirection: 'row', marginTop: 10 }}>
        <TouchableOpacity onPress={async () => {
          if (editingId) {
            if (!title.trim() || !date.trim()) return;
            await updateDoc(doc(db, COLL, editingId), { title: title.trim(), date: date.trim(), description: description.trim() || undefined });
            setEditingId(null); setTitle(''); setDate(''); setDescription(''); await load();
          } else {
            await addEvent();
          }
        }} style={[styles.btnPrimary, { marginRight: 8 }]}
        >
          <Ionicons name={editingId ? 'save-outline' : 'add'} size={18} color="#fff" />
          <Text style={styles.btnPrimaryText}>{editingId ? 'Save Changes' : 'Add Event'}</Text>
        </TouchableOpacity>
        {editingId ? (
          <TouchableOpacity onPress={() => { setEditingId(null); setTitle(''); setDate(''); setDescription(''); }} style={[styles.btnSecondary]}>
            <Text style={styles.btnSecondaryText}>Cancel</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      {loading ? (
        <View style={{ marginTop: 20, alignItems: 'center' }}><ActivityIndicator /></View>
      ) : (
        <FlatList
          style={{ marginTop: 12 }}
          data={selectedDate ? items.filter(i => i.date === selectedDate) : items}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardMeta}>Date: {item.date}</Text>
                {!!item.description && <Text style={styles.cardMeta}>{item.description}</Text>}
              </View>
              <TouchableOpacity onPress={() => { setEditingId(item.id); setTitle(item.title); setDate(item.date); setDescription(item.description || ''); }} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={20} color="#1E90FF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item.id)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color="#D11A2A" />
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={{ color: '#666' }}>{selectedDate ? 'No events for selected date.' : 'No events yet.'}</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f8fa', padding: 16 },
  title: { fontSize: 22, fontWeight: '700', color: '#222' },
  subtitle: { marginTop: 2, color: '#666' },
  monthHeader: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  monthNavBtn: { padding: 6, borderRadius: 6, backgroundColor: '#EAF4FF' },
  monthLabel: { fontWeight: '700', color: '#222' },
  weekHeader: { marginTop: 8, flexDirection: 'row' },
  weekHeaderText: { flex: 1, textAlign: 'center', color: '#666', fontWeight: '600' },
  grid: { marginTop: 4 },
  gridRow: { flexDirection: 'row' },
  gridCell: { flex: 1, aspectRatio: 1, margin: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 8, backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', position: 'relative' },
  gridCellMuted: { backgroundColor: '#f5f6f8' },
  gridCellSelected: { borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  gridCellText: { color: '#222', fontWeight: '600' },
  gridCellTextMuted: { color: '#999' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#1E90FF', position: 'absolute', bottom: 8 },
  gridCellToday: { borderColor: '#1E90FF', borderWidth: 2 },
  legendRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  legendBox: { width: 14, height: 14, borderRadius: 4, borderWidth: 2, borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 8 },
  btnPrimary: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', paddingHorizontal: 12, height: 36, borderRadius: 8, marginTop: 10 },
  btnPrimaryText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  btnSecondary: { alignSelf: 'flex-start', paddingHorizontal: 12, height: 36, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  btnSecondaryText: { color: '#333', fontWeight: '600' },
  newRow: { flexDirection: 'row', alignItems: 'center' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardMeta: { color: '#666', marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 8 },
});
