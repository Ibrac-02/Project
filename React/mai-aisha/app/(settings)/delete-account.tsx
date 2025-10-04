import { router } from 'expo-router';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { deleteUserById, useAuth } from '../../lib/auth';
import { useTheme } from '@/contexts/ThemeContext';

export default function DeleteAccountScreen() {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');

  const handleDeleteAccount = async () => {
    if (!user || !user.email) {
      Alert.alert('Error', 'No user logged in.');
      return;
    }

    if (!password) {
      Alert.alert('Error', 'Please enter your password to confirm.');
      return;
    }

    const email = user.email; // ✅ TS now knows it's not null

    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const credential = EmailAuthProvider.credential(email, password);
              await reauthenticateWithCredential(user, credential);

              await deleteUserById(user.uid);
              await deleteUser(user);

              setLoading(false);
              Alert.alert('Account Deleted', 'Your account has been permanently deleted.');
              router.replace('/(auth)/login');
            } catch (error: any) {
              setLoading(false);
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.cardBackground, borderColor: colors.border, borderWidth: StyleSheet.hairlineWidth }] }>
        <Text style={[styles.warningText, { color: colors.danger }]}>
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </Text>

        <Text style={[styles.label, { color: colors.text }]}>Enter Password to Confirm</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={[styles.input, { borderBottomColor: colors.border, color: colors.text }]}
          placeholder="Enter your password"
          placeholderTextColor={colors.text + '70'}
        />

        <TouchableOpacity
          style={[styles.deleteButton, { backgroundColor: colors.danger }]}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.deleteText, { color: '#fff' }]}>Delete My Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 22,
    marginHorizontal: -20,
    marginTop: -20,
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  warningText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'left',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingVertical: 4,
    fontSize: 16,
  },
  deleteButton: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});
