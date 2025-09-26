import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput } from 'react-native';
import { useAuth, getAllUsers } from '../../lib/auth';
import { getAllAcademicYears, getAllClasses, getAllTerms, SchoolClass, AcademicYear, Term } from '../../lib/schoolData';
import { getAllSubjects, Subject } from '../../lib/subjects';
import { getFilteredLessonPlans, updateLessonPlan, UpdateLessonPlanData } from '../../lib/lessonPlans';
import { LessonPlan, LessonActivity, UserProfile } from '../../lib/types';

const LESSON_ACTIVITY_TYPES = ['introduction', 'presentation', 'practice', 'assessment', 'conclusion'];

export default function HeadteacherViewLessonPlansScreen() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allTeachers, setAllTeachers] = useState<UserProfile[]>([]);
  const [allAcademicYears, setAllAcademicYears] = useState<AcademicYear[]>([]);
  const [allTerms, setAllTerms] = useState<Term[]>([]);

  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | undefined>(undefined);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>(undefined);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | undefined>(undefined);
  const [selectedTermId, setSelectedTermId] = useState<string | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<LessonPlan['status'] | undefined>(undefined);

  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedLessonPlan, setSelectedLessonPlan] = useState<LessonPlan | null>(null);
  const [feedback, setFeedback] = useState('');
  const [statusForReview, setStatusForReview] = useState<LessonPlan['status'] | undefined>(undefined);

  const fetchData = useCallback(async () => {
    if (!user?.uid || authLoading) return;
    setLoading(true);
    try {
      const [plans, classes, subjects, teachers, academicYears, terms] = await Promise.all([
        getFilteredLessonPlans({
          classId: selectedClassId,
          subjectId: selectedSubjectId,
          teacherId: selectedTeacherId,
          academicYearId: selectedAcademicYearId,
          termId: selectedTermId,
          status: selectedStatus,
        }),
        getAllClasses(),
        getAllSubjects(),
        getAllUsers(['teacher']),
        getAllAcademicYears(),
        getAllTerms(),
      ]);
      setLessonPlans(plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setAllClasses(classes);
      setAllSubjects(subjects);
      setAllTeachers(teachers);
      setAllAcademicYears(academicYears);
      setAllTerms(terms);
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', 'Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, authLoading, selectedClassId, selectedSubjectId, selectedTeacherId, selectedAcademicYearId, selectedTermId, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getClassName = (id: string) => allClasses.find(c => c.id === id)?.name || 'N/A';
  const getSubjectName = (id: string) => allSubjects.find(s => s.id === id)?.name || 'N/A';
  const getTeacherName = (id: string) => allTeachers.find(t => t.uid === id)?.name || 'N/A';
  const getAcademicYearName = (id: string) => allAcademicYears.find(y => y.id === id)?.name || 'N/A';
  const getTermName = (id: string) => allTerms.find(t => t.id === id)?.name || 'N/A';

  const handleViewDetails = (plan: LessonPlan) => {
    setSelectedLessonPlan(plan);
    setFeedback(plan.feedback || '');
    setStatusForReview(plan.status);
    setIsDetailModalVisible(true);
  };

  const handleUpdateStatusAndFeedback = async () => {
    if (!selectedLessonPlan?.id || !statusForReview) {
      Alert.alert('Error', 'No lesson plan selected or status not set.');
      return;
    }
    if (!user?.uid) {
      Alert.alert('Error', 'Headteacher not authenticated.');
      return;
    }

    setLoading(true);
    try {
      const updates: UpdateLessonPlanData = {
        status: statusForReview,
        feedback: feedback.trim() === '' ? undefined : feedback,
        reviewedBy: user.uid,
        reviewedAt: new Date().toISOString(),
      };
      await updateLessonPlan(selectedLessonPlan.id, updates);
      Alert.alert('Success', 'Lesson Plan reviewed successfully!');
      setIsDetailModalVisible(false);
      await fetchData(); // Refresh data
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', 'Failed to update lesson plan status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading lesson plans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>View Lesson Plans</Text>
      </View>

      <ScrollView horizontal style={styles.filtersScroll}>
        <View style={styles.filterGroup}>
          <Text style={styles.label}>Class</Text>
          <Picker
            selectedValue={selectedClassId}
            onValueChange={(itemValue) => setSelectedClassId(itemValue as string | undefined)}
            style={styles.picker}
          >
            <Picker.Item label="All Classes" value={undefined} />
            {allClasses.map((cls) => (
              <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.label}>Subject</Text>
          <Picker
            selectedValue={selectedSubjectId}
            onValueChange={(itemValue) => setSelectedSubjectId(itemValue as string | undefined)}
            style={styles.picker}
          >
            <Picker.Item label="All Subjects" value={undefined} />
            {allSubjects.map((sub) => (
              <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.label}>Teacher</Text>
          <Picker
            selectedValue={selectedTeacherId}
            onValueChange={(itemValue) => setSelectedTeacherId(itemValue as string | undefined)}
            style={styles.picker}
          >
            <Picker.Item label="All Teachers" value={undefined} />
            {allTeachers.map((teacher) => (
              <Picker.Item key={teacher.uid} label={teacher.name || teacher.email || 'Unknown'} value={teacher.uid} />
            ))}
          </Picker>
        </View>

        <View style={styles.filterGroup}>
          <Text style={styles.label}>Status</Text>
          <Picker
            selectedValue={selectedStatus}
            onValueChange={(itemValue) => setSelectedStatus(itemValue as LessonPlan['status'] | undefined)}
            style={styles.picker}
          >
            <Picker.Item label="All Statuses" value={undefined} />
            <Picker.Item label="Draft" value="draft" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Reviewed" value="reviewed" />
          </Picker>
        </View>
      </ScrollView>

      <FlatList
        data={lessonPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.lessonPlanCard}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDetail}>Teacher: {getTeacherName(item.teacherId)}</Text>
            <Text style={styles.cardDetail}>Class: {getClassName(item.classId)}</Text>
            <Text style={styles.cardDetail}>Subject: {getSubjectName(item.subjectId)}</Text>
            <Text style={styles.cardDetail}>Date: {item.date}</Text>
            <Text style={styles.cardDetail}>Status: <Text style={{ fontWeight: 'bold', color: item.status === 'reviewed' ? 'green' : item.status === 'draft' ? 'orange' : 'blue' }}>{item.status.toUpperCase()}</Text></Text>
            {item.reviewedBy && <Text style={styles.cardDetail}>Reviewed By: {getTeacherName(item.reviewedBy)}</Text>}
            {item.feedback && <Text style={styles.cardDetail}>Feedback: {item.feedback}</Text>}
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleViewDetails(item)} style={[styles.actionButton, styles.viewButton]}>
                <Ionicons name="eye-outline" size={20} color="#1E90FF" />
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lesson plans found matching filters.</Text>
          </View>
        }
      />

      <Modal
        visible={isDetailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsDetailModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{selectedLessonPlan?.title}</Text>
            <TouchableOpacity onPress={() => setIsDetailModalVisible(false)}>
              <Ionicons name="close-circle-outline" size={30} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            {selectedLessonPlan && (
              <>
                <Text style={styles.detailLabel}>Class: <Text style={styles.detailText}>{getClassName(selectedLessonPlan.classId)}</Text></Text>
                <Text style={styles.detailLabel}>Subject: <Text style={styles.detailText}>{getSubjectName(selectedLessonPlan.subjectId)}</Text></Text>
                <Text style={styles.detailLabel}>Teacher: <Text style={styles.detailText}>{getTeacherName(selectedLessonPlan.teacherId)}</Text></Text>
                <Text style={styles.detailLabel}>Date: <Text style={styles.detailText}>{selectedLessonPlan.date}</Text></Text>
                <Text style={styles.detailLabel}>Duration: <Text style={styles.detailText}>{selectedLessonPlan.duration} minutes</Text></Text>
                <Text style={styles.detailLabel}>Status: <Text style={styles.detailText}>{selectedLessonPlan.status.toUpperCase()}</Text></Text>
                {selectedLessonPlan.reviewedBy && <Text style={styles.detailLabel}>Reviewed By: <Text style={styles.detailText}>{getTeacherName(selectedLessonPlan.reviewedBy)}</Text></Text>}
                {selectedLessonPlan.reviewedAt && <Text style={styles.detailLabel}>Reviewed At: <Text style={styles.detailText}>{new Date(selectedLessonPlan.reviewedAt).toLocaleString()}</Text></Text>}

                <Text style={styles.sectionTitleModal}>Objectives</Text>
                {selectedLessonPlan.objectives.map((obj, index) => (
                  <Text key={index} style={styles.listItem}>- {obj}</Text>
                ))}

                <Text style={styles.sectionTitleModal}>Materials</Text>
                {selectedLessonPlan.materials.map((mat, index) => (
                  <Text key={index} style={styles.listItem}>- {mat}</Text>
                ))}

                <Text style={styles.sectionTitleModal}>Activities</Text>
                {selectedLessonPlan.activities.map((activity, index) => (
                  <View key={index} style={styles.activityDetailCard}>
                    <Text style={styles.activityDetailTitle}>{activity.order}. {activity.title} ({activity.duration} min)</Text>
                    <Text style={styles.activityDetailText}>Type: {activity.type}</Text>
                    <Text style={styles.activityDetailText}>{activity.description}</Text>
                  </View>
                ))}

                <Text style={styles.sectionTitleModal}>Assessment</Text>
                <Text style={styles.detailText}>{selectedLessonPlan.assessment}</Text>

                {selectedLessonPlan.homework && (
                  <>
                    <Text style={styles.sectionTitleModal}>Homework</Text>
                    <Text style={styles.detailText}>{selectedLessonPlan.homework}</Text>
                  </>
                )}

                {selectedLessonPlan.notes && (
                  <>
                    <Text style={styles.sectionTitleModal}>Notes</Text>
                    <Text style={styles.detailText}>{selectedLessonPlan.notes}</Text>
                  </>
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Review Status</Text>
                  <Picker
                    selectedValue={statusForReview}
                    onValueChange={(itemValue) => setStatusForReview(itemValue as LessonPlan['status'])}
                    style={styles.picker}
                  >
                    <Picker.Item label="Draft" value="draft" />
                    <Picker.Item label="Completed" value="completed" />
                    <Picker.Item label="Reviewed" value="reviewed" />
                  </Picker>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Feedback</Text>
                  <TextInput
                    style={[styles.input, { height: 100 }]}
                    value={feedback}
                    onChangeText={setFeedback}
                    placeholder="Provide feedback for the teacher..."
                    multiline
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleUpdateStatusAndFeedback}>
                  <Text style={styles.saveButtonText}>Submit Review</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 15,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
  },
  header: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  filtersScroll: {
    marginBottom: 15,
  },
  filterGroup: {
    marginRight: 15,
    width: 150, // Fixed width for each filter to make them consistent
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 5,
  },
  picker: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  lessonPlanCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  viewButton: {
    backgroundColor: '#e3f2fd',
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#1E90FF',
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#777',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    paddingTop: 50,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalBody: {
    padding: 15,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  detailText: {
    fontSize: 16,
    color: '#555',
    marginBottom: 5,
  },
  sectionTitleModal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E90FF',
    marginTop: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  listItem: {
    fontSize: 16,
    color: '#555',
    marginBottom: 3,
    marginLeft: 10,
  },
  activityDetailCard: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#1E90FF',
  },
  activityDetailTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  activityDetailText: {
    fontSize: 14,
    color: '#555',
  },
  formGroup: {
    marginBottom: 20,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#fff',
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
