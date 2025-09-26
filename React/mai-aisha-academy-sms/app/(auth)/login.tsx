import { login } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; 
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    try {
      const { role } = await login(email, password);
      if (role === 'admin') router.replace('/(admin)/dashboard');
      else if (role === 'teacher') router.replace('/(teacher)/dashboard');
      else if (role === 'headteacher') router.replace('/(headteacher)/dashboard');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials.');
    }
    console.log("successfully logged in", email, password)

  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image source={require('../../assets/images/maa.png')} style={styles.logo} />
      <Text style={styles.title}>Mai Aisha Academy</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        Don't have an account? <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>Sign Up</Text>
      </Text>
      <Text style={styles.link} onPress={() => router.push('/(auth)/forgot-password')}>Forgot Password?</Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  logo: { width: 100, height: 100, marginBottom: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#1E90FF' },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 20, marginBottom: 15 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%', borderWidth: 1, borderColor: '#ddd', borderRadius: 25, paddingHorizontal: 15, marginBottom: 15 },
  passwordInput: { flex: 1, height: 50 },
  button: { width: '100%', height: 50, backgroundColor: '#1E90FF', borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerText: { color: '#666', marginBottom: 10 },
  link: { color: '#1E90FF', fontWeight: 'bold' },
});
