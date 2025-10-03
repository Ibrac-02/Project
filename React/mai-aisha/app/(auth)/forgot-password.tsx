import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Image, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { sendPasswordReset } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordScreen() {
  const { colors } = useTheme();
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
      await sendPasswordReset(email);
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
      <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image source={require('../../assets/images/maa.png')} style={styles.logo} />
      <Text style={[styles.schoolName, { color: colors.text }]}>MAI AISHA ACADEMY</Text>
        <Text style={[styles.title, { color: colors.text }]}>Enter your email to reset your password</Text>
        <TextInput
          style={[styles.input, { backgroundColor: colors.cardBackground, borderColor: colors.text + '30', color: colors.text }]}
          placeholder="username@example.com"
          placeholderTextColor={colors.text + '70'}
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
          <Text style={[styles.link, { color: colors.primaryBlue }]}>Back to Sign in</Text>
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
  },
  title: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderRadius: 25,
    paddingHorizontal: 20,
    marginBottom: 15,
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
  primaryText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: '500' 
  },
  link: { 
    fontSize: 16,
    fontWeight: '500',
  },
  logo: {
    width: 120,
    height: 120,
    resizeMode: 'cover',
    borderRadius: 60, 
    borderWidth: 2,
    borderColor: '#1E90FF',
    marginBottom: 30,
  },
  schoolName: {  
    fontSize: 20, 
    fontWeight: '500', 
    marginBottom: 30 
  },
});

