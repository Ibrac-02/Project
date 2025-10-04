import { router } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';

export default function ChangePasswordScreen() {
  const { user, loading: authLoading } = useAuth();
  const { colors } = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  const handleChangePassword = async () => {
    if (!user) {
      Alert.alert("Error", "User not authenticated.");
      return;
    }

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert("Error", "New password should be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      Alert.alert("Error", "New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement changePassword function in auth library
      // await changePassword(currentPassword, newPassword);
      Alert.alert("Info", "Password change functionality will be implemented soon.");
      router.back();
    } catch (err: any) {
      Alert.alert("Error", "Failed to change password: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={{ color: colors.text }}>Processing...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Current Password</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.cardBackground, 
            color: colors.text, 
            borderColor: colors.text + '30' 
          }]}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          placeholderTextColor={colors.text + '70'}
          secureTextEntry
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>New Password</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.cardBackground, 
            color: colors.text, 
            borderColor: colors.text + '30' 
          }]}
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          placeholderTextColor={colors.text + '70'}
          secureTextEntry
        />
      </View>
      <View style={styles.formGroup}>
        <Text style={[styles.label, { color: colors.text }]}>Confirm New Password</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: colors.cardBackground, 
            color: colors.text, 
            borderColor: colors.text + '30' 
          }]}
          value={confirmNewPassword}
          onChangeText={setConfirmNewPassword}
          placeholder="Confirm new password"
          placeholderTextColor={colors.text + '70'}
          secureTextEntry
        />
      </View>
      <TouchableOpacity style={[styles.saveButton, { backgroundColor: colors.primaryBlue }]} onPress={handleChangePassword}>
        <Text style={[styles.saveButtonText, { color: '#fff' }]}>Change Password</Text>
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
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  saveButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
