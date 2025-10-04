import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { updateUserProfile, useAuth } from '../../lib/auth';
import { UserProfile } from '../../lib/types';
import { useTheme } from '@/contexts/ThemeContext';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { user, userProfile: authUserProfile, loading: authLoading, refreshUserProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [title, setTitle] = useState('');
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
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={{ color: colors.text }}>Loading profile...</Text>
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
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.headerCard, { backgroundColor: colors.cardBackground, borderColor: colors.text + '10', borderWidth: 1 }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primaryBlue }]}>
          <Text style={[styles.avatarText, { color: '#fff' }]}>{initials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerName, { color: colors.text }]}>{name || 'Your Name'}</Text>
          <Text style={[styles.headerEmail, { color: colors.text }]}>{email}</Text>
          <View style={[styles.roleChip, { backgroundColor: colors.primaryBlue + '15', borderColor: colors.primaryBlue }]}>
            <Text style={[styles.roleChipText, { color: colors.primaryBlue }]}>{roleLabel}</Text>
          </View>
        </View>
      </View>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Name</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20', color: colors.text }, formErrors.name && styles.inputError]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colors.text + '50'}
        />
        {formErrors.name && <Text style={[styles.errorInline, { color: colors.danger }]}>{formErrors.name}</Text>}
      </View>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20', color: colors.text, opacity: 0.7 }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={colors.text + '50'}
          keyboardType="email-address"
          editable={false} // Email typically not editable
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Contact Number</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20', color: colors.text }, formErrors.contactNumber && styles.inputError]}
          value={contactNumber}
          onChangeText={setContactNumber}
          placeholder="Enter contact number"
          placeholderTextColor={colors.text + '50'}
          keyboardType="phone-pad"
        />
        {formErrors.contactNumber && <Text style={styles.errorInline}>{formErrors.contactNumber}</Text>}
      </View>
      {(authUserProfile?.role === 'teacher' || authUserProfile?.role === 'headteacher' || authUserProfile?.role === 'admin') && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Title</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20', color: colors.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter your title (e.g., Mr., Ms., Dr.)"
            placeholderTextColor={colors.text + '50'}
          />
        </View>
      )}
      {(authUserProfile?.role === 'teacher' || authUserProfile?.role === 'headteacher' || authUserProfile?.role === 'admin') && (
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Qualifications</Text>
          <TextInput
            style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20', color: colors.text }]}
            value={qualifications}
            onChangeText={setQualifications}
            placeholder="Enter your qualifications"
            placeholderTextColor={colors.text + '50'}
          />
        </View>
      )}

      {/* Student-specific fields */}
      {authUserProfile?.role === 'student' && (
        <>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Parent/Guardian Name</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20', color: colors.text }]}
              value={parentName}
              onChangeText={setParentName}
              placeholder="Enter parent/guardian name"
              placeholderTextColor={colors.text + '50'}
            />
          </View>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Parent/Guardian Contact Number</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20', color: colors.text }, formErrors.parentContactNumber && styles.inputError]}
              value={parentContactNumber}
              onChangeText={setParentContactNumber}
              placeholder="Enter parent/guardian contact number"
              placeholderTextColor={colors.text + '50'}
              keyboardType="phone-pad"
            />
            {formErrors.parentContactNumber && <Text style={[styles.errorInline, { color: colors.danger }]}>{formErrors.parentContactNumber}</Text>}
          </View>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Parent/Guardian Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '20', color: colors.text }]}
              value={parentEmail}
              onChangeText={setParentEmail}
              placeholder="Enter parent/guardian email"
              placeholderTextColor={colors.text + '50'}
              keyboardType="email-address"
            />
          </View>
        </>
      )}

      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: colors.primaryBlue, shadowColor: colors.primaryBlue },
          (!name.trim() || loading) && [styles.saveButtonDisabled, { backgroundColor: colors.border }],
        ]}
        onPress={handleUpdateProfile}
        disabled={!name.trim() || loading}
      >
        <Text style={[styles.saveButtonText, { color: '#fff' }]}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  headerCard: {
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 8,
  },
  roleChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderRadius: 16,
  },
  roleChipText: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  inputError: {
    // Border/background overridden inline using theme colors
  },
  errorInline: {
    marginTop: 8,
    color: '#dc3545',
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 32,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    shadowOpacity: 0.1,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '800',
  },
});



