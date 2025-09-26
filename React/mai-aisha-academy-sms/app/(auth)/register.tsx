import { register } from '@/lib/auth';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity} from 'react-native';

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'teacher' | 'headteacher'>('teacher');

  const handleSignUp = async () => { 
    if (!name || !email || !password) return Alert.alert('Error', 'Please fill in all fields.');
    try {
      await register(email, password, name, role);
      Alert.alert('Success', 'Account created!');
      router.replace('/(auth)/login');
    } catch (error: any) {
      Alert.alert('Sign Up Failed', error.message || 'Could not create account.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image source={require('../../assets/images/maa.png')} style={styles.logo} />
      <Text style={styles.title}>Mai Aisha Academy</Text>
      <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.footerText}>
        Already have an account? <Text style={styles.link} onPress={() => router.push('/(auth)/login')}>Sign In</Text>
      </Text>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  logo: { 
    width: 100, 
    height: 100, 
    marginBottom: 10 
  },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 20, 
    color: '#1E90FF' 
  },
  input: { 
    width: '100%', 
    height: 50, 
    borderWidth: 1, 
    borderColor: '#ddd', 
    borderRadius: 25, 
    paddingHorizontal: 20, 
    marginBottom: 15 
  },
  button: { 
    width: '100%', 
    height: 50, 
    backgroundColor: '#1E90FF', 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 15 
  },
  buttonText: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  footerText: { 
    color: '#666' 
  },
  link: { 
    color: '#1E90FF', 
    fontWeight: 'bold' 
 },
});
