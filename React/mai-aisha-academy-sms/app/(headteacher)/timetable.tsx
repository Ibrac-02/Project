import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllUsers, useAuth } from '../../lib/auth';
import { getAllAcademicYears, getAllClasses, getAllTerms } from '../../lib/schoolData';
import { getAllSubjects } from '../../lib/subjects';
import { createTimetableEntry, deleteTimetableEntry, getFilteredTimetableEntries, updateTimetableEntry } from '../../lib/timetable';
import { AcademicYear, SchoolClass, Subject, TimetableEntry } from '../../lib/types';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']; // Assuming school week
const TIME_SLOTS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00',
]; // Example time slots

export default function HeadteacherTimetableScreen() {
  const { user, role, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string | undefined>(undefined);
  const [terms, setTerms] = useState<AcademicYear[]>([]); // Using AcademicYear interface as a placeholder, should be Term[]
  const [selectedTermId, setSelectedTermId] = useState<string | undefined>(undefined);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | undefined>(undefined);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]); // UserProfile[]
  const [timetableEntries, setTimetableEntries] = useState<TimetableEntry[]>([]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [formDayOfWeek, setFormDayOfWeek] = useState<TimetableEntry['dayOfWeek']>(DAYS_OF_WEEK[0]);
  const [formStartTime, setFormStartTime] = useState('08:00');
  const [formEndTime, setFormEndTime] = useState('09:00');
  const [formRoomLocation, setFormRoomLocation] = useState('');
  const [formSubjectId, setFormSubjectId] = useState<string | undefined>(undefined);
  const [formTeacherId, setFormTeacherId] = useState<string | undefined>(undefined);
  const [formClassId, setFormClassId] = useState<string | undefined>(undefined); // for modal

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [yearsData, termsData, classesData, subjectsData, usersData] = await Promise.all([
        getAllAcademicYears(),
        getAllTerms(),
        getAllClasses(),
        getAllSubjects(),
        getAllUsers(), // Assuming this fetches all users with their roles
      ]);

      setAcademicYears(yearsData);
      setTerms(termsData);
      setClasses(classesData);
      setSubjects(subjectsData);
      setTeachers(usersData.filter(u => u.role === 'teacher')); // Filter for teachers

      // Set initial selected values if not already set
      if (yearsData.length > 0 && !selectedAcademicYearId) {
        setSelectedAcademicYearId(yearsData[0].id);
      }
      if (termsData.length > 0 && !selectedTermId) {
        setSelectedTermId(termsData[0].id);
      }
      if (classesData.length > 0 && !selectedClassId) {
        setSelectedClassId(classesData[0].id);
      }
    } catch (err: any) {
      console.error("Error fetching timetable setup data:", err);
      setError("Failed to load setup data.");
    } finally {
      setLoading(false);
    }
  }, [selectedAcademicYearId, selectedTermId, selectedClassId]);

  const fetchTimetableEntries = useCallback(async () => {
    if (!selectedAcademicYearId || !selectedTermId || !selectedClassId) {
      setTimetableEntries([]);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const entries = await getFilteredTimetableEntries({
        academicYearId: selectedAcademicYearId,
        termId: selectedTermId,
        classId: selectedClassId,
      });
      setTimetableEntries(entries);
    } catch (err: any) {
      console.error("Error fetching timetable entries:", err);
      setError("Failed to load timetable entries.");
    } finally {
      setLoading(false);
    }
  }, [selectedAcademicYearId, selectedTermId, selectedClassId]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  useEffect(() => {
    fetchTimetableEntries();
  }, [fetchTimetableEntries]);

  const resetForm = () => {
    setFormDayOfWeek(DAYS_OF_WEEK[0]);
    setFormStartTime('08:00');
    setFormEndTime('09:00');
    setFormRoomLocation('');
    setFormSubjectId(undefined);
    setFormTeacherId(undefined);
    setFormClassId(selectedClassId);
    setEditingEntry(null);
  };

  const handleAddEntry = () => {
    resetForm();
    setIsModalVisible(true);
  };

  const handleEditEntry = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setFormDayOfWeek(entry.dayOfWeek);
    setFormStartTime(entry.startTime);
    setFormEndTime(entry.endTime);
    setFormRoomLocation(entry.roomLocation);
    setFormSubjectId(entry.subjectId);
    setFormTeacherId(entry.teacherId);
    setFormClassId(entry.classId);
    setIsModalVisible(true);
  };

  const handleSaveEntry = async () => {
    if (!selectedAcademicYearId || !selectedTermId || !formClassId || !formSubjectId || !formTeacherId || !formDayOfWeek || !formStartTime || !formEndTime || !formRoomLocation.trim()) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    if (formStartTime >= formEndTime) {
      Alert.alert("Error", "Start time must be before end time.");
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        academicYearId: selectedAcademicYearId,
        termId: selectedTermId,
        classId: formClassId,
        subjectId: formSubjectId,
        teacherId: formTeacherId,
        dayOfWeek: formDayOfWeek,
        startTime: formStartTime,
        endTime: formEndTime,
        roomLocation: formRoomLocation,
      };

      if (editingEntry) {
        await updateTimetableEntry(editingEntry.id, entryData);
        Alert.alert("Success", "Timetable entry updated successfully!");
      } else {
        await createTimetableEntry(entryData);
        Alert.alert("Success", "Timetable entry created successfully!");
      }
      setIsModalVisible(false);
      fetchTimetableEntries();
    } catch (err: any) {
      console.error("Error saving timetable entry:", err);
      Alert.alert("Error", `Failed to save entry: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    Alert.alert(
      "Delete Timetable Entry",
      "Are you sure you want to delete this timetable entry? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              await deleteTimetableEntry(entryId);
              Alert.alert("Success", "Timetable entry deleted.");
              fetchTimetableEntries();
            } catch (err: any) {
              console.error("Error deleting timetable entry:", err);
              Alert.alert("Error", `Failed to delete entry: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderTimetableGrid = () => {
    const classesToDisplay = classes.filter(cls => cls.id === selectedClassId);
    if (classesToDisplay.length === 0) return null;
    const selectedClass = classesToDisplay[0];

    const timetableByDay: { [key: string]: TimetableEntry[] } = {};
    DAYS_OF_WEEK.forEach(day => (timetableByDay[day] = []));
    timetableEntries.forEach(entry => {
      if (timetableByDay[entry.dayOfWeek]) {
        timetableByDay[entry.dayOfWeek].push(entry);
      }
    });

    const sortedTimeSlots = [...TIME_SLOTS].sort();

    return (
      <View style={styles.timetableGrid}>
        <View style={styles.gridHeaderRow}>
          <Text style={styles.gridHeaderCell}>Time</Text>
          {DAYS_OF_WEEK.map(day => (
            <Text key={day} style={styles.gridHeaderCell}>{day}</Text>
          ))}
        </View>
        {sortedTimeSlots.map(timeSlot => (
          <View key={timeSlot} style={styles.gridRow}>
            <Text style={styles.gridTimeCell}>{timeSlot}</Text>
            {DAYS_OF_WEEK.map(day => {
              const entriesForSlot = timetableByDay[day]?.filter(entry => entry.startTime === timeSlot);
              return (
                <View key={day} style={styles.gridCell}>
                  {entriesForSlot && entriesForSlot.length > 0 ? (
                    entriesForSlot.map(entry => (
                      <TouchableOpacity key={entry.id} style={styles.entryCard} onPress={() => handleEditEntry(entry)}>
                        <Text style={styles.entryText}>{subjects.find(s => s.id === entry.subjectId)?.name || ''}</Text>
                        <Text style={styles.entrySubText}>{teachers.find(t => t.uid === entry.teacherId)?.name || ''}</Text>
                        <Text style={styles.entrySubText}>{entry.roomLocation}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={styles.emptyCellText}>-</Text>
                  )}
                </View>
              );
            })}
          </View>
        ))}
      </View>
    );
  };

  if (authLoading || loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading timetable data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchData} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Timetable Management</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.controlsContainer}>
          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Academic Year:</Text>
            <Picker
              selectedValue={selectedAcademicYearId}
              onValueChange={(itemValue) => setSelectedAcademicYearId(itemValue as string)}
              style={styles.picker}
            >
              {academicYears.map(year => (
                <Picker.Item key={year.id} label={year.name} value={year.id} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Term:</Text>
            <Picker
              selectedValue={selectedTermId}
              onValueChange={(itemValue) => setSelectedTermId(itemValue as string)}
              style={styles.picker}
            >
              {terms.map(term => (
                <Picker.Item key={term.id} label={term.name} value={term.id} />
              ))}
            </Picker>
          </View>

          <View style={styles.pickerWrapper}>
            <Text style={styles.label}>Class:</Text>
            <Picker
              selectedValue={selectedClassId}
              onValueChange={(itemValue) => setSelectedClassId(itemValue as string)}
              style={styles.picker}
            >
              {classes.map(cls => (
                <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity onPress={handleAddEntry} style={styles.addButton}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Timetable Entry</Text>
        </TouchableOpacity>

        {selectedAcademicYearId && selectedTermId && selectedClassId && timetableEntries.length > 0 ? (
          renderTimetableGrid()
        ) : (
          <Text style={styles.noDataText}>Please select Academic Year, Term, and Class to view the timetable, or add new entries.</Text>
        )}
      </ScrollView>

      {/* Add/Edit Timetable Entry Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <ScrollView contentContainerStyle={styles.modalScrollContent}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{editingEntry ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}</Text>
              
              <Text style={styles.label}>Class:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formClassId}
                  onValueChange={(itemValue) => setFormClassId(itemValue as string)}
                  style={styles.picker}
                >
                  {classes.map(cls => (
                    <Picker.Item key={cls.id} label={cls.name} value={cls.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Day of Week:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formDayOfWeek}
                  onValueChange={(itemValue) => setFormDayOfWeek(itemValue as TimetableEntry['dayOfWeek'])}
                  style={styles.picker}
                >
                  {DAYS_OF_WEEK.map(day => (
                    <Picker.Item key={day} label={day} value={day} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Subject:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formSubjectId}
                  onValueChange={(itemValue) => setFormSubjectId(itemValue as string)}
                  style={styles.picker}
                >
                  {subjects.map(subject => (
                    <Picker.Item key={subject.id} label={subject.name} value={subject.id} />
                  ))}
                </Picker>
              </View>

              <Text style={styles.label}>Teacher:</Text>
              <View style={styles.pickerWrapper}>
                <Picker
                  selectedValue={formTeacherId}
                  onValueChange={(itemValue) => setFormTeacherId(itemValue as string)}
                  style={styles.picker}
                >
                  {teachers.map(teacher => (
                    <Picker.Item key={teacher.uid} label={teacher.name || teacher.email} value={teacher.uid} />
                  ))}
                </Picker>
              </View>

              <View style={styles.timeInputsContainer}>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.label}>Start Time:</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formStartTime}
                      onValueChange={(itemValue) => setFormStartTime(itemValue as string)}
                      style={styles.picker}
                    >
                      {TIME_SLOTS.map(time => (
                        <Picker.Item key={time} label={time} value={time} />
                      ))}
                    </Picker>
                  </View>
                </View>
                <View style={styles.timeInputWrapper}>
                  <Text style={styles.label}>End Time:</Text>
                  <View style={styles.pickerWrapper}>
                    <Picker
                      selectedValue={formEndTime}
                      onValueChange={(itemValue) => setFormEndTime(itemValue as string)}
                      style={styles.picker}
                    >
                      {TIME_SLOTS.map(time => (
                        <Picker.Item key={time} label={time} value={time} />
                      ))}
                    </Picker>
                  </View>
                </View>
              </View>

              <Text style={styles.label}>Room Location:</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Room 101, Lab A"
                value={formRoomLocation}
                onChangeText={setFormRoomLocation}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setIsModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveEntry}>
                  <Text style={styles.buttonText}>{editingEntry ? 'Update' : 'Add Entry'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
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
  header: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    color: '#333',
    fontSize: 22,
    fontWeight: 'bold',
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
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  controlsContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  pickerWrapper: {
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
    marginTop: 5,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  noDataText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  timetableGrid: {
    backgroundColor: '#fff',
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  gridHeaderRow: {
    flexDirection: 'row',
    backgroundColor: '#e0e0e0',
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  gridHeaderCell: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    borderRightWidth: 1,
    borderColor: '#ddd',
  },
  gridRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  gridTimeCell: {
    flex: 1,
    padding: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    borderRightWidth: 1,
    borderColor: '#ddd',
    color: '#555',
  },
  gridCell: {
    flex: 1,
    padding: 5,
    minHeight: 60,
    borderRightWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  entryCard: {
    backgroundColor: '#e6f2ff',
    borderRadius: 5,
    padding: 5,
    width: '100%',
    alignItems: 'center',
    marginBottom: 5,
  },
  entryText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  entrySubText: {
    fontSize: 10,
    color: '#555',
  },
  emptyCellText: {
    fontSize: 12,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  timeInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  timeInputWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#FFD700',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

