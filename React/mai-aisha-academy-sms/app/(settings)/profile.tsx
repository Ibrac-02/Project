import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { updateUserProfile, useAuth } from '../../lib/auth';
import { UserProfile } from '../../lib/types';

export default function ProfileScreen() {
  const { user, userProfile: authUserProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [parentName, setParentName] = useState('');
  const [parentContactNumber, setParentContactNumber] = useState('');
  const [parentEmail, setParentEmail] = useState('');

  const fetchUserProfileData = useCallback(async () => {
    if (!authUserProfile) {
      setLoading(false);
      return;
    }
    setName(authUserProfile.name || '');
    setEmail(authUserProfile.email || '');
    setContactNumber(authUserProfile.contactNumber || '');
    setTitle(authUserProfile.title || '');
    setDepartment(authUserProfile.department || '');
    setQualifications(authUserProfile.qualifications || '');
    setParentName(authUserProfile.parentName || '');
    setParentContactNumber(authUserProfile.parentContactNumber || '');
    setParentEmail(authUserProfile.parentEmail || '');
    setLoading(false);
  }, [authUserProfile]);

  useEffect(() => {
    fetchUserProfileData();
  }, [fetchUserProfileData]);

  const handleUpdateProfile = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }
    setLoading(true);
    try {
      const updates: Partial<UserProfile> = {
        name,
        email,
        contactNumber,
        title,
        department,
        qualifications,
        parentName,
        parentContactNumber,
        parentEmail,
      };
      await updateUserProfile(user.uid, updates);
      await refreshUserProfile(); // Refresh the auth context
      Alert.alert("Success", "Profile updated successfully!");
      router.back();
    } catch (err: any) {
      setError(err.message);
      Alert.alert("Error", "Failed to update profile: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading profile...</Text>
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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          keyboardType="email-address"
          editable={false} // Email typically not editable
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          value={contactNumber}
          onChangeText={setContactNumber}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
        />
      </View>
      {(authUserProfile?.role === 'teacher' || authUserProfile?.role === 'headteacher' || authUserProfile?.role === 'admin') && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter your title (e.g., Mr., Ms., Dr.)"
          />
        </View>
      )}
      {(authUserProfile?.role === 'teacher' || authUserProfile?.role === 'headteacher' || authUserProfile?.role === 'admin') && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Department</Text>
          <TextInput
            style={styles.input}
            value={department}
            onChangeText={setDepartment}
            placeholder="Enter your department"
          />
        </View>
      )}
      {(authUserProfile?.role === 'teacher' || authUserProfile?.role === 'headteacher' || authUserProfile?.role === 'admin') && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Qualifications</Text>
          <TextInput
            style={styles.input}
            value={qualifications}
            onChangeText={setQualifications}
            placeholder="Enter your qualifications"
          />
        </View>
      )}

      {/* Student-specific fields */}
      {authUserProfile?.role === 'student' && (
        <>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Parent/Guardian Name</Text>
            <TextInput
              style={styles.input}
              value={parentName}
              onChangeText={setParentName}
              placeholder="Enter parent/guardian name"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Parent/Guardian Contact Number</Text>
            <TextInput
              style={styles.input}
              value={parentContactNumber}
              onChangeText={setParentContactNumber}
              placeholder="Enter parent/guardian contact number"
              keyboardType="phone-pad"
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Parent/Guardian Email</Text>
            <TextInput
              style={styles.input}
              value={parentEmail}
              onChangeText={setParentEmail}
              placeholder="Enter parent/guardian email"
              keyboardType="email-address"
            />
          </View>
        </>
      )}

      <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 20,
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
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
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
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});



