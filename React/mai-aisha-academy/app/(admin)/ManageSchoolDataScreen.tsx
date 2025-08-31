import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { createAcademicYear, createClass, createTerm, deleteAcademicYear, deleteClass, deleteTerm, getAllAcademicYears, getAllClasses, getAllTerms, updateAcademicYear, updateClass, updateTerm } from '../../lib/schoolData';
import { AcademicYear, SchoolClass, Term } from '../../lib/types';

export default function ManageSchoolDataScreen() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Modals
  const [isClassModalVisible, setClassModalVisible] = useState(false);
  const [currentClass, setCurrentClass] = useState<SchoolClass | null>(null);
  const [className, setClassName] = useState('');
  const [classDescription, setClassDescription] = useState('');

  const [isYearModalVisible, setYearModalVisible] = useState(false);
  const [currentYear, setCurrentYear] = useState<AcademicYear | null>(null);
  const [yearName, setYearName] = useState('');
  const [yearStartDate, setYearStartDate] = useState('');
  const [yearEndDate, setYearEndDate] = useState('');
  const [yearIsActive, setYearIsActive] = useState(false);

  const [isTermModalVisible, setTermModalVisible] = useState(false);
  const [currentTerm, setCurrentTerm] = useState<Term | null>(null);
  const [termName, setTermName] = useState('');
  const [termAcademicYearId, setTermAcademicYearId] = useState('');
  const [termStartDate, setTermStartDate] = useState('');
  const [termEndDate, setTermEndDate] = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedClasses = await getAllClasses();
      const fetchedYears = await getAllAcademicYears();
      const fetchedTerms = await getAllTerms();

      setClasses(fetchedClasses);
      setAcademicYears(fetchedYears);
      setTerms(fetchedTerms);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  // Class Handlers
  const handleAddClass = () => {
    setCurrentClass(null);
    setClassName('');
    setClassDescription('');
    setClassModalVisible(true);
  };

  const handleEditClass = (item: SchoolClass) => {
    setCurrentClass(item);
    setClassName(item.name);
    setClassDescription(item.description || '');
    setClassModalVisible(true);
  };

  const handleSaveClass = async () => {
    if (!className.trim()) {
      Alert.alert('Error', 'Class name cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      if (currentClass) {
        await updateClass(currentClass.id, { name: className, description: classDescription });
        Alert.alert('Success', `Class "${currentClass.name}" updated successfully.`);
      } else {
        await createClass(className, classDescription);
        Alert.alert('Success', `Class "${className}" created successfully.`);
      }
      setClassModalVisible(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', `Failed to save class: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (id: string, name: string) => {
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteClass(id);
              Alert.alert('Success', `${name} deleted successfully.`);
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', `Failed to delete ${name}: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Academic Year Handlers
  const handleAddYear = () => {
    setCurrentYear(null);
    setYearName('');
    setYearStartDate('');
    setYearEndDate('');
    setYearIsActive(false);
    setYearModalVisible(true);
  };

  const handleEditYear = (item: AcademicYear) => {
    setCurrentYear(item);
    setYearName(item.name);
    setYearStartDate(item.startDate);
    setYearEndDate(item.endDate);
    setYearIsActive(item.isActive);
    setYearModalVisible(true);
  };

  const handleSaveYear = async () => {
    if (!yearName.trim() || !yearStartDate.trim() || !yearEndDate.trim()) {
      Alert.alert('Error', 'Academic Year name, start date, and end date cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      if (currentYear) {
        await updateAcademicYear(currentYear.id, { name: yearName, startDate: yearStartDate, endDate: yearEndDate, isActive: yearIsActive });
        Alert.alert('Success', `Academic Year "${currentYear.name}" updated successfully.`);
      } else {
        await createAcademicYear(yearName, yearStartDate, yearEndDate, yearIsActive);
        Alert.alert('Success', `Academic Year "${yearName}" created successfully.`);
      }
      setYearModalVisible(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', `Failed to save academic year: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteYear = async (id: string, name: string) => {
    Alert.alert(
      'Delete Academic Year',
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteAcademicYear(id);
              Alert.alert('Success', `${name} deleted successfully.`);
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', `Failed to delete ${name}: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  // Term Handlers
  const handleAddTerm = () => {
    setCurrentTerm(null);
    setTermName('');
    setTermAcademicYearId(academicYears.length > 0 ? academicYears[0].id : ''); // Default to first academic year if available
    setTermStartDate('');
    setTermEndDate('');
    setTermModalVisible(true);
  };

  const handleEditTerm = (item: Term) => {
    setCurrentTerm(item);
    setTermName(item.name);
    setTermAcademicYearId(item.academicYearId);
    setTermStartDate(item.startDate);
    setTermEndDate(item.endDate);
    setTermModalVisible(true);
  };

  const handleSaveTerm = async () => {
    if (!termName.trim() || !termAcademicYearId.trim() || !termStartDate.trim() || !termEndDate.trim()) {
      Alert.alert('Error', 'Term name, academic year, start date, and end date cannot be empty.');
      return;
    }
    setLoading(true);
    try {
      if (currentTerm) {
        await updateTerm(currentTerm.id, { name: termName, academicYearId: termAcademicYearId, startDate: termStartDate, endDate: termEndDate });
        Alert.alert('Success', `Term "${currentTerm.name}" updated successfully.`);
      } else {
        await createTerm(termName, termAcademicYearId, termStartDate, termEndDate);
        Alert.alert('Success', `Term "${termName}" created successfully.`);
      }
      setTermModalVisible(false);
      fetchData();
    } catch (err: any) {
      Alert.alert('Error', `Failed to save term: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTerm = async (id: string, name: string) => {
    Alert.alert(
      'Delete Term',
      `Are you sure you want to delete ${name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteTerm(id);
              Alert.alert('Success', `${name} deleted successfully.`);
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', `Failed to delete ${name}: ${err.message}`);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderClassItem = ({ item }: { item: SchoolClass }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Class: {item.name}</Text>
      {item.description && <Text style={styles.cardDetail}>{item.description}</Text>}
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEditClass(item)} style={styles.actionButton}>
          <Ionicons name="pencil-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteClass(item.id, item.name)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAcademicYearItem = ({ item }: { item: AcademicYear }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Year: {item.name}</Text>
      <Text style={styles.cardDetail}>Start: {item.startDate}</Text>
      <Text style={styles.cardDetail}>End: {item.endDate}</Text>
      <Text style={styles.cardDetail}>Status: {item.isActive ? 'Active' : 'Inactive'}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEditYear(item)} style={styles.actionButton}>
          <Ionicons name="pencil-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteYear(item.id, item.name)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTermItem = ({ item }: { item: Term }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Term: {item.name}</Text>
      <Text style={styles.cardDetail}>Academic Year ID: {item.academicYearId}</Text>
      <Text style={styles.cardDetail}>Start: {item.startDate}</Text>
      <Text style={styles.cardDetail}>End: {item.endDate}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEditTerm(item)} style={styles.actionButton}>
          <Ionicons name="pencil-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handleDeleteTerm(item.id, item.name)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading school data...</Text>
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
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Manage School Data</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Classes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddClass}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Class</Text>
        </TouchableOpacity>
        {classes.length === 0 ? (
          <Text style={styles.noDataText}>No classes found.</Text>
        ) : (
          <FlatList
            data={classes}
            keyExtractor={(item) => item.id}
            renderItem={renderClassItem}
            contentContainerStyle={styles.listContentContainer}
            scrollEnabled={false} // Disable inner scrolling for FlatList in ScrollView
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Academic Years</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddYear}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Year</Text>
        </TouchableOpacity>
        {academicYears.length === 0 ? (
          <Text style={styles.noDataText}>No academic years found.</Text>
        ) : (
          <FlatList
            data={academicYears}
            keyExtractor={(item) => item.id}
            renderItem={renderAcademicYearItem}
            contentContainerStyle={styles.listContentContainer}
            scrollEnabled={false}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Terms</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddTerm}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addButtonText}>Add New Term</Text>
        </TouchableOpacity>
        {terms.length === 0 ? (
          <Text style={styles.noDataText}>No terms found.</Text>
        ) : (
          <FlatList
            data={terms}
            keyExtractor={(item) => item.id}
            renderItem={renderTermItem}
            contentContainerStyle={styles.listContentContainer}
            scrollEnabled={false}
          />
        )}
      </View>

      {/* Modals for Add/Edit */} 
      {/* Class Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isClassModalVisible}
        onRequestClose={() => setClassModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentClass ? 'Edit Class' : 'Add New Class'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Class Name (e.g., Grade 1, Junior A)"
              value={className}
              onChangeText={setClassName}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (Optional)"
              value={classDescription}
              onChangeText={setClassDescription}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setClassModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveClass}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Academic Year Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isYearModalVisible}
        onRequestClose={() => setYearModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentYear ? 'Edit Academic Year' : 'Add New Academic Year'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Year Name (e.g., 2023-2024)"
              value={yearName}
              onChangeText={setYearName}
            />
            <TextInput
              style={styles.input}
              placeholder="Start Date (YYYY-MM-DD)"
              value={yearStartDate}
              onChangeText={setYearStartDate}
            />
            <TextInput
              style={styles.input}
              placeholder="End Date (YYYY-MM-DD)"
              value={yearEndDate}
              onChangeText={setYearEndDate}
            />
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>Is Active:</Text>
              <Switch
                onValueChange={setYearIsActive}
                value={yearIsActive}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setYearModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveYear}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Term Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isTermModalVisible}
        onRequestClose={() => setTermModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentTerm ? 'Edit Term' : 'Add New Term'}</Text>
            <TextInput
              style={styles.input}
              placeholder="Term Name (e.g., Term 1, Semester A)"
              value={termName}
              onChangeText={setTermName}
            />
            <Picker
              selectedValue={termAcademicYearId}
              onValueChange={(itemValue) => setTermAcademicYearId(itemValue)}
              style={styles.picker}
            >
              {academicYears.map(year => (
                <Picker.Item key={year.id} label={year.name} value={year.id} />
              ))}
            </Picker>
            <TextInput
              style={styles.input}
              placeholder="Start Date (YYYY-MM-DD)"
              value={termStartDate}
              onChangeText={setTermStartDate}
            />
            <TextInput
              style={styles.input}
              placeholder="End Date (YYYY-MM-DD)"
              value={termEndDate}
              onChangeText={setTermEndDate}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setTermModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveTerm}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#1E90FF',
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
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  listContentContainer: {
    // Removed paddingBottom here as ScrollView handles overall padding
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardDetail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  cardActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 15,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    maxHeight: '80%', // Added to prevent modal from taking full height on smaller screens
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f44336',
  },
  saveButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  picker: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 15,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
});
