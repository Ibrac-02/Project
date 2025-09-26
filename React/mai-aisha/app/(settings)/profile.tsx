import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
  const [formErrors, setFormErrors] = useState<{ name?: string; contactNumber?: string; parentContactNumber?: string }>({});

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

  const initials = useMemo(() => {
    const base = (name || email || '').trim();
    if (!base) return '';
    const parts = base.split(' ').filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }, [name, email]);

  const roleLabel = authUserProfile?.role ? authUserProfile.role.charAt(0).toUpperCase() + authUserProfile.role.slice(1) : 'User';

  const validate = () => {
    const errors: { name?: string; contactNumber?: string; parentContactNumber?: string } = {};
    if (!name.trim()) errors.name = 'Name is required';
    if (contactNumber && contactNumber.trim().length < 7) errors.contactNumber = 'Contact number seems too short';
    if (authUserProfile?.role === 'student' && parentContactNumber && parentContactNumber.trim().length < 7) {
      errors.parentContactNumber = 'Parent contact seems too short';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async () => {
    if (!user?.uid) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }
    if (!validate()) {
      Alert.alert('Fix form', 'Please correct the highlighted fields.');
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
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName}>{name || 'Your Name'}</Text>
          <Text style={styles.headerEmail}>{email}</Text>
          <View style={styles.roleChip}><Text style={styles.roleChipText}>{roleLabel}</Text></View>
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={[styles.input, formErrors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
        />
        {formErrors.name && <Text style={styles.errorInline}>{formErrors.name}</Text>}
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
          style={[styles.input, formErrors.contactNumber && styles.inputError]}
          value={contactNumber}
          onChangeText={setContactNumber}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
        />
        {formErrors.contactNumber && <Text style={styles.errorInline}>{formErrors.contactNumber}</Text>}
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
              style={[styles.input, formErrors.parentContactNumber && styles.inputError]}
              value={parentContactNumber}
              onChangeText={setParentContactNumber}
              placeholder="Enter parent/guardian contact number"
              keyboardType="phone-pad"
            />
            {formErrors.parentContactNumber && <Text style={styles.errorInline}>{formErrors.parentContactNumber}</Text>}
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

      <TouchableOpacity style={[styles.saveButton, (!name.trim() || loading) && styles.saveButtonDisabled]} onPress={handleUpdateProfile} disabled={!name.trim() || loading}>
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
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#1E90FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  headerEmail: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  roleChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#f0f7ff',
    borderColor: '#1E90FF',
    borderWidth: 1,
    borderRadius: 12,
    marginTop: 6,
  },
  roleChipText: {
    color: '#1E90FF',
    fontSize: 12,
    fontWeight: '600',
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
  inputError: {
    borderColor: '#dc3545',
    backgroundColor: '#fff5f5',
  },
  errorInline: {
    marginTop: 6,
    color: '#dc3545',
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    backgroundColor: '#9cc9ff',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});



