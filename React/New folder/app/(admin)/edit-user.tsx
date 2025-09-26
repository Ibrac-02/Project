import { router, useLocalSearchParams } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { updateUserProfile, UserProfile } from '../../lib/auth'; // Assuming getUserNameById is in lib/auth
import { db } from '../../lib/firebase';

export default function EditUserScreen() {
  const { uid } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // State for editable fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [title, setTitle] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [status, setStatus] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [department, setDepartment] = useState('');
  const [qualifications, setQualifications] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!uid || typeof uid !== 'string') {
        setError("User ID not provided.");
        setLoading(false);
        return;
      }
      try {
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          const profile: UserProfile = {
            uid: userDoc.id,
            email: userData.email,
            name: userData.name || null,
            role: userData.role || null,
            title: userData.title || null,
            contactNumber: userData?.contactNumber || null,
            dateJoined: userData?.dateJoined || null,
            status: userData?.status || null,
            employeeId: userData?.employeeId || null,
            department: userData?.department || null,
            teachersSupervised: userData?.teachersSupervised || null,
            attendanceApprovals: userData?.attendanceApprovals || null,
            gradeApprovals: userData?.gradeApprovals || null,
            subjects: userData?.subjects || null,
            classes: userData?.classes || null,
            qualifications: userData?.qualifications || null,
            classesHandled: userData?.classesHandled || null,
            attendanceSubmitted: userData?.attendanceSubmitted || null,
            gradesSubmitted: userData?.gradesSubmitted || null,
          };
          setUserProfile(profile);
          setName(profile.name || '');
          setEmail(profile.email || '');
          setRole(profile.role || '');
          setTitle(profile.title || '');
          setContactNumber(profile.contactNumber || '');
          setStatus(profile.status || '');
          setEmployeeId(profile.employeeId || '');
          setDepartment(profile.department || '');
          setQualifications(profile.qualifications || '');
        } else {
          setError("User not found.");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [uid]);

  const handleSave = async () => {
    if (!uid || typeof uid !== 'string') {
      Alert.alert("Error", "User ID is missing.");
      return;
    }

    setLoading(true);
    try {
      const updates: Partial<UserProfile> = {
        name,
        email,
        role,
        title,
        contactNumber,
        status,
        employeeId,
        department,
        qualifications,
      };
      await updateUserProfile(uid, updates);
      Alert.alert("Success", "User profile updated successfully.");
      router.back(); // Go back to the previous screen
    } catch (err: any) {
      Alert.alert("Error", `Failed to update user: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading user data...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.retryButton}>
          <Text style={styles.retryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Edit User Profile</Text>
      
      <View style={styles.formGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="User's Full Name"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="User's Email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Role</Text>
        <TextInput
          style={styles.input}
          value={role}
          onChangeText={setRole}
          placeholder="User's Role (e.g., admin, teacher, headteacher)"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="User's Title (e.g., Mr., Ms., Dr.)"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Contact Number</Text>
        <TextInput
          style={styles.input}
          value={contactNumber}
          onChangeText={setContactNumber}
          placeholder="User's Contact Number"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Status</Text>
        <TextInput
          style={styles.input}
          value={status}
          onChangeText={setStatus}
          placeholder="User's Status (e.g., active, inactive)"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Employee ID</Text>
        <TextInput
          style={styles.input}
          value={employeeId}
          onChangeText={setEmployeeId}
          placeholder="User's Employee ID"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Department</Text>
        <TextInput
          style={styles.input}
          value={department}
          onChangeText={setDepartment}
          placeholder="User's Department"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Qualifications</Text>
        <TextInput
          style={styles.input}
          value={qualifications}
          onChangeText={setQualifications}
          placeholder="User's Qualifications"
        />
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Changes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
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
  saveButton: {
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
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});