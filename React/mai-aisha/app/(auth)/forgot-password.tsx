import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet,Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/config/firebase';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    try {
      setSubmitting(true);
      await sendPasswordResetEmail(auth, email);
      Alert.alert('Email sent', 'check your inbox or spam folder for password reset instructions.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch (error: any) {
      let message = 'Unable to send reset email. Please try again.';
      if (error?.code) {
        switch (error.code) {
          case 'auth/invalid-email':
            message = 'Invalid email address format.';
            break;
          case 'auth/user-not-found':
            message = 'No user found with this email.';
            break;
          case 'auth/too-many-requests':
            message = 'Too many requests. Please try again later.';
            break;
          default:
            message = error.message ?? message;
        }
      }
      Alert.alert('Reset failed', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
      <Image source={require('../../assets/images/maa.png')} style={styles.headerLogo} />
      <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
        <Text style={styles.title}>Reset your password</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TouchableOpacity style={[styles.primaryButton, submitting && { opacity: 0.7 }]} onPress={onReset} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Send reset link</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
          <Text style={styles.link}>Back to Sign in</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 20,
    color: '#4e4343ff',
  },
  input: {
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  primaryButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E90FF',
    marginTop: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primaryText: { color: '#fff', fontSize: 18, fontWeight: '500' },
  link: { color: '#1E90FF' },
  headerLogo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: 10,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'whitesmoke',
  },
  schoolName: {  fontSize: 20, fontWeight: 'bold', marginBottom: 30 },
});

