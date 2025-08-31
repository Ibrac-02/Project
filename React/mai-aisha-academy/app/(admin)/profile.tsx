import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { updateUserName, useAuth } from '../../lib/auth';

export default function ProfileScreen() {
  const { userName, user, role } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(userName || '');
  const [newContactNumber, setNewContactNumber] = useState('N/A'); // Placeholder for contact number

  const handleSave = async () => {
    if (user?.uid && newName !== userName) {
      try {
        await updateUserName(user.uid, newName);
        Alert.alert("Success", "Profile updated successfully!");
        setIsEditing(false);
      } catch (error: any) {
        Alert.alert("Error", "Failed to update profile: " + error.message);
      }
    } else {
      setIsEditing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.container}>

        {/* Removed the profileHeader section */}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Full Name:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={newName}
                onChangeText={setNewName}
                placeholder="Enter new name"
              />
            ) : (
              <Text style={styles.text}>{userName || 'N/A'}</Text>
            )}
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Email:</Text>
            <Text style={styles.text}>{user?.email || 'N/A'}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Username:</Text>
            <Text style={styles.text}>admin_user (Placeholder)</Text>
          </View>
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
              <Text style={styles.text}>{newContactNumber}</Text>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Role & Permissions</Text>
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Role:</Text>
            <Text style={styles.text}>{role || 'N/A'}</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Access:</Text>
            <Text style={styles.text}>Full System Access (Placeholder)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#555" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.settingItem}>
            <Text style={styles.settingText}>Two-Factor Authentication</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Information</Text>
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Date Joined:</Text>
            <Text style={styles.text}>January 1, 2023 (Placeholder)</Text>
          </View>
          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Status:</Text>
            <Text style={styles.text}>Active (Placeholder)</Text>
          </View>
        </View>

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
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  // Removed profileHeader styles
  profileHeader: {},
  profileImageContainer: {},
  profileImage: {},
  profileName: {},
  profileEmail: {},
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
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
    width: 120, // Increased width for labels
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
});
