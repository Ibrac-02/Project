import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { register, updateUserProfile } from '../../lib/auth';
import { createStudent } from '../../lib/students';
import { UserProfile } from '../../lib/types';

export default function CreateUserScreen() { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserProfile['role'] | null>(null);
  const [title, setTitle] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [status, setStatus] = useState('active'); // Default to active
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [qualifications, setQualifications] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(''); // For students
  const [gender, setGender] = useState(''); // For students
  const [parentName, setParentName] = useState(''); // New state for parent name
  const [parentContactNumber, setParentContactNumber] = useState(''); // New state for parent contact
  const [parentEmail, setParentEmail] = useState(''); // New state for parent email
  const [loading, setLoading] = useState(false);

  const handleCreateUser = async () => {
    setLoading(true);
    try {
      // Basic validation
      if (!email || !password || !confirmPassword || !name || !selectedRole) {
        Alert.alert("Error", "Please fill in all required fields.");
        return;
      }
      if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        Alert.alert("Error", "Password should be at least 6 characters long.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Alert.alert("Error", "Please enter a valid email address.");
        return;
      }

      // 1. Create Firebase Auth user and initial Firestore UserProfile
      const firebaseUser = await register(email, password, name, selectedRole, title);

      // 2. Update the UserProfile with additional details
      const updates: Partial<UserProfile> = {
        contactNumber,
        status,
        employeeId,
        department,
        qualifications,
        // Add new parent fields if applicable
        ...(selectedRole === 'student' && { parentName, parentContactNumber, parentEmail }),
      };

      await updateUserProfile(firebaseUser.uid, updates);

      // 3. If the role is 'student', create a corresponding student record
      if (selectedRole === 'student') {
        if (!dateOfBirth || !gender || !parentName || !parentContactNumber) {
          Alert.alert("Error", "Please provide Date of Birth, Gender, Parent Name, and Parent Contact Number for students.");
          return;
        }
        await createStudent({
          name: name,
          classId: '', // This needs to be assigned later or through another flow
          teacherId: '', // This needs to be assigned later or through another flow
          dateOfBirth: dateOfBirth,
          gender: gender,
        });
      }

      Alert.alert("Success", `User ${name} (${selectedRole}) created successfully!`);
      router.back();
    } catch (error: any) {
      let errorMessage = "Failed to create user. Please try again.";
      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            errorMessage = "The email address is already in use by another account.";
            break;
          case "auth/invalid-email":
            errorMessage = "Invalid email address format.";
            break;
          case "auth/operation-not-allowed":
            errorMessage = "Email/password sign-up is not enabled. Please contact support.";
            break;
          case "auth/weak-password":
            errorMessage = "Password is too weak. Please use a stronger password.";
            break;
          default:
            errorMessage = error.message;
        }
      }
      Alert.alert("Error", errorMessage);
      console.error("Error creating user:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create New User</Text>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Enter full name" />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter password"
            secureTextEntry
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm password"
            secureTextEntry
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Role</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedRole}
              onValueChange={(itemValue) => setSelectedRole(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="-- Select Role --" value={null} />
              <Picker.Item label="Admin" value="admin" />
              <Picker.Item label="Headteacher" value="headteacher" />
              <Picker.Item label="Teacher" value="teacher" />
              <Picker.Item label="Student" value="student" />
            </Picker>
          </View>
        </View>

        {selectedRole === 'student' && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Date of Birth (YYYY-MM-DD)</Text>
              <TextInput
                style={styles.input}
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="e.g., 2005-01-15"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => setGender(itemValue)}
                  style={styles.picker}
                >
                  <Picker.Item label="-- Select Gender --" value="" />
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                  <Picker.Item label="Other" value="other" />
                </Picker>
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Parent/Guardian Name</Text>
              <TextInput style={styles.input} value={parentName} onChangeText={setParentName} placeholder="Enter parent/guardian full name" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Parent/Guardian Contact Number</Text>
              <TextInput
                style={styles.input}
                value={parentContactNumber}
                onChangeText={setParentContactNumber}
                placeholder="Enter parent/guardian contact number"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Parent/Guardian Email (Optional)</Text>
              <TextInput
                style={styles.input}
                value={parentEmail}
                onChangeText={setParentEmail}
                placeholder="Enter parent/guardian email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </>
        )}

        {(selectedRole === 'teacher' || selectedRole === 'headteacher' || selectedRole === 'admin') && (
          <>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Title (e.g., Mr., Ms., Dr.)</Text>
              <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter title" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Contact Number</Text>
              <TextInput
                style={styles.input}
                value={contactNumber}
                onChangeText={setContactNumber}
                placeholder="Enter contact number"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Employee ID</Text>
              <TextInput style={styles.input} value={employeeId} onChangeText={setEmployeeId} placeholder="Enter employee ID" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Department</Text>
              <TextInput style={styles.input} value={department} onChangeText={setDepartment} placeholder="Enter department" />
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Qualifications</Text>
              <TextInput style={styles.input} value={qualifications} onChangeText={setQualifications} placeholder="Enter qualifications" />
            </View>
            {/* Additional staff-specific fields can be added here */}
          </>
        )}

        <TouchableOpacity style={styles.createButton} onPress={handleCreateUser} disabled={loading}>
          <Text style={styles.createButtonText}>{loading ? 'Creating User...' : 'Create User'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  pickerContainer: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
    width: '100%',
  },
  createButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
