import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { createTerm, deleteTerm, getCurrentTerm, listTerms, setActiveTerm, updateTerm, type AcademicTerm, type Holiday } from '@/lib/terms';
import { useRequireRole } from '@/lib/access';
import { useTheme } from '@/contexts/ThemeContext';

export default function TermManagementScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('admin');
  const { colors } = useTheme();
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AcademicTerm | null>(null);

  // Form fields
  const [name, setName] = useState('');
  const [academicYear, setAcademicYear] = useState('');
  const [termNumber, setTermNumber] = useState('1');
  const [openingDate, setOpeningDate] = useState('');
  const [examStartDate, setExamStartDate] = useState('');
  const [closingDate, setClosingDate] = useState('');
  const [holidays, setHolidays] = useState<Holiday[]>([]);

  const load = useCallback(async () => {
    if (!allowed) return;
    setLoading(true);
    try {
      const termsList = await listTerms();
      setTerms(termsList);
    } catch (error) {
      console.error('Error loading terms:', error);
      Alert.alert('Error', 'Failed to load terms');
    }
    setLoading(false);
  }, [allowed]);

  useEffect(() => {
    if (allowed) load();
  }, [allowed, load]);

  const openNew = () => {
    setEditing(null);
    setName('');
    setAcademicYear(new Date().getFullYear() + '/' + (new Date().getFullYear() + 1));
    setTermNumber('1');
    setOpeningDate(new Date().toISOString().split('T')[0]); // Current date
    setExamStartDate(new Date().toISOString().split('T')[0]); // Current date
    setClosingDate(new Date().toISOString().split('T')[0]); // Current date
    setHolidays([]);
    setModalOpen(true);
  };

  const openEdit = (term: AcademicTerm) => {
    setEditing(term);
    setName(term.name);
    setAcademicYear(term.academicYear);
    setTermNumber(term.termNumber.toString());
    setOpeningDate(term.openingDate);
    setExamStartDate(term.examStartDate);
    setClosingDate(term.closingDate);
    setHolidays(term.holidays);
    setModalOpen(true);
  };

  const save = async () => {
    if (!name.trim() || !academicYear.trim() || !openingDate.trim() || !examStartDate.trim() || !closingDate.trim()) {
      Alert.alert('Validation', 'Please fill all required fields');
      return;
    }

    const termData = {
      name: name.trim(),
      academicYear: academicYear.trim(),
      termNumber: parseInt(termNumber),
      openingDate: openingDate.trim(),
      examStartDate: examStartDate.trim(),
      closingDate: closingDate.trim(),
      holidays,
      isActive: false, // Admin can set active separately
    };

    try {
      if (editing) {
        await updateTerm(editing.id, termData);
      } else {
        await createTerm(termData);
      }
      setModalOpen(false);
      await load();
    } catch (error) {
      console.error('Error saving term:', error);
      Alert.alert('Error', 'Failed to save term');
    }
  };

  const makeActive = async (term: AcademicTerm) => {
    Alert.alert(
      'Set Active Term',
      `Set "${term.name}" as the current active term?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Active',
          onPress: async () => {
            try {
              await setActiveTerm(term.id);
              await load();
              Alert.alert('Success', 'Active term updated');
            } catch (error) {
              Alert.alert('Error', 'Failed to set active term');
            }
          }
        }
      ]
    );
  };

  const remove = (term: AcademicTerm) => {
    Alert.alert(
      'Delete Term',
      `Delete "${term.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTerm(term.id);
              await load();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete term');
            }
          }
        }
      ]
    );
  };

  const addHoliday = () => {
    const newHoliday: Holiday = {
      id: Date.now().toString(),
      name: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    setHolidays([...holidays, newHoliday]);
  };

  const updateHoliday = (index: number, field: keyof Holiday, value: string) => {
    const updated = [...holidays];
    updated[index] = { ...updated[index], [field]: value };
    setHolidays(updated);
  };

  const removeHoliday = (index: number) => {
    setHolidays(holidays.filter((_, i) => i !== index));
  };

  if (!allowed || roleLoading) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Term Management</Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>Create and manage academic terms</Text>

      <TouchableOpacity onPress={openNew} style={[styles.addBtn, { backgroundColor: colors.primaryBlue }]}>
        <Ionicons name="add" size={20} color="#fff" />
        <Text style={styles.addBtnText}>New Term</Text>
      </TouchableOpacity>

      <FlatList
        data={terms}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={load}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
            <View style={{ flex: 1 }}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                {item.isActive && (
                  <View style={[styles.activeBadge, { backgroundColor: colors.primaryBlue + '15' }]}>
                    <Text style={[styles.activeText, { color: colors.primaryBlue }]}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.cardMeta, { color: colors.text }]}>{item.academicYear} • Term {item.termNumber}</Text>
              <Text style={[styles.cardMeta, { color: colors.text }]}>
                {item.openingDate} to {item.closingDate}
              </Text>
              <Text style={[styles.cardMeta, { color: colors.text }]}>
                Exams: {item.examStartDate} • Holidays: {item.holidays.length}
              </Text>
            </View>
            <View style={styles.cardActions}>
              {!item.isActive && (
                <TouchableOpacity onPress={() => makeActive(item)} style={styles.iconBtn}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.primaryBlue} />
                </TouchableOpacity>
              )}
              <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                <Ionicons name="create-outline" size={20} color={colors.primaryBlue} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => remove(item)} style={styles.iconBtn}>
                <Ionicons name="trash-outline" size={20} color={colors.danger} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          !loading ? (
            <Text style={{ color: colors.text + '70', textAlign: 'center', marginTop: 20 }}>
              No terms created yet
            </Text>
          ) : null
        }
      />

      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editing ? 'Edit Term' : 'New Term'}
            </Text>

            <Text style={[styles.label, { color: colors.text }]}>Term Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., First Term 2024"
              placeholderTextColor={colors.text + '70'}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.text }]}>Academic Year *</Text>
            <TextInput
              value={academicYear}
              onChangeText={setAcademicYear}
              placeholder="e.g., 2024/2025"
              placeholderTextColor={colors.text + '70'}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.text }]}>Term Number *</Text>
            <TextInput
              value={termNumber}
              onChangeText={setTermNumber}
              placeholder="1, 2, or 3"
              keyboardType="numeric"
              placeholderTextColor={colors.text + '70'}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.text }]}>Opening Date *</Text>
            <TextInput
              value={openingDate}
              onChangeText={setOpeningDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text + '70'}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.text }]}>Exam Start Date *</Text>
            <TextInput
              value={examStartDate}
              onChangeText={setExamStartDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text + '70'}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />

            <Text style={[styles.label, { color: colors.text }]}>Closing Date *</Text>
            <TextInput
              value={closingDate}
              onChangeText={setClosingDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.text + '70'}
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
            />

            <View style={styles.holidaysSection}>
              <View style={styles.holidaysHeader}>
                <Text style={styles.label}>Holidays</Text>
                <TouchableOpacity onPress={addHoliday} style={styles.addHolidayBtn}>
                  <Ionicons name="add" size={16} color={colors.primaryBlue} />
                  <Text style={[styles.addHolidayText, { color: colors.primaryBlue }]}>Add Holiday</Text>
                </TouchableOpacity>
              </View>

              {holidays.map((holiday, index) => (
                <View key={index} style={[styles.holidayItem, { backgroundColor: colors.background }]}>
                  <TextInput
                    value={holiday.name}
                    onChangeText={(text) => updateHoliday(index, 'name', text)}
                    placeholder="Holiday name"
                    placeholderTextColor={colors.text + '70'}
                    style={[styles.input, { marginBottom: 4, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  />
                  <View style={styles.holidayDates}>
                    <TextInput
                      value={holiday.startDate}
                      onChangeText={(text) => updateHoliday(index, 'startDate', text)}
                      placeholder="Start date"
                      placeholderTextColor={colors.text + '70'}
                      style={[styles.input, { flex: 1, marginRight: 8, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    />
                    <TextInput
                      value={holiday.endDate}
                      onChangeText={(text) => updateHoliday(index, 'endDate', text)}
                      placeholder="End date"
                      placeholderTextColor={colors.text + '70'}
                      style={[styles.input, { flex: 1, backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                    />
                    <TouchableOpacity onPress={() => removeHoliday(index)} style={styles.removeHolidayBtn}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setModalOpen(false)} style={[styles.btn, styles.btnGhost, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.btnGhostText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={[styles.btn, styles.btnPrimary, { backgroundColor: colors.primaryBlue }]}>
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
  subtitle: { marginTop: 2, marginBottom: 16 },
  addBtn: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 36, borderRadius: 8, marginBottom: 16 },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 10, padding: 12, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  activeBadge: { backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  activeText: { fontSize: 10, fontWeight: '700', color: '#10B981' },
  cardMeta: { fontSize: 13, marginTop: 2 },
  cardActions: { flexDirection: 'row' },
  iconBtn: { padding: 8, marginLeft: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalCard: { borderRadius: 12, padding: 16, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600' },
  input: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 4 },
  holidaysSection: { marginTop: 16 },
  holidaysHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  addHolidayBtn: { flexDirection: 'row', alignItems: 'center' },
  addHolidayText: { color: '#1E90FF', marginLeft: 4, fontSize: 14, fontWeight: '600' },
  holidayItem: { marginBottom: 12, padding: 12, backgroundColor: '#f8fafc', borderRadius: 8 },
  holidayDates: { flexDirection: 'row', alignItems: 'center' },
  removeHolidayBtn: { padding: 8, marginLeft: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  btn: { height: 42, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  btnGhostText: { color: '#333' },
  btnPrimary: { backgroundColor: '#1E90FF' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
