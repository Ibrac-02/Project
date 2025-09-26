import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import { useAuth } from '../../lib/auth';
import { createLessonActivity, createLessonPlan, deleteLessonPlan, getLessonPlansByTeacher, getLessonPlanStats, updateLessonPlan} from '../../lib/lessonPlans';
import { getAllClasses } from '../../lib/schoolData';
import { getAllSubjects } from '../../lib/subjects';
import { LessonActivity, LessonPlan, Subject } from '../../lib/types';

const { width } = Dimensions.get('window');

export default function LessonPlanScreen() {
  const { user, userProfile } = useAuth();
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonPlan | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    classId: '',
    date: new Date().toISOString().split('T')[0],
    duration: 40,
    objectives: [''],
    materials: [''],
    activities: [] as LessonActivity[],
    assessment: '',
    homework: '',
    notes: '',
    status: 'draft' as 'draft' | 'completed' | 'reviewed',
  });

  const loadData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const [lessonPlansData, subjectsData, classesData, statsData] = await Promise.all([
        getLessonPlansByTeacher(user.uid),
        getAllSubjects(),
        getAllClasses(),
        getLessonPlanStats(user.uid),
      ]);
      
      setLessonPlans(lessonPlansData);
      setSubjects(subjectsData);
      setClasses(classesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load lesson plans');
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const resetForm = () => {
    setFormData({
      title: '',
      subjectId: '',
      classId: '',
      date: new Date().toISOString().split('T')[0],
      duration: 40,
      objectives: [''],
      materials: [''],
      activities: [],
      assessment: '',
      homework: '',
      notes: '',
      status: 'draft',
    });
    setEditingLesson(null);
  };

  const handleCreateLesson = async () => {
    if (!user?.uid) return;
    
    try {
      const lessonData = {
        ...formData,
        teacherId: user.uid,
        activities: formData.activities.filter(activity => activity.title.trim() !== ''),
      };

      if (editingLesson) {
        await updateLessonPlan(editingLesson.id, lessonData);
        Alert.alert('Success', 'Lesson plan updated successfully');
      } else {
        await createLessonPlan(lessonData);
        Alert.alert('Success', 'Lesson plan created successfully');
      }

      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving lesson plan:', error);
      Alert.alert('Error', 'Failed to save lesson plan');
    }
  };
 
  const handleEditLesson = (lesson: LessonPlan) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      subjectId: lesson.subjectId,
      classId: lesson.classId,
      date: lesson.date,
      duration: lesson.duration,
      objectives: lesson.objectives.length > 0 ? lesson.objectives : [''],
      materials: lesson.materials.length > 0 ? lesson.materials : [''],
      activities: lesson.activities,
      assessment: lesson.assessment,
      homework: lesson.homework || '',
      notes: lesson.notes || '',
      status: lesson.status,
    });
    setShowCreateModal(true);
  };

  const handleDeleteLesson = (lessonId: string) => {
    Alert.alert(
      'Delete Lesson Plan',
      'Are you sure you want to delete this lesson plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteLessonPlan(lessonId);
              Alert.alert('Success', 'Lesson plan deleted successfully');
              loadData();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete lesson plan');
            }
          },
        },
      ]
    );
  };

  const addObjective = () => {
    setFormData(prev => ({
      ...prev,
      objectives: [...prev.objectives, ''],
    }));
  };

  const updateObjective = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => (i === index ? value : obj)),
    }));
  };

  const removeObjective = (index: number) => {
    setFormData(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index),
    }));
  };

  const addMaterial = () => {
    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, ''],
    }));
  };

  const updateMaterial = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.map((mat, i) => (i === index ? value : mat)),
    }));
  };

  const removeMaterial = (index: number) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  };

  const addActivity = () => {
    const newActivity = createLessonActivity('', '', 10, 'introduction', formData.activities.length + 1);
    setFormData(prev => ({
      ...prev,
      activities: [...prev.activities, newActivity],
    }));
  };

  const updateActivity = (index: number, field: keyof LessonActivity, value: any) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.map((activity, i) => 
        i === index ? { ...activity, [field]: value } : activity
      ),
    }));
  };

  const removeActivity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      activities: prev.activities.filter((_, i) => i !== index),
    }));
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || 'Unknown Subject';
  };

  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || 'Unknown Class';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#FFA500';
      case 'completed': return '#28a745';
      case 'reviewed': return '#007bff';
      default: return '#6c757d';
    }
  };

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
          <Ionicons name="calendar-outline" size={16} color="#666" /> {item.date}
        </Text>
        <Text style={styles.lessonText}>
          <Ionicons name="time-outline" size={16} color="#666" /> {item.duration} minutes
        </Text>
      </View>

      {item.feedback && (
        <View style={styles.feedbackContainer}>
          <Text style={styles.feedbackLabel}>Headteacher Feedback:</Text>
          <Text style={styles.feedbackText}>{item.feedback}</Text>
        </View>
      )}

      <View style={styles.lessonActions}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => handleEditLesson(item)}
        >
          <Ionicons name="create-outline" size={20} color="#1E90FF" />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#dc3545' }]} 
          onPress={() => handleDeleteLesson(item.id)}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
          <Text style={[styles.actionText, { color: '#fff' }]}>Delete</Text>
        </TouchableOpacity>
      </View>
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton} hitSlop={{ top: 3, bottom: 3, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lesson Plans</Text>
        </View>
        <TouchableOpacity 
          style={styles.createButton} 
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.draft}</Text>
            <Text style={styles.statLabel}>Draft</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.reviewed}</Text>
            <Text style={styles.statLabel}>Reviewed</Text>
          </View>
        </View>
      )}

      <FlatList
        data={lessonPlans}
        renderItem={renderLessonPlan}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Create/Edit Modal */}
      <Modal visible={showCreateModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingLesson ? 'Edit Lesson Plan' : 'Create Lesson Plan'}
            </Text>
            <TouchableOpacity onPress={() => { setShowCreateModal(false); resetForm(); }}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.inputLabel}>Lesson Title *</Text>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              placeholder="Enter lesson title"
            />

            <Text style={styles.inputLabel}>Subject *</Text>
            <View style={styles.pickerContainer}>
              {subjects.map(subject => (
                <TouchableOpacity
                  key={subject.id}
                  style={[
                    styles.pickerOption,
                    formData.subjectId === subject.id && styles.pickerOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, subjectId: subject.id }))}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    formData.subjectId === subject.id && styles.pickerOptionTextSelected
                  ]}>
                    {subject.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Class *</Text>
            <View style={styles.pickerContainer}>
              {classes.map(cls => (
                <TouchableOpacity
                  key={cls.id}
                  style={[
                    styles.pickerOption,
                    formData.classId === cls.id && styles.pickerOptionSelected
                  ]}
                  onPress={() => setFormData(prev => ({ ...prev, classId: cls.id }))}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    formData.classId === cls.id && styles.pickerOptionTextSelected
                  ]}>
                    {cls.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Date *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.date}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, date: text }))}
                  placeholder="YYYY-MM-DD"
                />
              </View>
              <View style={styles.halfWidth}>
                <Text style={styles.inputLabel}>Duration (minutes) *</Text>
                <TextInput
                  style={styles.textInput}
                  value={formData.duration.toString()}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, duration: parseInt(text) || 40 }))}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Learning Objectives</Text>
            {formData.objectives.map((objective, index) => (
              <View key={index} style={styles.arrayItem}>
                <TextInput
                  style={styles.textInput}
                  value={objective}
                  onChangeText={(text) => updateObjective(index, text)}
                  placeholder={`Objective ${index + 1}`}
                />
                <TouchableOpacity onPress={() => removeObjective(index)}>
                  <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addObjective}>
              <Ionicons name="add-circle-outline" size={20} color="#1E90FF" />
              <Text style={styles.addButtonText}>Add Objective</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Materials</Text>
            {formData.materials.map((material, index) => (
              <View key={index} style={styles.arrayItem}>
                <TextInput
                  style={styles.textInput}
                  value={material}
                  onChangeText={(text) => updateMaterial(index, text)}
                  placeholder={`Material ${index + 1}`}
                />
                <TouchableOpacity onPress={() => removeMaterial(index)}>
                  <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addMaterial}>
              <Ionicons name="add-circle-outline" size={20} color="#1E90FF" />
              <Text style={styles.addButtonText}>Add Material</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Activities</Text>
            {formData.activities.map((activity, index) => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityTitle}>Activity {index + 1}</Text>
                  <TouchableOpacity onPress={() => removeActivity(index)}>
                    <Ionicons name="trash-outline" size={20} color="#dc3545" />
                  </TouchableOpacity>
                </View>
                
                <TextInput
                  style={styles.textInput}
                  value={activity.title}
                  onChangeText={(text) => updateActivity(index, 'title', text)}
                  placeholder="Activity title"
                />
                
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  value={activity.description}
                  onChangeText={(text) => updateActivity(index, 'description', text)}
                  placeholder="Activity description"
                  multiline
                  numberOfLines={3}
                />
                
                <View style={styles.row}>
                  <View style={styles.halfWidth}>
                    <Text style={styles.inputLabel}>Duration (min)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={activity.duration.toString()}
                      onChangeText={(text) => updateActivity(index, 'duration', parseInt(text) || 10)}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={styles.halfWidth}>
                    <Text style={styles.inputLabel}>Type</Text>
                    <View style={styles.pickerContainer}>
                      {['introduction', 'presentation', 'practice', 'assessment', 'conclusion'].map(type => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.pickerOption,
                            activity.type === type && styles.pickerOptionSelected
                          ]}
                          onPress={() => updateActivity(index, 'type', type)}
                        >
                          <Text style={[
                            styles.pickerOptionText,
                            activity.type === type && styles.pickerOptionTextSelected
                          ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addButton} onPress={addActivity}>
              <Ionicons name="add-circle-outline" size={20} color="#1E90FF" />
              <Text style={styles.addButtonText}>Add Activity</Text>
            </TouchableOpacity>

            <Text style={styles.inputLabel}>Assessment Method</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.assessment}
              onChangeText={(text) => setFormData(prev => ({ ...prev, assessment: text }))}
              placeholder="How will you assess student learning?"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.inputLabel}>Homework (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.homework}
              onChangeText={(text) => setFormData(prev => ({ ...prev, homework: text }))}
              placeholder="Homework assignment"
              multiline
              numberOfLines={2}
            />

            <Text style={styles.inputLabel}>Additional Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.notes}
              onChangeText={(text) => setFormData(prev => ({ ...prev, notes: text }))}
              placeholder="Any additional notes"
              multiline
              numberOfLines={3}
            />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => { setShowCreateModal(false); resetForm(); }}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.saveButton} 
              onPress={handleCreateLesson}
              disabled={!formData.title || !formData.subjectId || !formData.classId}
            >
              <Text style={styles.saveButtonText}>
                {editingLesson ? 'Update' : 'Create'} Lesson Plan
              </Text>
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
    paddingTop: 6,
    marginBottom: 6,
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 500,
    color: '#fff',
    marginLeft: 8,
  },
  createButton: {
    backgroundColor: '#28a745',
    borderRadius: 20,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 10,
    padding: 15,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
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
  feedbackContainer: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  feedbackLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 5,
  },
  feedbackText: {
    fontSize: 14,
    color: '#333',
  },
  lessonActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    backgroundColor: '#f8f9fa',
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
    height: 80,
    textAlignVertical: 'top',
  },
  pickerContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  pickerOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  pickerOptionSelected: {
    backgroundColor: '#1E90FF',
    borderColor: '#1E90FF',
  },
  pickerOptionText: {
    fontSize: 14,
    color: '#666',
  },
  pickerOptionTextSelected: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  arrayItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 10,
  },
  addButtonText: {
    marginLeft: 5,
    color: '#1E90FF',
    fontSize: 16,
  },
  activityCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
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