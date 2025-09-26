import { sendPasswordReset } from '@/lib/auth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) return Alert.alert('Error', 'Enter your email.');
    setLoading(true);
    try {
      await sendPasswordReset(email);
      Alert.alert('Success', 'Password reset email sent.');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send email.');
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/maa.png')} style={styles.logo} />
      <Text style={styles.title}>Mai Aisha Academy</Text>
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!loading} />
      <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Sending...' : 'Send Reset Email'}</Text>
      </TouchableOpacity>
      <Text style={styles.link} onPress={() => router.replace('/(auth)/login')}>Back to Login</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { width: 100, height: 100, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1E90FF' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 20, marginBottom: 15 },
  button: { width: '100%', height: 50, backgroundColor: '#1E90FF', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  link: { color: '#1E90FF', fontWeight: 'bold' },
});
