import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getAllUsers, updateUserProfile, UserProfile } from '../../lib/auth';

export default function ManageTeachersScreen() {
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalVisible, setModalVisible] = useState(false);
  const [currentTeacher, setCurrentTeacher] = useState<UserProfile | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [title, setTitle] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [qualifications, setQualifications] = useState('');

  const fetchTeachers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const allUsers = await getAllUsers();
      const fetchedTeachers = allUsers.filter(user => user.role === 'teacher');
      setTeachers(fetchedTeachers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchTeachers();
    }, [fetchTeachers])
  );

  const handleEditTeacher = (teacher: UserProfile) => {
    setCurrentTeacher(teacher);
    setName(teacher.name || '');
    setEmail(teacher.email || '');
    setContactNumber(teacher.contactNumber || '');
    setTitle(teacher.title || '');
    setEmployeeId(teacher.employeeId || '');
    setQualifications(teacher.qualifications || '');
    setModalVisible(true);
  };

  const handleSaveTeacher = async () => {
    if (!currentTeacher?.uid) {
      Alert.alert("Error", "Teacher ID is missing.");
      return;
    }
    if (!name.trim() || !email.trim()) {
      Alert.alert("Error", "Name and Email cannot be empty.");
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<UserProfile> = {
        name,
        email,
        contactNumber,
        title,
        employeeId,
        qualifications,
      };
      await updateUserProfile(currentTeacher.uid, updates);
      Alert.alert("Success", `Teacher profile for ${name} updated successfully.`);
      setModalVisible(false);
      fetchTeachers();
    } catch (err: any) {
      Alert.alert("Error", `Failed to update teacher profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderTeacherItem = ({ item }: { item: UserProfile }) => (
    <View style={styles.card}>
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{item.name || 'N/A'}</Text>
        <Text style={styles.teacherDetail}>Email: {item.email || 'N/A'}</Text>
        {item.title && <Text style={styles.teacherDetail}>Title: {item.title}</Text>}
        {item.contactNumber && <Text style={styles.teacherDetail}>Contact: {item.contactNumber}</Text>}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => handleEditTeacher(item)} style={styles.actionButton}>
          <Ionicons name="pencil-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading teachers...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={fetchTeachers} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Teachers</Text>

      {teachers.length === 0 ? (
        <View style={styles.centered}>
          <Text>No teacher profiles found.</Text>
          <TouchableOpacity onPress={fetchTeachers} style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={teachers}
          keyExtractor={(item) => item.uid}
          renderItem={renderTeacherItem}
          contentContainerStyle={styles.listContentContainer}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView contentContainerStyle={styles.modalScrollContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Teacher Profile</Text>

              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
              <TextInput
                style={styles.input}
                placeholder="Contact Number"
                value={contactNumber}
                onChangeText={setContactNumber}
                keyboardType="phone-pad"
              />
              <Picker
                selectedValue={title}
                onValueChange={(itemValue) => setTitle(itemValue)}
                style={[styles.input, { height: 50 }]}
              >
                <Picker.Item label="Select Title" value="" />
                <Picker.Item label="Mr." value="Mr." />
                <Picker.Item label="Mrs." value="Mrs." />
                <Picker.Item label="Ms." value="Ms." />
      
              </Picker>
              <TextInput
                style={styles.input}
                placeholder="Employee ID"
                value={employeeId}
                onChangeText={setEmployeeId}
              />
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Qualifications"
                value={qualifications}
                onChangeText={setQualifications}
                multiline
                numberOfLines={3}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalVisible(false)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={handleSaveTeacher}>
                  <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
              </View>

            </View>
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
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  teacherDetail: {
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '110%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
    padding: 14,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    width: '100%',
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
    minWidth: 120,
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
});
