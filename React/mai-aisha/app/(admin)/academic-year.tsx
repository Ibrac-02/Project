import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Modal, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRequireRole } from '@/lib/access';
import { createAcademicYear, deleteAcademicYear, listAcademicYears, listTerms, createTerm, updateAcademicYear, updateTerm, deleteTerm } from '@/lib/academicYear';
import type { AcademicYear, Term } from '@/lib/types';

export default function AcademicYearScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('admin');

  // Years state
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(true);

  // Active selection
  const [activeYearId, setActiveYearId] = useState<string | null>(null);
  const [terms, setTerms] = useState<Term[]>([]);

  // Modals
  const [yearModalOpen, setYearModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYear | null>(null);
  const [yearName, setYearName] = useState('');
  const [yearStart, setYearStart] = useState('');
  const [yearEnd, setYearEnd] = useState('');
  const [yearActive, setYearActive] = useState(false);

  const [termModalOpen, setTermModalOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<Term | null>(null);
  const [termName, setTermName] = useState('');
  const [termStart, setTermStart] = useState('');
  const [termEnd, setTermEnd] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    const y = await listAcademicYears();
    setYears(y);
    // If an active year is selected, refresh its terms as well
    if (activeYearId) {
      const t = await listTerms(activeYearId);
      setTerms(t);
    }
    setLoading(false);
  }, [activeYearId]);

  useEffect(() => { if (allowed) { load(); } }, [allowed, load]);

  const openNewYear = () => {
    setEditingYear(null);
    setYearName('');
    setYearStart('');
    setYearEnd('');
    setYearActive(false);
    setYearModalOpen(true);
  };

  const openEditYear = (y: AcademicYear) => {
    setEditingYear(y);
    setYearName(y.name);
    setYearStart(y.startDate);
    setYearEnd(y.endDate);
    setYearActive(!!y.isActive);
    setYearModalOpen(true);
  };

  const saveYear = async () => {
    if (!yearName.trim() || !yearStart.trim() || !yearEnd.trim()) { Alert.alert('Validation', 'Name, start and end dates are required'); return; }
    const payload = { name: yearName.trim(), startDate: yearStart.trim(), endDate: yearEnd.trim(), isActive: !!yearActive } as Omit<AcademicYear, 'id'>;
    try {
      if (editingYear) await updateAcademicYear(editingYear.id, payload);
      else await createAcademicYear(payload);
      setYearModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not save academic year');
    }
  };

  const removeYear = (y: AcademicYear) => {
    Alert.alert('Delete year', `Delete ${y.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteAcademicYear(y.id); if (activeYearId === y.id) { setActiveYearId(null); setTerms([]);} await load(); } }
    ]);
  };

  const openNewTerm = () => {
    if (!activeYearId) { Alert.alert('Select a year first'); return; }
    setEditingTerm(null);
    setTermName('');
    setTermStart('');
    setTermEnd('');
    setTermModalOpen(true);
  };

  const openEditTerm = (t: Term) => {
    setEditingTerm(t);
    setTermName(t.name);
    setTermStart(t.startDate);
    setTermEnd(t.endDate);
    setTermModalOpen(true);
  };

  const saveTerm = async () => {
    if (!activeYearId) { Alert.alert('Select a year first'); return; }
    if (!termName.trim() || !termStart.trim() || !termEnd.trim()) { Alert.alert('Validation', 'Name, start and end dates are required'); return; }
    const payload = { academicYearId: activeYearId, name: termName.trim(), startDate: termStart.trim(), endDate: termEnd.trim() } as Omit<Term, 'id'>;
    try {
      if (editingTerm) await updateTerm(editingTerm.id, payload);
      else await createTerm(payload);
      setTermModalOpen(false);
      const t = await listTerms(activeYearId);
      setTerms(t);
    } catch (e: any) {
      Alert.alert('Failed', e?.message || 'Could not save term');
    }
  };

  const removeTerm = (t: Term) => {
    Alert.alert('Delete term', `Delete ${t.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteTerm(t.id); if (activeYearId) { const nt = await listTerms(activeYearId); setTerms(nt); } } }
    ]);
  };

  const yearsSorted = useMemo(() => years.slice().sort((a, b) => (a.startDate > b.startDate ? -1 : 1)), [years]);

  return (
    !allowed || roleLoading ? null : (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Academic Year & Terms</Text>
      <Text style={styles.subtitle}>Manage academic years and their terms</Text>

      {/* Years row */}
      <View style={styles.rowHeader}>
        <Text style={styles.sectionTitle}>Years</Text>
        <TouchableOpacity onPress={openNewYear} style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>New Year</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={yearsSorted}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={async () => { setActiveYearId(item.id); const t = await listTerms(item.id); setTerms(t); }} style={[styles.card, activeYearId === item.id && styles.cardActive]}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>From {item.startDate} to {item.endDate} {item.isActive ? '• Active' : ''}</Text>
            </View>
            <TouchableOpacity onPress={() => openEditYear(item)} style={styles.iconBtn}><Ionicons name="create-outline" size={20} color="#1E90FF" /></TouchableOpacity>
            <TouchableOpacity onPress={() => removeYear(item)} style={styles.iconBtn}><Ionicons name="trash-outline" size={20} color="#D11A2A" /></TouchableOpacity>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading ? (<Text style={{ color: '#666' }}>No academic years yet.</Text>) : null}
      />

      {/* Terms row */}
      <View style={[styles.rowHeader, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>Terms {activeYearId ? '' : '(select a year)'}</Text>
        <TouchableOpacity onPress={openNewTerm} style={styles.addBtn}>
          <Ionicons name="add" size={20} color="#fff" />
          <Text style={styles.addBtnText}>New Term</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={terms}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <Text style={styles.cardMeta}>From {item.startDate} to {item.endDate}</Text>
            </View>
            <TouchableOpacity onPress={() => openEditTerm(item)} style={styles.iconBtn}><Ionicons name="create-outline" size={20} color="#1E90FF" /></TouchableOpacity>
            <TouchableOpacity onPress={() => removeTerm(item)} style={styles.iconBtn}><Ionicons name="trash-outline" size={20} color="#D11A2A" /></TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={activeYearId && !loading ? (<Text style={{ color: '#666' }}>No terms yet.</Text>) : null}
      />

      {/* Year Modal */}
      <Modal visible={yearModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingYear ? 'Edit Academic Year' : 'New Academic Year'}</Text>
            <TextInput value={yearName} onChangeText={setYearName} placeholder="Year name (e.g., 2025/2026)" style={styles.input} />
            <TextInput value={yearStart} onChangeText={setYearStart} placeholder="Start date (YYYY-MM-DD)" style={styles.input} />
            <TextInput value={yearEnd} onChangeText={setYearEnd} placeholder="End date (YYYY-MM-DD)" style={styles.input} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setYearModalOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveYear} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Term Modal */}
      <Modal visible={termModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingTerm ? 'Edit Term' : 'New Term'}</Text>
            <TextInput value={termName} onChangeText={setTermName} placeholder="Term name (e.g., Term 1)" style={styles.input} />
            <TextInput value={termStart} onChangeText={setTermStart} placeholder="Start date (YYYY-MM-DD)" style={styles.input} />
            <TextInput value={termEnd} onChangeText={setTermEnd} placeholder="End date (YYYY-MM-DD)" style={styles.input} />
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setTermModalOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveTerm} style={[styles.btn, styles.btnPrimary]}>
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
  rowHeader: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#333' },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1E90FF', paddingHorizontal: 12, height: 36, borderRadius: 8 },
  addBtnText: { color: '#fff', marginLeft: 6, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#eee', flexDirection: 'row', alignItems: 'center' },
  cardActive: { borderColor: '#1E90FF', backgroundColor: '#EAF4FF' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#222' },
  cardMeta: { color: '#666', marginTop: 2 },
  iconBtn: { padding: 8, marginLeft: 8 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 16 },
  modalCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, paddingHorizontal: 10, height: 42, marginTop: 8 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12 },
  btn: { height: 42, paddingHorizontal: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  btnGhost: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd' },
  btnGhostText: { color: '#333' },
  btnPrimary: { backgroundColor: '#1E90FF' },
  btnPrimaryText: { color: '#fff', fontWeight: '600' },
});
