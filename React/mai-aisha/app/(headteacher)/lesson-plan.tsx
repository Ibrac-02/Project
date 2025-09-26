import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { getAllUsers, useAuth } from '../../lib/auth';
import { getAllLessonPlans, reviewLessonPlan } from '../../lib/lessonPlans';
import { getAllClasses } from '../../lib/schoolData';
import { getAllSubjects } from '../../lib/subjects';
import { LessonPlan, Subject, UserProfile } from '../../lib/types';


export default function HeadteacherLessonPlansScreen() {
  const { user } = useAuth();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonPlan | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [filterTeacher, setFilterTeacher] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [lessonPlansData, subjectsData, classesData, teachersData] = await Promise.all([
        getAllLessonPlans(),
        getAllSubjects(),
        getAllClasses(),
        getAllUsers(),
      ]);
      
      setLessonPlans(lessonPlansData);
      setSubjects(subjectsData);
      setClasses(classesData);
      setTeachers(teachersData.filter(t => t.role === 'teacher'));
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || 'Unknown Class';
  };

  const getTeacherName = (teacherId: string) => {
    return teachers.find(t => t.uid === teacherId)?.name || 'Unknown Teacher';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#FFA500';
      case 'completed': return '#28a745';
      case 'reviewed': return '#007bff';
      default: return '#6c757d';
    }
  };

  const handleReviewLesson = (lesson: LessonPlan) => {
    setSelectedLesson(lesson);
    setReviewFeedback(lesson.feedback || '');
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedLesson || !user?.uid) return;

    try {
      await reviewLessonPlan(
        selectedLesson.id,
        user.uid,
        reviewFeedback,
        'reviewed'
      );
      
      Alert.alert('Success', 'Lesson plan reviewed successfully');
      setShowReviewModal(false);
      setSelectedLesson(null);
      setReviewFeedback('');
      loadData();
    } catch (error) {
      console.error('Error reviewing lesson plan:', error);
      Alert.alert('Error', 'Failed to review lesson plan');
    }
  };

  const filteredLessonPlans = lessonPlans.filter(lesson => {
    if (filterSubject && lesson.subjectId !== filterSubject) return false;
    if (filterClass && lesson.classId !== filterClass) return false;
    if (filterTeacher && lesson.teacherId !== filterTeacher) return false;
    if (filterStatus && lesson.status !== filterStatus) return false;
    return true;
  });

  const renderLessonPlan = ({ item }: { item: LessonPlan }) => (
    <View style={styles.lessonCard}>
      <View style={styles.lessonHeader}>
        <Text style={styles.lessonTitle}>{item.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.lessonInfo}>
        <Text style={styles.lessonText}>
          <Ionicons name="book-outline" size={16} color="#666" /> {getSubjectName(item.subjectId)}
        </Text>
        <Text style={styles.lessonText}>
          <Ionicons name="people-outline" size={16} color="#666" /> {getClassName(item.classId)}
        </Text>
        <Text style={styles.lessonText}>
          <Ionicons name="person-outline" size={16} color="#666" /> {getTeacherName(item.teacherId)}
        </Text>
        <Text style={styles.lessonText}>
          <Ionicons name="calendar-outline" size={16} color="#666" /> {item.date}
        </Text>
        <Text style={styles.lessonText}>
          <Ionicons name="time-outline" size={16} color="#666" /> {item.duration} minutes
        </Text>
      </View>

      {item.objectives.length > 0 && (
        <View style={styles.objectivesContainer}>
          <Text style={styles.objectivesTitle}>Learning Objectives:</Text>
          {item.objectives.map((objective, index) => (
            <Text key={index} style={styles.objectiveText}>• {objective}</Text>
          ))}
        </View>
      )}

      {item.feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>Previous Feedback:</Text>
          <Text style={styles.feedbackText}>{item.feedback}</Text>
        </View>
      )}

      <View style={styles.lessonActions}>
        <TouchableOpacity 
          style={styles.viewButton} 
          onPress={() => handleReviewLesson(item)}
        >
          <Ionicons name="eye-outline" size={20} color="#1E90FF" />
          <Text style={styles.actionText}>Review</Text>
        </TouchableOpacity>
        
        {item.status === 'draft' && (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: '#28a745' }]} 
            onPress={() => handleReviewLesson(item)}
          >
            <Ionicons name="checkmark-outline" size={20} color="#fff" />
            <Text style={[styles.actionText, { color: '#fff' }]}>Approve</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Subject:</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[styles.pickerOption, !filterSubject && styles.pickerOptionSelected]}
              onPress={() => setFilterSubject('')}
            >
              <Text style={[styles.pickerOptionText, !filterSubject && styles.pickerOptionTextSelected]}>
                All
              </Text>
            </TouchableOpacity>
            {subjects.map(subject => (
              <TouchableOpacity
                key={subject.id}
                style={[
                  styles.pickerOption,
                  filterSubject === subject.id && styles.pickerOptionSelected
                ]}
                onPress={() => setFilterSubject(subject.id)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  filterSubject === subject.id && styles.pickerOptionTextSelected
                ]}>
                  {subject.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Class:</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[styles.pickerOption, !filterClass && styles.pickerOptionSelected]}
              onPress={() => setFilterClass('')}
            >
              <Text style={[styles.pickerOptionText, !filterClass && styles.pickerOptionTextSelected]}>
                All
              </Text>
            </TouchableOpacity>
            {classes.map(cls => (
              <TouchableOpacity
                key={cls.id}
                style={[
                  styles.pickerOption,
                  filterClass === cls.id && styles.pickerOptionSelected
                ]}
                onPress={() => setFilterClass(cls.id)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  filterClass === cls.id && styles.pickerOptionTextSelected
                ]}>
                  {cls.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Teacher:</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[styles.pickerOption, !filterTeacher && styles.pickerOptionSelected]}
              onPress={() => setFilterTeacher('')}
            >
              <Text style={[styles.pickerOptionText, !filterTeacher && styles.pickerOptionTextSelected]}>
                All
              </Text>
            </TouchableOpacity>
            {teachers.map(teacher => (
              <TouchableOpacity
                key={teacher.uid}
                style={[
                  styles.pickerOption,
                  filterTeacher === teacher.uid && styles.pickerOptionSelected
                ]}
                onPress={() => setFilterTeacher(teacher.uid)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  filterTeacher === teacher.uid && styles.pickerOptionTextSelected
                ]}>
                  {teacher.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterRow}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.pickerContainer}>
            <TouchableOpacity
              style={[styles.pickerOption, !filterStatus && styles.pickerOptionSelected]}
              onPress={() => setFilterStatus('')}
            >
              <Text style={[styles.pickerOptionText, !filterStatus && styles.pickerOptionTextSelected]}>
                All
              </Text>
            </TouchableOpacity>
            {['draft', 'completed', 'reviewed'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.pickerOption,
                  filterStatus === status && styles.pickerOptionSelected
                ]}
                onPress={() => setFilterStatus(status)}
              >
                <Text style={[
                  styles.pickerOptionText,
                  filterStatus === status && styles.pickerOptionTextSelected
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading lesson plans...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lesson Plans Review</Text>
        </View>
      </View>

      {renderFilters()} 

      <FlatList
        data={filteredLessonPlans}
        renderItem={renderLessonPlan}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Review Modal */}
      <Modal visible={showReviewModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Review Lesson Plan</Text>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {selectedLesson && (
              <>
                <Text style={styles.lessonTitle}>{selectedLesson.title}</Text>
                <Text style={styles.lessonInfo}>
                  {getSubjectName(selectedLesson.subjectId)} • {getClassName(selectedLesson.classId)} • {getTeacherName(selectedLesson.teacherId)}
                </Text>
                <Text style={styles.lessonInfo}>
                  {selectedLesson.date} • {selectedLesson.duration} minutes
                </Text>

                {selectedLesson.objectives.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Learning Objectives:</Text>
                    {selectedLesson.objectives.map((objective, index) => (
                      <Text key={index} style={styles.objectiveText}>• {objective}</Text>
                    ))}
                  </View>
                )}

                {selectedLesson.materials.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Materials:</Text>
                    {selectedLesson.materials.map((material, index) => (
                      <Text key={index} style={styles.materialText}>• {material}</Text>
                    ))}
                  </View>
                )}

                {selectedLesson.activities.length > 0 && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activities:</Text>
                    {selectedLesson.activities.map((activity, index) => (
                      <View key={activity.id} style={styles.activityItem}>
                        <Text style={styles.activityTitle}>
                          {index + 1}. {activity.title} ({activity.type})
                        </Text>
                        <Text style={styles.activityDescription}>{activity.description}</Text>
                        <Text style={styles.activityDuration}>Duration: {activity.duration} minutes</Text>
                      </View>
                    ))}
                  </View>
                )}

                {selectedLesson.assessment && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Assessment:</Text>
                    <Text style={styles.assessmentText}>{selectedLesson.assessment}</Text>
                  </View>
                )}

                {selectedLesson.homework && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Homework:</Text>
                    <Text style={styles.homeworkText}>{selectedLesson.homework}</Text>
                  </View>
                )}

                {selectedLesson.notes && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Notes:</Text>
                    <Text style={styles.notesText}>{selectedLesson.notes}</Text>
                  </View>
                )}

                <Text style={styles.inputLabel}>Your Feedback *</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={reviewFeedback}
                  onChangeText={setReviewFeedback}
                  placeholder="Provide feedback on this lesson plan..."
                  multiline
                  numberOfLines={6}
                />
              </>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowReviewModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleSubmitReview}
              disabled={!reviewFeedback.trim()}
            >
              <Text style={styles.saveButtonText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
    backgroundColor: '#1E90FF',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  filtersContainer: {
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 10,
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  pickerOptionSelected: {
    backgroundColor: '#1E90FF',
    borderColor: '#1E90FF',
  },
  pickerOptionText: {
    fontSize: 12,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  listContainer: {
    padding: 20,
  },
  lessonCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lessonInfo: {
    marginBottom: 10,
  },
  lessonText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  objectivesContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  objectivesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  objectiveText: {
    fontSize: 13,
    color: '#555',
    marginBottom: 3,
  },
  feedbackContainer: {
    backgroundColor: '#fff3cd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: '#856404',
  },
  lessonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  actionText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#1E90FF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  materialText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 3,
  },
  activityItem: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  activityDescription: {
    fontSize: 13,
    color: '#555',
    marginBottom: 5,
  },
  activityDuration: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  assessmentText: {
    fontSize: 14,
    color: '#555',
  },
  homeworkText: {
    fontSize: 14,
    color: '#555',
  },
  notesText: {
    fontSize: 14,
    color: '#555',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    marginRight: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 10,
    borderRadius: 8,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
  },
});
