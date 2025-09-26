import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { getAllAcademicYears, getAllClasses, getAllTerms, SchoolClass, AcademicYear, Term } from '../../lib/schoolData';
import { getAllSubjects, Subject } from '../../lib/subjects';
import { createLessonPlan, getTeacherLessonPlans, updateLessonPlan, deleteLessonPlan, CreateLessonPlanData, UpdateLessonPlanData } from '../../lib/lessonPlans';
import { LessonPlan, LessonActivity } from '../../lib/types';

const LESSON_ACTIVITY_TYPES = ['introduction', 'presentation', 'practice', 'assessment', 'conclusion'];

export default function TeacherLessonPlansScreen() {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState<string | null>(null);
  const [lessonPlans, setLessonPlans] = useState<LessonPlan[]>([]);
  const [allClasses, setAllClasses] = useState<SchoolClass[]>([]);
  const [allSubjects, setAllSubjects] = useState<Subject[]>([]);
  const [allAcademicYears, setAllAcademicYears] = useState<AcademicYear[]>([]);
  const [allTerms, setAllTerms] = useState<Term[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingLessonPlan, setEditingLessonPlan] = useState<LessonPlan | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState<string | undefined>(undefined);
  const [formClassId, setFormClassId] = useState<string | undefined>(undefined);
  const [formDate, setFormDate] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formObjectives, setFormObjectives] = useState<string[]>(['']);
  const [formMaterials, setFormMaterials] = useState<string[]>(['']);
  const [formActivities, setFormActivities] = useState<Omit<LessonActivity, 'id'>[]>([]);
  const [formAssessment, setFormAssessment] = useState('');
  const [formHomework, setFormHomework] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const fetchData = useCallback(async () => {
    if (!user?.uid || authLoading) return;
    setLoading(true);
    try {
      const [plans, classes, subjects, academicYears, terms] = await Promise.all([
        getTeacherLessonPlans(user.uid),
        getAllClasses(),
        getAllSubjects(),
        getAllAcademicYears(),
        getAllTerms(),
      ]);
      setLessonPlans(plans.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setAllClasses(classes);
      setAllSubjects(subjects);
      setAllAcademicYears(academicYears);
      setAllTerms(terms);
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', 'Failed to fetch data: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, authLoading]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const resetForm = useCallback(() => {
    setEditingLessonPlan(null);
    setFormTitle('');
    setFormSubjectId(undefined);
    setFormClassId(undefined);
    setFormDate('');
    setFormDuration('');
    setFormObjectives(['']);
    setFormMaterials(['']);
    setFormActivities([]);
    setFormAssessment('');
    setFormHomework('');
    setFormNotes('');
  }, []);

  const handleAddLessonPlan = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const handleEditLessonPlan = (plan: LessonPlan) => {
    setEditingLessonPlan(plan);
    setFormTitle(plan.title);
    setFormSubjectId(plan.subjectId);
    setFormClassId(plan.classId);
    setFormDate(plan.date);
    setFormDuration(String(plan.duration));
    setFormObjectives(plan.objectives.length > 0 ? plan.objectives : ['']);
    setFormMaterials(plan.materials.length > 0 ? plan.materials : ['']);
    setFormActivities(plan.activities);
    setFormAssessment(plan.assessment);
    setFormHomework(plan.homework || '');
    setFormNotes(plan.notes || '');
    setIsModalVisible(true);
  };

  const handleSaveLessonPlan = async () => {
    if (!user?.uid) {
      Alert.alert('Error', 'User not authenticated.');
      return;
    }
    if (!formTitle || !formSubjectId || !formClassId || !formDate || !formDuration || formObjectives.some(o => !o) || formMaterials.some(m => !m) || !formAssessment) {
      Alert.alert('Validation Error', 'Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const baseData = {
        title: formTitle,
        subjectId: formSubjectId,
        classId: formClassId,
        teacherId: user.uid,
        date: formDate,
        duration: parseInt(formDuration),
        objectives: formObjectives.filter(o => o.trim() !== ''),
        materials: formMaterials.filter(m => m.trim() !== ''),
        activities: formActivities,
        assessment: formAssessment,
        homework: formHomework || undefined,
        notes: formNotes || undefined,
      };

      if (editingLessonPlan) {
        await updateLessonPlan(editingLessonPlan.id, baseData as UpdateLessonPlanData);
        Alert.alert('Success', 'Lesson Plan updated successfully!');
      } else {
        await createLessonPlan(baseData as CreateLessonPlanData);
        Alert.alert('Success', 'Lesson Plan created successfully!');
      }
      await fetchData();
      setIsModalVisible(false);
      resetForm();
    } catch (err: any) {
      setError(err.message);
      Alert.alert('Error', 'Failed to save lesson plan: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLessonPlan = async (id: string) => {
    Alert.alert(
      'Delete Lesson Plan',
      'Are you sure you want to delete this lesson plan?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
          setLoading(true);
          try {
            await deleteLessonPlan(id);
            await fetchData();
            Alert.alert('Success', 'Lesson Plan deleted successfully!');
          } catch (err: any) {
            setError(err.message);
            Alert.alert('Error', 'Failed to delete lesson plan: ' + err.message);
          } finally {
            setLoading(false);
          }
        }},
      ]
    );
  };

  const addFormObjective = () => setFormObjectives(prev => [...prev, '']);
  const updateFormObjective = (index: number, value: string) => {
    const newObjectives = [...formObjectives];
    newObjectives[index] = value;
    setFormObjectives(newObjectives);
  };
  const removeFormObjective = (index: number) => {
    const newObjectives = [...formObjectives];
    newObjectives.splice(index, 1);
    setFormObjectives(newObjectives);
  };

  const addFormMaterial = () => setFormMaterials(prev => [...prev, '']);
  const updateFormMaterial = (index: number, value: string) => {
    const newMaterials = [...formMaterials];
    newMaterials[index] = value;
    setFormMaterials(newMaterials);
  };
  const removeFormMaterial = (index: number) => {
    const newMaterials = [...formMaterials];
    newMaterials.splice(index, 1);
    setFormMaterials(newMaterials);
  };

  const addFormActivity = () => {
    setFormActivities(prev => [...prev, { title: '', description: '', duration: 0, type: 'introduction', order: prev.length + 1 }]);
  };
  const updateFormActivity = (index: number, field: keyof Omit<LessonActivity, 'id'>, value: any) => {
    const newActivities = [...formActivities];
    // Ensure duration is a number
    if (field === 'duration') {
      newActivities[index] = { ...newActivities[index], [field]: parseInt(value) || 0 };
    } else {
      newActivities[index] = { ...newActivities[index], [field]: value };
    }
    setFormActivities(newActivities);
  };
  const removeFormActivity = (index: number) => {
    const newActivities = [...formActivities];
    newActivities.splice(index, 1);
    setFormActivities(newActivities.map((activity, idx) => ({ ...activity, order: idx + 1 })));
  };

  const getClassName = (id: string) => allClasses.find(c => c.id === id)?.name || 'N/A';
  const getSubjectName = (id: string) => allSubjects.find(s => s.id === id)?.name || 'N/A';

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
        <Text style={styles.headerTitle}>Manage Lesson Plans</Text>
      </View>

      <TouchableOpacity style={styles.addButton} onPress={handleAddLessonPlan}>
        <Ionicons name="add-circle-outline" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add New Lesson Plan</Text>
      </TouchableOpacity>

      <FlatList
        data={lessonPlans}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.lessonPlanCard}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDetail}>Class: {getClassName(item.classId)}</Text>
            <Text style={styles.cardDetail}>Subject: {getSubjectName(item.subjectId)}</Text>
            <Text style={styles.cardDetail}>Date: {item.date}</Text>
            <Text style={styles.cardDetail}>Status: {item.status}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleEditLessonPlan(item)} style={[styles.actionButton, styles.editButton]}>
                <Ionicons name="create-outline" size={20} color="#1E90FF" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDeleteLessonPlan(item.id)} style={[styles.actionButton, styles.deleteButton]}>
                <Ionicons name="trash-outline" size={20} color="#dc3545" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No lesson plans found. Add one!</Text>
          </View>
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingLessonPlan ? 'Edit Lesson Plan' : 'Add New Lesson Plan'}</Text>
            <TouchableOpacity onPress={() => setIsModalVisible(false)}>
              <Ionicons name="close-circle-outline" size={30} color="#333" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalBody}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} value={formTitle} onChangeText={setFormTitle} placeholder="Lesson Plan Title" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Class</Text>
              <Picker
                selectedValue={formClassId}
                onValueChange={(itemValue) => setFormClassId(itemValue as string)}
                style={styles.picker}
              >
                <Picker.Item label="Select Class" value={undefined} />
                {allClasses.map((cls) => (
                  <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                ))}
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Subject</Text>
              <Picker
                selectedValue={formSubjectId}
                onValueChange={(itemValue) => setFormSubjectId(itemValue as string)}
                style={styles.picker}
              >
                <Picker.Item label="Select Subject" value={undefined} />
                {allSubjects.map((sub) => (
                  <Picker.Item key={sub.id} label={sub.name} value={sub.id} />
                ))}
              </Picker>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
              <TextInput style={styles.input} value={formDate} onChangeText={setFormDate} placeholder="e.g., 2023-10-26" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Duration (minutes)</Text>
              <TextInput style={styles.input} value={formDuration} onChangeText={setFormDuration} keyboardType="numeric" placeholder="e.g., 60" />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Objectives</Text>
              {formObjectives.map((objective, index) => (
                <View key={index} style={styles.multiInputField}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={objective}
                    onChangeText={(text) => updateFormObjective(index, text)}
                    placeholder={`Objective ${index + 1}`}
                  />
                  {formObjectives.length > 1 && (
                    <TouchableOpacity onPress={() => removeFormObjective(index)} style={styles.removeButton}>
                      <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={addFormObjective} style={styles.addMultiInputButton}>
                <Ionicons name="add-circle-outline" size={24} color="#1E90FF" />
                <Text style={styles.addMultiInputButtonText}>Add Objective</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Materials</Text>
              {formMaterials.map((material, index) => (
                <View key={index} style={styles.multiInputField}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={material}
                    onChangeText={(text) => updateFormMaterial(index, text)}
                    placeholder={`Material ${index + 1}`}
                  />
                  {formMaterials.length > 1 && (
                    <TouchableOpacity onPress={() => removeFormMaterial(index)} style={styles.removeButton}>
                      <Ionicons name="remove-circle-outline" size={24} color="#dc3545" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              <TouchableOpacity onPress={addFormMaterial} style={styles.addMultiInputButton}>
                <Ionicons name="add-circle-outline" size={24} color="#1E90FF" />
                <Text style={styles.addMultiInputButtonText}>Add Material</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Activities</Text>
              {formActivities.map((activity, index) => (
                <View key={activity.order || index} style={styles.activityCard}>
                  <TextInput
                    style={styles.input}
                    value={activity.title}
                    onChangeText={(text) => updateFormActivity(index, 'title', text)}
                    placeholder={`Activity ${index + 1} Title`}
                  />
                  <TextInput
                    style={[styles.input, { marginTop: 10, height: 80 }]} // Increased height for description
                    value={activity.description}
                    onChangeText={(text) => updateFormActivity(index, 'description', text)}
                    placeholder="Description"
                    multiline
                  />
                  <TextInput
                    style={[styles.input, { marginTop: 10 }]}
                    value={String(activity.duration)}
                    onChangeText={(text) => updateFormActivity(index, 'duration', text)}
                    keyboardType="numeric"
                    placeholder="Duration (minutes)"
                  />
                  <Picker
                    selectedValue={activity.type}
                    onValueChange={(itemValue) => updateFormActivity(index, 'type', itemValue as LessonActivity['type'])}
                    style={styles.picker}
                  >
                    {LESSON_ACTIVITY_TYPES.map(type => (
                      <Picker.Item key={type} label={type.charAt(0).toUpperCase() + type.slice(1)} value={type} />
                    ))}
                  </Picker>
                  <TouchableOpacity onPress={() => removeFormActivity(index)} style={[styles.removeButton, { alignSelf: 'flex-end', marginTop: 10 }]}>
                    <Ionicons name="close-circle-outline" size={24} color="#dc3545" />
                    <Text style={{ color: '#dc3545' }}>Remove Activity</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity onPress={addFormActivity} style={styles.addMultiInputButton}>
                <Ionicons name="add-circle-outline" size={24} color="#1E90FF" />
                <Text style={styles.addMultiInputButtonText}>Add Activity</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Assessment</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={formAssessment}
                onChangeText={setFormAssessment}
                placeholder="Describe assessment methods"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Homework (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={formHomework}
                onChangeText={setFormHomework}
                placeholder="Optional homework assignment"
                multiline
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={formNotes}
                onChangeText={setFormNotes}
                placeholder="Any additional notes for the lesson plan"
                multiline
              />
            </View>

            <TouchableOpacity style={styles.saveButton} onPress={handleSaveLessonPlan}>
              <Text style={styles.saveButtonText}>Save Lesson Plan</Text>
            </TouchableOpacity>
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
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1E90FF',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
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
  editButton: {
    backgroundColor: '#e0f7fa',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
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
    paddingTop: 50, // Adjust for status bar
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
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
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
  picker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  multiInputField: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  removeButton: {
    marginLeft: 10,
    padding: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addMultiInputButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  addMultiInputButtonText: {
    marginLeft: 8,
    color: '#1E90FF',
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#eee',
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
