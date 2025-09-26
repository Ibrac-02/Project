import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { signOutUser, useAuth } from '../../lib/auth';
import { UserProfile } from '../../lib/types';

export default function SettingsScreen() {
  const { user, userProfile: authUserProfile, loading: authLoading, refreshUserProfile, changePassword, enable2FA, disable2FA } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);

  useEffect(() => {
    if (authUserProfile) {
      setUserProfile(authUserProfile);
      setIs2FAEnabled(authUserProfile.twoFactorEnabled || false);
      setLoading(false); // Set loading to false once authUserProfile is available
    } else if (!authLoading && !user) {
      setLoading(false); // If no user and not loading, set loading to false
    }
  }, [authUserProfile, authLoading, user]);

  const handleChangePassword = async () => {
    // Navigate to a dedicated password change screen or open a modal
    router.push('/(settings)/change-password');
  };

  const handleToggle2FA = async (value: boolean) => {
    setIs2FAEnabled(value);
    if (!user?.uid) return;

    try {
      if (value) {
        await enable2FA();
        Alert.alert('Success', 'Two-factor authentication enabled.');
      } else {
        await disable2FA();
        Alert.alert('Success', 'Two-factor authentication disabled.');
      }
      refreshUserProfile(); // Refresh the profile to show updated 2FA status
    } catch (err: any) {
      Alert.alert('Error', 'Failed to update 2FA: ' + err.message);
      setIs2FAEnabled(!value); // Revert UI state on error
    }
  };

  const handleLogout = async () => {
    try {
      // Assuming signOut function is available in auth.ts
      await Alert.alert(
        "Logout",
        "Are you sure you want to log out?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Logout", onPress: async () => {
              await signOutUser(); // Use signOutUser from auth.ts
              router.replace('/(auth)/login'); // Redirect to login after logout
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to log out: ' + error.message);
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading settings...</Text>
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
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => router.push('/(settings)/profile')}>
          <Text style={styles.settingText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleChangePassword}>
          <Text style={styles.settingText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <View style={styles.settingItemRow}>
          <Text style={styles.settingText}>Two-Factor Authentication</Text>
          <Switch
            onValueChange={handleToggle2FA}
            value={is2FAEnabled}
            trackColor={{ false: "#767577", true: "#1E90FF" }}
            thumbColor={is2FAEnabled ? "#f4f3f4" : "#f4f3f4"}
          />
        </View>
        {/* Add more security settings like 'Delete Account' if needed */}
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('Delete Account', 'This feature is not yet implemented.')}>
          <Text style={styles.settingText}>Delete Account</Text>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Other</Text>
        <TouchableOpacity style={styles.settingItem} onPress={() => Alert.alert('About', 'MAI AISHA ACADEMY SECONDARY SCHOOL MANAGEMENT SYSTEM')}>
          <Text style={styles.settingText}>About</Text>
          <Ionicons name="chevron-forward" size={20} color="#555" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Log Out</Text>
          <Ionicons name="log-out-outline" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E90FF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    height: 120,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 65,
    zIndex: 1,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: '500',
  },
});
