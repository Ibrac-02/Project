import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createAttendance, deleteAttendance, listAttendanceForTeacher, updateAttendance, type AttendanceRecord, type AttendanceStatus } from '@/lib/attendance';
import { useAuth } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import { listClasses } from '@/lib/classes';
import { listStudents } from '@/lib/students';
import AutoComplete from '@/components/AutoComplete';
import { useTheme } from '@/contexts/ThemeContext';
import { STANDARD_STYLES, MARGINS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/Styles';

export default function TeacherAttendanceScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('teacher');
  const { user } = useAuth();
  const { colors } = useTheme();
  const teacherId = user?.uid || '';

  const [items, setItems] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AttendanceRecord | null>(null);
  const [date, setDate] = useState('');
  const [classId, setClassId] = useState('');
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState<AttendanceStatus>('present');

  // Format today's date as default
  const todayDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  const load = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);
    try {
      const [att, cls, studs] = await Promise.all([
        listAttendanceForTeacher(teacherId),
        listClasses(),
        listStudents(),
      ]);
      setItems(att);
      // Filter classes to only show teacher's assigned classes, or show all if no teacher-specific classes
      const teacherClasses = cls.filter(c => c.teacherId === teacherId);
      // If no teacher-specific classes, show all classes (fallback)
      const classesToShow = teacherClasses.length > 0 ? teacherClasses : cls;
      setClasses(classesToShow.map(c => ({ id: c.id, name: c.name })));
      setStudents(studs.map(s => ({ id: s.uid, name: s.name || 'Unknown Student' })));
    } catch (error) {
      console.error('Error loading attendance data:', error);
      Alert.alert('Error', 'Failed to load attendance data');
    }
    setLoading(false);
  }, [teacherId]);

  useEffect(() => { if (allowed) { load(); } }, [allowed, load]);

  const openNew = () => {
    setEditing(null);
    setDate(todayDate); // Set today's date as default
    setClassId('');
    setStudentId('');
    setStatus('present');
    setModalOpen(true);
  };

  const openEdit = (rec: AttendanceRecord) => {
    setEditing(rec);
    setDate(rec.date);
    setClassId(rec.classId || '');
    setStudentId(rec.studentId);
    setStatus(rec.status);
    setModalOpen(true);
  };

  const save = async () => {
    if (!teacherId) { Alert.alert('Not allowed'); return; }
    if (!date.trim() || !studentId.trim()) { Alert.alert('Validation', 'Date and student are required.'); return; }
    
    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date.trim())) {
      Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format');
      return;
    }
    
    const payload = {
      date: date.trim(),
      classId: classId || '',
      studentId: studentId.trim(),
      status,
      teacherId,
    } as Omit<AttendanceRecord, 'id'>;
    try {
      if (editing) await updateAttendance(editing.id, payload);
      else await createAttendance(payload);
      setModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not save attendance');
    }
  };

  const remove = (rec: AttendanceRecord) => {
    const studentName = students.find(s => s.id === rec.studentId)?.name || rec.studentId;
    Alert.alert('Delete record', `Delete attendance for ${studentName} on ${rec.date}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteAttendance(rec.id);
          await load();
        } catch (error) {
          Alert.alert('Error', 'Failed to delete attendance record');
        }
      }}
    ]);
  };

  const className = useMemo(() => new Map(classes.map(c => [c.id, c.name])), [classes]);
  const studentName = useMemo(() => new Map(students.map(s => [s.id, s.name])), [students]);
  const classOptions = useMemo(() => classes.map(c => ({ id: c.id, name: c.name })), [classes]);
  const studentOptions = useMemo(() => {
    return students;
  }, [students]);
  const statusOptions = useMemo(() => (['present', 'absent', 'late'] as AttendanceStatus[]).map(s => ({ id: s, name: s })), []);

  return !allowed || roleLoading ? null : (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Student Attendance</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Mark, edit and view attendance</Text>

      <TouchableOpacity onPress={openNew} style={[styles.addBtn, { backgroundColor: colors.primaryBlue }]}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>New Record</Text>
      </TouchableOpacity>

      <FlatList
        data={items}
        keyExtractor={(i) => i.id}
        refreshing={loading}
        onRefresh={load}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {studentName.get(item.studentId) || item.studentId}
              </Text>
              <Text style={[styles.cardMeta, { color: colors.text }]}>Date: {item.date} • Status: {item.status}</Text>
              {!!item.classId && <Text style={[styles.cardMeta, { color: colors.text }]}>Class: {className.get(item.classId) || item.classId}</Text>}
            </View>
            <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}><Ionicons name="create-outline" size={20} color={colors.primaryBlue} /></TouchableOpacity>
            <TouchableOpacity onPress={() => remove(item)} style={styles.iconBtn}><Ionicons name="trash-outline" size={20} color={colors.danger} /></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No attendance records yet.</Text>) : null}
      />

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editing ? 'Edit Attendance' : 'New Attendance'}</Text>
            <TextInput 
              value={date} 
              onChangeText={setDate} 
              placeholder={`Date (YYYY-MM-DD) - Today: ${todayDate}`}
              placeholderTextColor={colors.text + '80'}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]} 
            />
            <Text style={[styles.label, { color: colors.text }]}>Class (Optional)</Text>
            <AutoComplete
              value={className.get(classId) || ''}
              placeholder="Search class..."
              data={classOptions}
              labelExtractor={(i) => i.name}
              onChangeText={() => { /* display-only input for search; selection sets id */ }}
              onSelectItem={(it) => setClassId(it.id)}
            />
            <Text style={styles.label}>Student *</Text>
            <AutoComplete
              value={studentName.get(studentId) || studentId}
              placeholder="Search student..."
              data={studentOptions}
              labelExtractor={(i) => i.name}
              onChangeText={(text) => {
                // Allow searching by name, but if no exact match, keep the text
                const student = students.find(s => s.name.toLowerCase().includes(text.toLowerCase()));
                if (student) setStudentId(student.id);
                else setStudentId(text);
              }}
              onSelectItem={(it) => setStudentId(it.id)}
            />
            <Text style={[styles.label, { color: colors.text }]}>Status *</Text>
            <View style={styles.statusButtons}>
              {(['present', 'absent', 'late'] as AttendanceStatus[]).map(statusOption => (
                <TouchableOpacity
                  key={statusOption}
                  style={[
                    styles.statusButton,
                    { borderColor: colors.border },
                    status === statusOption && { backgroundColor: colors.primaryBlue, borderColor: colors.primaryBlue }
                  ]}
                  onPress={() => setStatus(statusOption)}
                >
                  <Ionicons 
                    name={
                      statusOption === 'present' ? 'checkmark-circle' :
                      statusOption === 'absent' ? 'close-circle' : 'time'
                    } 
                    size={20} 
                    color={status === statusOption ? '#fff' : colors.primaryBlue} 
                  />
                  <Text style={[
                    styles.statusButtonText,
                    { color: colors.text },
                    status === statusOption && { color: '#fff' }
                  ]}>
                    {statusOption.charAt(0).toUpperCase() + statusOption.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={[styles.btn, styles.btnPrimary]}>
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
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { marginTop: 2 },
  addBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 36, borderRadius: 8, marginTop: 12, marginBottom: 8 },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee' },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardMeta: { marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 8 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600' },
  statusButtons: { flexDirection: 'row', gap: 8, marginTop: 8 },
  statusButton: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    borderWidth: 2,
    gap: 8
  },
  statusButtonText: { fontSize: 14, fontWeight: '600' },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 16, marginRight: 8, marginBottom: 8 },
  chipActive: { borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  chipText: { color: '#444' },
  chipTextActive: { color: '#1E90FF', fontWeight: '600' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  btn: { height: 42, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  btnGhostText: { color: '#333' },
  btnPrimary: { backgroundColor: '#1E90FF' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});