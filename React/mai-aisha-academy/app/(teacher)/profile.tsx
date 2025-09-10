import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { updateUserProfile, useAuth } from '../../lib/auth';
import { UserProfile } from '../../lib/types';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { userName, user, userProfile, refreshUserProfile, enable2FA, disable2FA } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(userName || '');
  const [newTitle, setNewTitle] = useState(userProfile?.title || '');
  const [newContactNumber, setNewContactNumber] = useState(userProfile?.contactNumber || 'N/A');

  const handleSave = async () => {
    if (!user?.uid) return;

    const updates: Partial<UserProfile> = {};
    if (newName !== userName) {
      updates.name = newName;
    }
    if (newTitle !== (userProfile?.title || '')) {
      updates.title = newTitle;
    }
    if (newContactNumber !== (userProfile?.contactNumber || 'N/A')) {
      updates.contactNumber = newContactNumber;
    }

    if (Object.keys(updates).length > 0) {
      try {
        await updateUserProfile(user.uid, updates);
        Alert.alert('Success', 'Profile updated successfully!');
        refreshUserProfile();
        setIsEditing(false);
      } catch (error: any) {
        Alert.alert('Error', 'Failed to update profile: ' + error.message);
      }
    } else {
      setIsEditing(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Title:</Text>
            {isEditing ? (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={newTitle}
                  onValueChange={(itemValue) => setNewTitle(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="Select Title" value="" />
                  <Picker.Item label="Mr." value="Mr." />
                  <Picker.Item label="Mrs." value="Mrs." />
                  <Picker.Item label="Ms." value="Ms." />
                </Picker>
              </View>
            ) : (
              <Text style={styles.text}>{userProfile?.title || 'N/A'}</Text>
            )}
          </View>

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
              <Text style={styles.text}>{userName || 'N/A'}</Text>
            )}
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Email:</Text>
            <Text style={styles.text}>{user?.email || 'N/A'}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Username:</Text>
            <Text style={styles.text}>{userProfile?.name || 'N/A'}</Text>
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
              <Text style={styles.text}>{userProfile?.contactNumber || 'N/A'}</Text>
            )}
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(settings)/change-password')}
          >
            <Text style={styles.settingText}>Change Password</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#555" />
          </TouchableOpacity>

          <View style={styles.settingItem}>
            <Text style={styles.settingText}>Two-Factor Authentication</Text>
            <Switch
              value={userProfile?.twoFactorEnabled || false}
              onValueChange={async (value) => {
                try {
                  if (value) {
                    await enable2FA();
                  } else {
                    await disable2FA();
                  }
                  refreshUserProfile();
                } catch (err: any) {
                  Alert.alert('Error', err.message);
                }
              }}
            />
          </View>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => router.push('/(settings)/delete-account')}
          >
            <Text style={styles.settingText}>Delete Account</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="#555" />
          </TouchableOpacity>
        </View>

        {/* Other Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Other Information</Text>

          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Date Joined:</Text>
            <Text style={styles.text}>{userProfile?.dateJoined || 'N/A'}</Text>
          </View>

          <View style={styles.detailContainer}>
            <Text style={styles.labelText}>Status:</Text>
            <Text style={styles.text}>{userProfile?.status || 'Active'}</Text>
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
  },
  pickerContainer: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#1E90FF',
  },
  picker: {
    height: 40,
    width: '100%',
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
