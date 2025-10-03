import { signUp } from '@/lib/auth';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { STANDARD_STYLES, MARGINS, SPACING, BORDER_RADIUS, SHADOWS, TYPOGRAPHY } from '@/constants/Styles';

export default function SignUpScreen() {
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const selectedRole = 'teacher'; // Default role fixed
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name) {
      Alert.alert("Error", "Please enter your full name.");
      return;
    }
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      Alert.alert("Error", "Please enter a valid email address.");
      return;
    }
    if (!password) {
      Alert.alert("Error", "Please enter a password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password should be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    try {
      await signUp(email, password, name, selectedRole); // Use selectedRole
      Alert.alert("Success", "Account created successfully!");
      // Redirect based on the selected role
      if (selectedRole === 'teacher') {
        router.replace('/(teacher)/dashboard');
      } else if (selectedRole === 'headteacher') {
        router.replace('/(headteacher)/dashboard');
      } else {
        router.replace('/(auth)/login'); // Fallback if role is not recognized
      }
    } catch (error: any) {
      let errorMessage = "An unexpected error occurred during sign-up. Please try again.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "The email address is already in use by another account.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address format.";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Email/password accounts are not enabled. Please contact support.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak. Please use a stronger password.";
            break;
          default:
            errorMessage = error.message; // Use Firebase's default message for other errors
        }
      }
      Alert.alert("Signup Failed", errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.background }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]} keyboardShouldPersistTaps='handled'>
      <Image source={require('../../assets/images/maa.png')} style={styles.logo} />
      <Text style={[styles.schoolName, { color: colors.text }]}>Mai Aisha Academy</Text>
      <Text style={[styles.welcomeText, { color: colors.text }]}>Create your account to get started.</Text>
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.text + '30' }]}
        placeholder="Full Name"
        placeholderTextColor={colors.text + '70'}
        autoCapitalize="words"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { backgroundColor: colors.cardBackground, color: colors.text, borderColor: colors.text + '30' }]}
        placeholder="username@example.com"
        placeholderTextColor={colors.text + '70'}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <View style={[styles.passwordContainer, { backgroundColor: colors.cardBackground, borderColor: colors.text + '30' }]}>
        <TextInput
          style={[styles.passwordInput, { color: colors.text }]}
          placeholder="Password"
          placeholderTextColor={colors.text + '70'}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons name={showPassword ? "eye-off" : "eye"} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
      <View style={[styles.passwordContainer, { backgroundColor: colors.cardBackground, borderColor: colors.text + '30' }]}>
        <TextInput
          style={[styles.passwordInput, { color: colors.text }]}
          placeholder="Confirm Password"
          placeholderTextColor={colors.text + '70'}
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
        >
          <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={24} color={colors.text} />
        </TouchableOpacity>
      </View>


      <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>
      <Text style={styles.signInText}>
        Already have an account? <Text style={styles.signInLink} onPress={() => router.push('/(auth)/login')}>Sign In</Text>
      </Text>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'cover',
    borderRadius: 50, // Make it circular (half of width/height)
    borderWidth: 2,
    borderColor: '#1E90FF',
    marginBottom: 10,
  },
  schoolName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#1E90FF',
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
  signUpButton: {
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
  signInText: {
    marginTop: 20,
    color: '#666',
  },
  signInLink: {
    color: '#1E90FF',
    fontWeight: 'bold',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  inputLabel: {
    alignSelf: 'flex-start',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
    fontSize: 16,
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 25,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
    height: 50,
  },
});
