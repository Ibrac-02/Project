
import { signIn } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const REMEMBER_ME_KEY = 'remember_me_email'; 

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); // New state for 'Remember me'

  useEffect(() => {
    const loadRememberedEmail = async () => {
      const savedEmail = await AsyncStorage.getItem(REMEMBER_ME_KEY);
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    };
    loadRememberedEmail();
  }, []);

  const handleSignIn = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter your password.");
      return;
    }
    try {
      const { role } = await signIn(email, password);

      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_ME_KEY, email);
      } else {
        await AsyncStorage.removeItem(REMEMBER_ME_KEY);
      }

      if (role === 'admin') {
        // Go directly to Admin Tabs Home so the bottom nav bar (icons) is visible
        router.replace('/(admin)/(tabs)/home');
      } else if (role === 'teacher') {
        router.replace('/(teacher)/dashboard');
      } else if (role === 'headteacher') {
        router.replace('/(headteacher)/dashboard');
      } 
      
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred. Please try again.";
      if (error.code) {
        switch (error.code) {
          case "auth/invalid-email":
            errorMessage = "Invalid email address format.";
            break;
          case "auth/user-disabled":
            errorMessage = "This user account has been disabled.";
            break;
          case "auth/user-not-found":
            errorMessage = "No user found with this email.";
            break;
          case "auth/wrong-password":
          case "auth/invalid-credential":
            errorMessage = "Incorrect password or invalid credentials.";
            break;
          case "auth/too-many-requests":
            errorMessage = "Too many failed login attempts. Please try again later.";
            break;
          default:
            errorMessage = error.message; // Use Firebase's default message for other errors
        }
      }
      Alert.alert("Login Failed", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 4 }}  behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.container}>
        <Image source={require('../../assets/images/maa.png')} style={styles.logo} />
        <Text style={styles.schoolName}>Mai Aisha Academy</Text>
        <Text style={styles.welcomeText}>Welcome back! Please sign in to continue.</Text>
        <TextInput
        style={styles.input}
        placeholder="username@example.com"
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          placeholderTextColor="#666"
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

      {/* New container for 'Remember me' and 'Forgot password?' */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.checkboxContainer} onPress={() => setRememberMe(!rememberMe)}>
          <Ionicons
            name={rememberMe ? "checkbox-outline" : "square-outline"}
            size={20} // Reduced size
            color="#1E90FF"
          />
          <Text style={styles.rememberMeText}>Remember me</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.push('/(auth)/forgot-password')} style={styles.forgotPasswordButton}>
          <Text style={styles.forgotPasswordText}>Forgot password?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <Text style={styles.signUpText}>
        Don&apos;t have an account? <Text style={styles.signUpLink} onPress={() => router.push('/(auth)/register')}>Sign Up</Text>
      </Text>
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
  forgotPasswordButton: {
    // Remove marginTop, marginBottom, alignSelf as they will be handled by optionsContainer
  },
  forgotPasswordText: {
    color: '#1E90FF',
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 5, // Adjust padding as needed
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberMeText: {
    marginLeft: 5,
    color: '#666',
    fontSize: 14,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
});
