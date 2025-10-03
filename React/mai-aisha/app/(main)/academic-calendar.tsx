import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useTheme } from '@/contexts/ThemeContext';
import { MARGINS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/Styles';
import { generateMalawiHolidays, type Holiday } from '@/constants/MalawiHolidays';

interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  description?: string;
}

type CalendarItem = CalendarEvent | Holiday;

const COLL = 'academicCalendar';

export default function AcademicCalendarScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<CalendarEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [showHolidays, setShowHolidays] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, COLL));
      const data = snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<CalendarEvent, 'id'>) }));
      // Sort by date ascending
      data.sort((a, b) => (a.date || '').localeCompare(b.date || ''));
      setItems(data);
      
      // Load Malawi holidays for current year
      const year = currentMonth.getFullYear();
      const yearHolidays = generateMalawiHolidays(year);
      setHolidays(yearHolidays);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth]);

  useEffect(() => { load(); }, [load]);

  const addEvent = async () => {
    if (!title.trim() || !date.trim()) {
      alert('Please enter both title and date');
      return;
    }
    
    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      alert('Please enter date in YYYY-MM-DD format (e.g., 2024-12-25)');
      return;
    }
    
    // Validate that it's a valid date
    const testDate = new Date(date.trim());
    if (isNaN(testDate.getTime())) {
      alert('Please enter a valid date');
      return;
    }
    
    try {
      await addDoc(collection(db, COLL), { 
        title: title.trim(), 
        date: date.trim(), 
        description: description.trim() || '' 
      });
      setTitle(''); 
      setDate(''); 
      setDescription('');
      await load();
      alert('Event added successfully!');
    } catch (error) {
      console.error('Error adding event:', error);
      alert('Failed to add event. Please try again.');
    }
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
    const map = new Map<string, CalendarItem[]>();
    
    // Add regular events
    for (const e of items) {
      const list = map.get(e.date) || [];
      list.push(e);
      map.set(e.date, list);
    }
    
    // Add holidays if enabled
    if (showHolidays) {
      for (const h of holidays) {
        const list = map.get(h.date) || [];
        list.push(h);
        map.set(h.date, list);
      }
    }
    
    return map;
  }, [items, holidays, showHolidays]);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Combined Header */}
      <View style={[styles.header, { backgroundColor: colors.primaryBlue }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.title, { color: '#fff' }]}>Academic Calendar</Text>
            <Text style={[styles.subtitle, { color: '#fff', opacity: 0.9 }]}>School-wide events and Malawi holidays</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setShowHolidays(!showHolidays)}
            style={[styles.toggleButton, { backgroundColor: showHolidays ? '#fff' : 'rgba(255,255,255,0.3)' }]}
          >
            <Ionicons 
              name={showHolidays ? 'calendar' : 'calendar-outline'} 
              size={20} 
              color={showHolidays ? colors.primaryBlue : '#fff'} 
            />
            <Text style={[styles.toggleText, { color: showHolidays ? colors.primaryBlue : '#fff' }]}>Holidays</Text>
          </TouchableOpacity>
        </View>
        
        {/* Month Navigation */}
        <View style={styles.monthNavigation}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthNavBtn}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={[styles.monthLabel, { color: '#fff' }]}>{monthLabel}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthNavBtn}>
            <Ionicons name="chevron-forward" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity onPress={goToday} style={styles.todayButton}> 
            <Text style={[styles.todayButtonText, { color: '#fff' }]}>Today</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.content, { backgroundColor: colors.background }]}>

        {/* Weekday Header */}
        <View style={[styles.weekHeader, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <Text key={d} style={[styles.weekHeaderText, { color: colors.text }]}>{d}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.grid}>
          {getMonthMatrix.map((row, ri) => (
            <View key={ri} style={styles.gridRow}>
              {row.map((cell, ci) => {
                const ymd = toYmd(cell.date);
                const isSelected = selectedDate === ymd;
                const cellEvents = eventsByDate.get(ymd) || [];
                const hasHoliday = cellEvents.some(e => 'isNational' in e);
                const hasRegularEvent = cellEvents.some(e => !('isNational' in e));
                
                return (
                  <TouchableOpacity 
                    key={ci} 
                    style={[
                      styles.gridCell, 
                      { backgroundColor: colors.cardBackground, borderColor: colors.border },
                      !cell.isCurrent && { backgroundColor: colors.background, opacity: 0.5 },
                      isSelected && { borderColor: colors.primaryBlue, backgroundColor: colors.primaryBlue + '20' },
                      isToday(cell.date) && { borderColor: colors.primaryBlue, borderWidth: 2 },
                      hasHoliday && { backgroundColor: '#ff6b6b20' }
                    ]} 
                    onPress={() => onSelectDate(cell.date)}
                  >
                    <Text style={[
                      styles.gridCellText, 
                      { color: colors.text },
                      !cell.isCurrent && { opacity: 0.5 },
                      hasHoliday && { color: '#ff6b6b', fontWeight: '600' }
                    ]}>
                      {cell.date.getDate()}
                    </Text>
                    {hasRegularEvent && <View style={[styles.eventDot, { backgroundColor: colors.primaryBlue }]} />}
                    {hasHoliday && <View style={[styles.holidayDot, { backgroundColor: '#ff6b6b' }]} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={[styles.legendRow, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.legendItem}>
            <View style={[styles.eventDot, { backgroundColor: colors.primaryBlue, position: 'relative', bottom: 0 }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>School Events</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.holidayDot, { backgroundColor: '#ff6b6b', position: 'relative', bottom: 0 }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Public Holidays</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.todayIndicator, { borderColor: colors.primaryBlue }]} />
            <Text style={[styles.legendText, { color: colors.text }]}>Today</Text>
          </View>
        </View>

        {/* Add Event Form */}
        <View style={[styles.formCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.text }]}>Add New Event</Text>
          
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Event Title</Text>
              <TextInput 
                value={title} 
                onChangeText={setTitle} 
                placeholder="Enter event title" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
              />
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Date</Text>
              <View style={styles.dateInputContainer}>
                <TextInput 
                  value={date} 
                  onChangeText={setDate} 
                  placeholder="YYYY-MM-DD" 
                  placeholderTextColor={colors.text + '70'}
                  style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text, flex: 1 }]}
                />
                <TouchableOpacity 
                  onPress={() => {
                    const today = new Date();
                    const todayStr = today.toISOString().split('T')[0];
                    setDate(todayStr);
                  }}
                  style={[styles.quickDateBtn, { backgroundColor: colors.primaryBlue }]}
                >
                  <Text style={styles.quickDateText}>Today</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          
          <View style={styles.formRow}>
            <View style={styles.formField}>
              <Text style={[styles.fieldLabel, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput 
                value={description} 
                onChangeText={setDescription} 
                placeholder="Enter event description" 
                placeholderTextColor={colors.text + '70'}
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
          <View style={styles.formActions}>
            <TouchableOpacity 
              onPress={async () => {
                try {
                  if (editingId) {
                    if (!title.trim() || !date.trim()) {
                      alert('Please enter both title and date');
                      return;
                    }
                    await updateDoc(doc(db, COLL, editingId), { 
                      title: title.trim(), 
                      date: date.trim(), 
                      description: description.trim() || '' 
                    });
                    setEditingId(null); 
                    setTitle(''); 
                    setDate(''); 
                    setDescription(''); 
                    await load();
                  } else {
                    await addEvent();
                  }
                } catch (error) {
                  console.error('Error saving event:', error);
                  alert('Failed to save event. Please try again.');
                }
              }} 
              style={[styles.btnPrimary, { backgroundColor: colors.primaryBlue }]}
            >
              <Ionicons name={editingId ? 'save-outline' : 'add'} size={18} color="#fff" />
              <Text style={styles.btnPrimaryText}>{editingId ? 'Save Changes' : 'Add Event'}</Text>
            </TouchableOpacity>
            {editingId && (
              <TouchableOpacity 
                onPress={() => { 
                  setEditingId(null); 
                  setTitle(''); 
                  setDate(''); 
                  setDescription(''); 
                }} 
                style={[styles.btnSecondary, { borderColor: colors.border }]}
              >
                <Text style={[styles.btnSecondaryText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Events List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primaryBlue} />
            <Text style={[styles.loadingText, { color: colors.text }]}>Loading events...</Text>
          </View>
        ) : (
          <FlatList<CalendarItem>
            style={styles.eventsList}
            data={selectedDate ? 
              [...items.filter(i => i.date === selectedDate), 
               ...holidays.filter(h => h.date === selectedDate)] : 
              [...items, ...(showHolidays ? holidays : [])]
            }
            keyExtractor={(item) => {
              if ('id' in item && typeof item.id === 'string') {
                return item.id;
              } else {
                const holiday = item as Holiday;
                return `holiday-${holiday.date}-${holiday.name}`;
              }
            }}
            ItemSeparatorComponent={() => <View style={{ height: SPACING.sm }} />}
            renderItem={({ item }) => {
              const isHoliday = 'isNational' in item;
              return (
                <View style={[styles.eventCard, { 
                  backgroundColor: colors.cardBackground, 
                  borderColor: colors.border,
                  borderLeftColor: isHoliday ? '#ff6b6b' : colors.primaryBlue,
                  borderLeftWidth: 4
                }]}>
                  <View style={styles.eventContent}>
                    <View style={styles.eventHeader}>
                      <Text style={[styles.eventTitle, { color: colors.text }]}>
                        {isHoliday ? (item as Holiday).name : (item as CalendarEvent).title}
                      </Text>
                      {isHoliday && (
                        <View style={[styles.holidayBadge, { backgroundColor: '#ff6b6b20' }]}>
                          <Text style={[styles.holidayBadgeText, { color: '#ff6b6b' }]}>Holiday</Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.eventDate, { color: colors.text, opacity: 0.7 }]}>
                      {new Date(item.date).toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </Text>
                    {((item as CalendarEvent).description || (item as Holiday).description) && (
                      <Text style={[styles.eventDescription, { color: colors.text, opacity: 0.8 }]}>
                        {(item as CalendarEvent).description || (item as Holiday).description}
                      </Text>
                    )}
                  </View>
                  {!isHoliday && (
                    <View style={styles.eventActions}>
                      <TouchableOpacity 
                        onPress={() => { 
                          const calendarItem = item as CalendarEvent;
                          setEditingId(calendarItem.id); 
                          setTitle(calendarItem.title); 
                          setDate(calendarItem.date); 
                          setDescription(calendarItem.description || ''); 
                        }} 
                        style={[styles.actionBtn, { backgroundColor: colors.primaryBlue + '20' }]}
                      >
                        <Ionicons name="create-outline" size={18} color={colors.primaryBlue} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        onPress={() => remove((item as CalendarEvent).id)} 
                        style={[styles.actionBtn, { backgroundColor: '#ff6b6b20' }]}
                      >
                        <Ionicons name="trash-outline" size={18} color="#ff6b6b" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.text + '40'} />
                <Text style={[styles.emptyText, { color: colors.text, opacity: 0.6 }]}>
                  {selectedDate ? 'No events for selected date.' : 'No events yet. Add your first event!'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  header: {
    paddingHorizontal: MARGINS.horizontal,
    paddingTop: 50,
    paddingBottom: SPACING.lg,
    ...SHADOWS.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.lg,
  },
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { 
    ...TYPOGRAPHY.h2,
    marginBottom: 4,
  },
  subtitle: { 
    ...TYPOGRAPHY.bodySmall,
    opacity: 0.9,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: MARGINS.horizontal,
  },
  monthNavBtn: { 
    padding: SPACING.sm, 
    borderRadius: BORDER_RADIUS.sm,
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  monthLabel: { 
    ...TYPOGRAPHY.h3,
    flex: 1,
    textAlign: 'center',
  },
  todayButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  weekHeader: { 
    marginTop: SPACING.md,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
  },
  weekHeaderText: { 
    flex: 1, 
    textAlign: 'center', 
    fontWeight: '600',
    fontSize: 14,
  },
  grid: { 
    marginTop: SPACING.sm 
  },
  gridRow: { 
    flexDirection: 'row',
    marginBottom: 2,
  },
  gridCell: { 
    flex: 1, 
    aspectRatio: 1, 
    margin: 2, 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    position: 'relative',
    minHeight: 44,
  },
  gridCellText: { 
    fontWeight: '600',
    fontSize: 16,
  },
  eventDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    position: 'absolute', 
    bottom: 6,
    left: '50%',
    marginLeft: -3,
  },
  holidayDot: { 
    width: 6, 
    height: 6, 
    borderRadius: 3, 
    position: 'absolute', 
    bottom: 6,
    right: 6,
  },
  legendRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-around',
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
  },
  todayIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  formCard: {
    marginTop: SPACING.xl,
    padding: MARGINS.container,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    ...SHADOWS.md,
  },
  formTitle: {
    ...TYPOGRAPHY.h3,
    marginBottom: SPACING.lg,
  },
  formRow: {
    marginBottom: SPACING.lg,
  },
  formField: {
    flex: 1,
  },
  fieldLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: { 
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 16,
    minHeight: 48,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  dateInputContainer: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  quickDateBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  quickDateText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  formActions: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  btnPrimary: { 
    flexDirection: 'row', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
    flex: 1,
    ...SHADOWS.sm,
  },
  btnPrimaryText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
  },
  btnSecondary: { 
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  btnSecondaryText: { 
    fontWeight: '600',
    fontSize: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.md,
  },
  loadingText: {
    ...TYPOGRAPHY.bodySmall,
  },
  eventsList: {
    marginTop: SPACING.lg,
    flex: 1,
  },
  eventCard: { 
    flexDirection: 'row', 
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    borderWidth: 1,
    ...SHADOWS.sm,
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  eventTitle: { 
    ...TYPOGRAPHY.h4,
    flex: 1,
  },
  holidayBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    marginLeft: SPACING.sm,
  },
  holidayBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  eventDate: { 
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.sm,
  },
  eventDescription: {
    ...TYPOGRAPHY.bodySmall,
  },
  eventActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginLeft: SPACING.md,
  },
  actionBtn: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 36,
    minHeight: 36,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxxl,
    gap: SPACING.lg,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    textAlign: 'center',
  },
});