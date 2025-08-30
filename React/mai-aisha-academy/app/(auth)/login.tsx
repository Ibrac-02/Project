
import { signIn } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = async () => {
    try {
      const { role } = await signIn(email, password);
      if (role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (role === 'teacher') {
        router.replace('/(teacher)/dashboard');
      } else if (role === 'headteacher') {
        router.replace('/(headteacher)/dashboard');
      } else {
        // Default redirection for other roles or if role is not found
        // router.replace('/(tabs)/index'); 
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/images/maa.jpg')} style={styles.logo} />
      <Text style={styles.schoolName}>Mai Aisha Academy</Text>
      <Text style={styles.welcomeText}>Welcome back! Please sign in to continue.</Text>
      <TextInput
        style={styles.input}
        placeholder="Email Address"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color="gray" />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <Text style={styles.signUpText}>
        Don't have an account? <Text style={styles.signUpLink} onPress={() => router.push('/(auth)/sign-up')}>Sign Up</Text>
      </Text>
    </View>
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
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1E90FF', // Changed color to match sign-in button
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 20,
  },
  eyeIcon: {
    paddingRight: 15,
  },
  signInButton: {
    width: '100%',
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E90FF',
    marginTop: 10,
    marginBottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpText: {
    marginTop: 20,
    color: '#666',
  },
  signUpLink: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
});
