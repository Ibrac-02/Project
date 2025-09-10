import React, { useState } from 'react';
import { View,  Text,  TouchableOpacity,  Alert,  StyleSheet,  ActivityIndicator,  TextInput,} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { deleteUser, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { deleteUserById } from '../../lib/auth';

export default function DeleteAccountScreen() {
  const { user } = useAuth();
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
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.warningText}>
          Deleting your account is permanent and cannot be undone. All your data will be removed.
        </Text>

        <Text style={styles.label}>Enter Password to Confirm</Text>
        <TextInput
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholder="Enter your password"
        />

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeleteAccount}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.deleteText}>Delete My Account</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
    paddingTop: 20, // gap from header
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    elevation: 4,
  },
  warningText: {
    fontSize: 16,
    color: '#b22222',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 15,
    paddingVertical: 4,
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
