import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { listClasses, createClass, updateClass, deleteClass } from '@/lib/classes';
import { listSubjects, createSubject, updateSubject, deleteSubject } from '@/lib/subjects';
import { getAllUsers } from '@/lib/auth';
import { useRequireRole } from '@/lib/access';
import { useTheme } from '@/contexts/ThemeContext';
import type { SchoolClass, Subject, UserProfile } from '@/lib/types';

interface TeacherWithAssignments {
  teacher: UserProfile;
  assignedClasses: SchoolClass[];
  assignedSubjects: Subject[];
}

export default function SchoolDataScreen() {
  const { allowed, loading: roleLoading } = useRequireRole('admin');
  const { colors } = useTheme();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [teachersWithAssignments, setTeachersWithAssignments] = useState<TeacherWithAssignments[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'teachers' | 'classes' | 'subjects'>('teachers');

  // Class modal state
  const [classModalOpen, setClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [className, setClassName] = useState('');
  const [classDesc, setClassDesc] = useState('');
  const [classTeacherId, setClassTeacherId] = useState<string | undefined>(undefined);

  // Subject modal state
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [subjectName, setSubjectName] = useState('');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [subjectTeachersAssigned, setSubjectTeachersAssigned] = useState<string[]>([]);

  async function load() {
    setLoading(true);
    try {
      const [cls, subs, users] = await Promise.all([
        listClasses(),
        listSubjects(),
        getAllUsers(),
      ]);
      
      setClasses(cls);
      setSubjects(subs);
      const teacherUsers = users.filter(u => u.role === 'teacher' || u.role === 'headteacher');
      setTeachers(teacherUsers);
      
      // Create teacher assignments
      const assignments: TeacherWithAssignments[] = teacherUsers.map(teacher => ({
        teacher,
        assignedClasses: cls.filter(c => c.teacherId === teacher.uid),
        assignedSubjects: subs.filter(s => s.teachersAssigned?.includes(teacher.uid))
      }));
      
      setTeachersWithAssignments(assignments);
    } catch (error) {
      console.error('Error loading school data:', error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { if (allowed) { load(); } }, [allowed]);

  // Create/Edit Class
  const openNewClass = () => {
    setEditingClass(null);
    setClassName('');
    setClassDesc('');
    setClassTeacherId(undefined);
    setClassModalOpen(true);
  };
  const openEditClass = (c: SchoolClass) => {
    setEditingClass(c);
    setClassName(c.name);
    setClassDesc(c.description || '');
    setClassTeacherId(c.teacherId);
    setClassModalOpen(true);
  };
  const saveClass = async () => {
    try {
      const name = className.trim();
      if (!name) { Alert.alert('Validation', 'Class name is required'); return; }
      const desc = classDesc.trim();
      const payload: Partial<SchoolClass> & { name: string } = { name };
      if (desc) payload.description = desc;
      if (classTeacherId) payload.teacherId = classTeacherId;
      if (editingClass) {
        await updateClass(editingClass.id, payload as Omit<SchoolClass, 'id'>);
      } else {
        await createClass(payload as Omit<SchoolClass, 'id'>);
      }
      setClassModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    }
  };
  const removeClass = (c: SchoolClass) => {
    Alert.alert('Delete class', `Delete ${c.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteClass(c.id); await load(); } }
    ]);
  };

  // Create/Edit Subject
  const openNewSubject = () => {
    setEditingSubject(null);
    setSubjectName('');
    setSubjectDesc('');
    setSubjectTeachersAssigned([]);
    setSubjectModalOpen(true);
  };
  const openEditSubject = (s: Subject) => {
    setEditingSubject(s);
    setSubjectName(s.name);
    setSubjectDesc(s.description || '');
    setSubjectTeachersAssigned(s.teachersAssigned || []);
    setSubjectModalOpen(true);
  };
  const saveSubject = async () => {
    try {
      const name = subjectName.trim();
      if (!name) { Alert.alert('Validation', 'Subject name is required'); return; }
      const desc = subjectDesc.trim();
      const payload: Partial<Subject> & { name: string } = { name };
      if (desc) payload.description = desc;
      // Use null only when explicitly desired; omit field if empty
      if (subjectTeachersAssigned.length) payload.teachersAssigned = subjectTeachersAssigned;
      if (editingSubject) {
        await updateSubject(editingSubject.id, payload as Omit<Subject, 'id'>);
      } else {
        await createSubject(payload as Omit<Subject, 'id'>);
      }
      setSubjectModalOpen(false);
      await load();
    } catch (e: any) {
      Alert.alert('Save failed', e.message || 'Please try again');
    }
  };
  const removeSubject = (s: Subject) => {
    Alert.alert('Delete subject', `Delete ${s.name}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await deleteSubject(s.id); await load(); } }
    ]);
  };

  // Assignment helpers
  const toggleTeacherAssigned = (teacherId: string) => {
    setSubjectTeachersAssigned(prev => prev.includes(teacherId) ? prev.filter(id => id !== teacherId) : [...prev, teacherId]);
  };

  // Render Teacher Card Component
  const renderTeacherCard = ({ item }: { item: TeacherWithAssignments }) => (
    <View style={[styles.teacherCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
      {/* Teacher Header */}
      <View style={styles.teacherHeader}>
        <View style={[styles.teacherAvatar, { backgroundColor: colors.primaryBlue + '20' }]}>
          <Ionicons name="person" size={24} color={colors.primaryBlue} />
        </View>
        <View style={styles.teacherInfo}>
          <Text style={[styles.teacherName, { color: colors.text }]}>{item.teacher.name || 'Unnamed Teacher'}</Text>
          <Text style={[styles.teacherEmail, { color: colors.text }]}>{item.teacher.email}</Text>
          <Text style={[styles.teacherRole, { color: colors.primaryBlue }]}>
            {item.teacher.role === 'headteacher' ? 'Head Teacher' : 'Teacher'}
          </Text>
        </View>
      </View>

      {/* Assigned Classes */}
      <View style={styles.assignmentSection}>
        <View style={styles.assignmentHeader}>
          <Ionicons name="school-outline" size={16} color={colors.primaryBlue} />
          <Text style={[styles.assignmentTitle, { color: colors.text }]}>Classes ({item.assignedClasses.length})</Text>
        </View>
        {item.assignedClasses.length > 0 ? (
          <View style={styles.chipContainer}>
            {item.assignedClasses.map(cls => (
              <View key={cls.id} style={[styles.assignmentChip, { backgroundColor: colors.primaryBlue + '15', borderColor: colors.primaryBlue + '30' }]}>
                <Text style={[styles.chipText, { color: colors.primaryBlue }]}>{cls.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.noAssignments, { color: colors.text }]}>No classes assigned</Text>
        )}
      </View>

      {/* Assigned Subjects */}
      <View style={styles.assignmentSection}>
        <View style={styles.assignmentHeader}>
          <Ionicons name="book-outline" size={16} color={colors.primaryBlue} />
          <Text style={[styles.assignmentTitle, { color: colors.text }]}>Subjects ({item.assignedSubjects.length})</Text>
        </View>
        {item.assignedSubjects.length > 0 ? (
          <View style={styles.chipContainer}>
            {item.assignedSubjects.map(subject => (
              <View key={subject.id} style={[styles.assignmentChip, { backgroundColor: '#10B981' + '15', borderColor: '#10B981' + '30' }]}>
                <Text style={[styles.chipText, { color: '#10B981' }]}>{subject.name}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[styles.noAssignments, { color: colors.text }]}>No subjects assigned</Text>
        )}
      </View>

      {/* Stats */}
      <View style={styles.teacherStats}>
        <View style={[styles.statItem, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: colors.primaryBlue }]}>{item.assignedClasses.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Classes</Text>
        </View>
        <View style={[styles.statItem, { backgroundColor: colors.background }]}>
          <Text style={[styles.statNumber, { color: '#10B981' }]}>{item.assignedSubjects.length}</Text>
          <Text style={[styles.statLabel, { color: colors.text }]}>Subjects</Text>
        </View>
      </View>
    </View>
  );

  return (
    !allowed || roleLoading ? null : (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.text }]}>School Data Management</Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>Teachers, Classes & Subjects</Text>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabContainer, { backgroundColor: colors.cardBackground, borderBottomColor: colors.border }]}>
        {[
          { key: 'teachers', label: 'Teachers', icon: 'people-outline' },
          { key: 'classes', label: 'Classes', icon: 'school-outline' },
          { key: 'subjects', label: 'Subjects', icon: 'book-outline' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && { backgroundColor: colors.primaryBlue + '15', borderBottomColor: colors.primaryBlue }
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <Ionicons 
              name={tab.icon as any} 
              size={20} 
              color={activeTab === tab.key ? colors.primaryBlue : colors.icon} 
            />
            <Text style={[
              styles.tabText,
              { color: activeTab === tab.key ? colors.primaryBlue : colors.text }
            ]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primaryBlue} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading school data...</Text>
        </View>
      ) : (
        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 100 }}>
          {activeTab === 'teachers' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Teaching Staff</Text>
                <Text style={[styles.sectionCount, { color: colors.text }]}>
                  {teachersWithAssignments.length} {teachersWithAssignments.length === 1 ? 'Teacher' : 'Teachers'}
                </Text>
              </View>
              
              {teachersWithAssignments.length > 0 ? (
                <FlatList
                  data={teachersWithAssignments}
                  keyExtractor={(item) => item.teacher.uid}
                  renderItem={renderTeacherCard}
                  scrollEnabled={false}
                  ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={[styles.emptyState, { backgroundColor: colors.cardBackground }]}>
                  <Ionicons name="people-outline" size={48} color={colors.icon} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No Teachers Found</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.text }]}>Add teachers to see their assignments here</Text>
                </View>
              )}
            </View>
          )}

          {activeTab === 'classes' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Classes</Text>
                <TouchableOpacity onPress={openNewClass} style={[styles.addBtn, { backgroundColor: colors.primaryBlue }]}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>New Class</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={classes}
                keyExtractor={(i) => i.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => (
                  <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                      {!!item.description && <Text style={[styles.cardMeta, { color: colors.text }]}>{item.description}</Text>}
                      {!!item.teacherId && <Text style={[styles.cardMeta, { color: colors.text }]}>Teacher: {teachers.find(t => t.uid === item.teacherId)?.name || item.teacherId}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => openEditClass(item)} style={styles.iconBtn}>
                      <Ionicons name="create-outline" size={20} color={colors.primaryBlue} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeClass(item)} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={!loading ? (<Text style={[styles.emptyText, { color: colors.text }]}>No classes yet.</Text>) : null}
              />
            </View>
          )}

          {activeTab === 'subjects' && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Subjects</Text>
                <TouchableOpacity onPress={openNewSubject} style={[styles.addBtn, { backgroundColor: colors.primaryBlue }]}>
                  <Ionicons name="add" size={20} color="#fff" />
                  <Text style={styles.addBtnText}>New Subject</Text>
                </TouchableOpacity>
              </View>
              <FlatList
                data={subjects}
                keyExtractor={(i) => i.id}
                scrollEnabled={false}
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({ item }) => (
                  <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.name}</Text>
                      {!!item.description && <Text style={[styles.cardMeta, { color: colors.text }]}>{item.description}</Text>}
                      {!!item.teachersAssigned?.length && <Text style={[styles.cardMeta, { color: colors.text }]}>Teachers: {item.teachersAssigned.map(id => teachers.find(t => t.uid === id)?.name || id).join(', ')}</Text>}
                    </View>
                    <TouchableOpacity onPress={() => openEditSubject(item)} style={styles.iconBtn}>
                      <Ionicons name="create-outline" size={20} color={colors.primaryBlue} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeSubject(item)} style={styles.iconBtn}>
                      <Ionicons name="trash-outline" size={20} color={colors.danger} />
                    </TouchableOpacity>
                  </View>
                )}
                ListEmptyComponent={!loading ? (<Text style={[styles.emptyText, { color: colors.text }]}>No subjects yet.</Text>) : null}
              />
            </View>
          )}
        </ScrollView>
      )}

      {/* Class Modal */}
      <Modal visible={classModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingClass ? 'Edit Class' : 'New Class'}</Text>
            <TextInput value={className} onChangeText={setClassName} placeholder="Class name" style={styles.input} />
            <TextInput value={classDesc} onChangeText={setClassDesc} placeholder="Description (optional)" style={styles.input} />
            <Text style={styles.label}>Assign Teacher</Text>
            <View style={styles.chipsRow}>
              {teachers.map(t => (
                <Pressable key={t.uid} onPress={() => setClassTeacherId(classTeacherId === t.uid ? undefined : t.uid)} style={[styles.chip, classTeacherId === t.uid && styles.chipActive]}>
                  <Text style={[styles.chipText, classTeacherId === t.uid && styles.chipTextActive]}>{t.name || t.email}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setClassModalOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveClass} style={[styles.btn, styles.btnPrimary]}>
                <Text style={styles.btnPrimaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Subject Modal */}
      <Modal visible={subjectModalOpen} animationType="slide" transparent>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{editingSubject ? 'Edit Subject' : 'New Subject'}</Text>
            <TextInput value={subjectName} onChangeText={setSubjectName} placeholder="Subject name" style={styles.input} />
            <TextInput value={subjectDesc} onChangeText={setSubjectDesc} placeholder="Description (optional)" style={styles.input} />
            <Text style={styles.label}>Assign Teachers</Text>
            <View style={styles.chipsRow}>
              {teachers.map(t => {
                const active = subjectTeachersAssigned.includes(t.uid);
                return (
                  <Pressable key={t.uid} onPress={() => toggleTeacherAssigned(t.uid)} style={[styles.chip, active && styles.chipActive]}>
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{t.name || t.email}</Text>
                  </Pressable>
                );
              })}
            </View>
            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setSubjectModalOpen(false)} style={[styles.btn, styles.btnGhost]}>
                <Text style={styles.btnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveSubject} style={[styles.btn, styles.btnPrimary]}>
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
  container: { 
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: { 
    fontSize: 16,
    opacity: 0.8,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  section: { 
    padding: 20,
  },
  sectionHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 16,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '700',
  },
  sectionCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  // Teacher Card Styles
  teacherCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  teacherAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  teacherEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  teacherRole: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  assignmentSection: {
    marginBottom: 16,
  },
  assignmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  assignmentTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  assignmentChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
    marginBottom: 6,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  noAssignments: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.6,
    marginLeft: 22,
  },
  teacherStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
    marginTop: 20,
  },
  // Existing styles for classes/subjects
  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    height: 40, 
    borderRadius: 10,
  },
  addBtnText: { 
    color: '#fff', 
    marginLeft: 6, 
    fontWeight: '600',
  },
  card: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderRadius: 12, 
    padding: 16, 
    borderWidth: 1,
    marginBottom: 8,
  },
  cardTitle: { 
    fontSize: 16, 
    fontWeight: '600',
  },
  cardMeta: { 
    opacity: 0.7, 
    marginTop: 4,
    fontSize: 14,
  },
  iconBtn: { 
    padding: 8, 
    marginLeft: 8,
  },
  // Modal styles
  modalBackdrop: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.5)', 
    justifyContent: 'center', 
    padding: 20,
  },
  modalCard: { 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 20,
  },
  modalTitle: { 
    fontSize: 20, 
    fontWeight: '700', 
    marginBottom: 16,
  },
  input: { 
    backgroundColor: '#f8fafc', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    paddingHorizontal: 16, 
    height: 48, 
    marginTop: 8,
    fontSize: 16,
  },
  label: { 
    marginTop: 16, 
    marginBottom: 8, 
    fontWeight: '600', 
    fontSize: 16,
  },
  chipsRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
  },
  chip: { 
    paddingHorizontal: 12, 
    paddingVertical: 8, 
    backgroundColor: '#f8fafc', 
    borderWidth: 1, 
    borderColor: '#e5e7eb', 
    borderRadius: 20, 
    marginRight: 8, 
    marginBottom: 8,
  },
  chipActive: { 
    borderColor: '#1E90FF', 
    backgroundColor: '#EAF4FF',
  },
  chipTextActive: { 
    color: '#1E90FF', 
    fontWeight: '600',
  },
  modalActions: { 
    flexDirection: 'row', 
    justifyContent: 'flex-end', 
    marginTop: 20,
  },
  btn: { 
    height: 48, 
    paddingHorizontal: 20, 
    borderRadius: 12, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginLeft: 12,
  },
  btnGhost: { 
    backgroundColor: '#f8fafc', 
    borderWidth: 1, 
    borderColor: '#e5e7eb',
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
    fontWeight: '600', 
    fontSize: 16,
  },
});
