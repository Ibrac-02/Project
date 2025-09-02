import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { updateUserProfile, useAuth } from '../../lib/auth';

export default function TeacherProfileScreen() {
  const { userName, user, userProfile, refreshUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Profile states
  const [title, setTitle] = useState(userProfile?.title || 'Mr.');
  const [newName, setNewName] = useState(userName || '');
  const [newContactNumber, setNewContactNumber] = useState(userProfile?.contactNumber || '');
  const [subjects, setSubjects] = useState(userProfile?.subjects || '');
  const [classes, setClasses] = useState(userProfile?.classes || '');
  const [qualifications, setQualifications] = useState(userProfile?.qualifications || '');

  const handleSave = async () => {
    if (user?.uid) {
      try {
        const updates: any = {
          title,
          name: newName,
          contactNumber: newContactNumber,
          subjects,
          classes,
          qualifications,
        };

        await updateUserProfile(user.uid, updates);
        await refreshUserProfile();
        Alert.alert("Success", "Profile updated successfully!");
        setIsEditing(false);
      } catch (error: any) {
        Alert.alert("Error", "Failed to update profile: " + error.message);
      }
    } else {
      Alert.alert("Error", "User not authenticated.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          {/* Title */}
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Title:</Text>
            {isEditing ? (
              <Picker
                selectedValue={title}
                onValueChange={(itemValue) => setTitle(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Mr." value="Mr." />
                <Picker.Item label="Mrs." value="Mrs." />
                <Picker.Item label="Ms." value="Ms." />
              </Picker>
            ) : (
              <Text style={styles.text}>{title}</Text>
            )}
          </View>
          {/* Full Name */}
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Full Name:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter full name"
              />
            ) : (
              <Text style={styles.text}>{newName || 'N/A'}</Text>
            )}
          </View>
          {/* Email */}
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Email:</Text>
            <Text style={styles.text}>{user?.email || 'N/A'}</Text>
          </View>
          {/* Contact */}
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Contact:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={newContactNumber}
                onChangeText={setNewContactNumber}
                placeholder="Enter contact number"
              />
            ) : (
              <Text style={styles.text}>{newContactNumber || 'N/A'}</Text>
            )}
          </View>
        </View>

        {/* Professional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Info</Text>
          {/* Subjects */}
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Subjects:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={subjects}
                onChangeText={setSubjects}
                placeholder="Enter subjects"
              />
            ) : (
              <Text style={styles.text}>{subjects || 'N/A'}</Text>
            )}
          </View>
          {/* Classes */}
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Classes:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={classes}
                onChangeText={setClasses}
                placeholder="Enter classes"
              />
            ) : (
              <Text style={styles.text}>{classes || 'N/A'}</Text>
            )}
          </View>
          {/* Qualifications */}
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Qualifications:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={qualifications}onChangeText={setQualifications}placeholder="Enter qualifications"
              />
            ) : (
              <Text style={styles.text}>{qualifications || 'N/A'}</Text>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Edit / Save Buttons */}
        {isEditing ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.buttonText}>Save Changes</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
            <Text style={styles.buttonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
  },
  container: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 30,
    marginTop: 30,
    marginBottom: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
  },
  detailContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    width: 120,
  },
  text: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#1E90FF',
    paddingVertical: 2,
    fontSize: 16,
    color: '#333',
    marginLeft: -5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  editButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  picker: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    marginLeft: -5,
  },
});
