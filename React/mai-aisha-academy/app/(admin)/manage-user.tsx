import { useSmartSearch } from '@/hooks/useSmartSearch';
import { getAbsentStudentsToday } from '@/lib/attendance';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { deleteUserById, getAllUsers, UserProfile } from '../../lib/auth';

export default function ManageUsersScreen() {
  const [admins, setAdmins] = useState<UserProfile[]>([]);
  const [headteachers, setHeadteachers] = useState<UserProfile[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]); // Added for students
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [showAbsentStudents, setShowAbsentStudents] = useState(false);
  const [absentStudentIds, setAbsentStudentIds] = useState<string[]>([]);

  const { searchTerm, setSearchTerm, searchResults, loading: loadingSearch, error: errorSearch } = useSmartSearch();

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setErrorUsers(null);
    try {
      const all = await getAllUsers();
      setAdmins(all.filter(u => u.role === 'admin'));
      setHeadteachers(all.filter(u => u.role === 'headteacher'));
      setTeachers(all.filter(u => u.role === 'teacher'));
      setStudents(all.filter(u => u.role === 'student')); // Fetch students

      if (showAbsentStudents) {
        const absentIds = await getAbsentStudentsToday();
        setAbsentStudentIds(absentIds);
      }
    } catch (err: any) {
      setErrorUsers(err.message);
    } finally {
      setLoadingUsers(false);
    }
  }, [showAbsentStudents]);

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [fetchUsers])
  );

  const handleDeleteUser = async (uid: string, userName: string | null) => {
    Alert.alert(
      "Delete User",
      `Are you sure you want to delete ${userName || 'this user'}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUserById(uid);
              Alert.alert("Deleted", `${userName || 'User'} deleted.`);
              fetchUsers(); // Refresh the list after deletion
            } catch (err: any) {
              Alert.alert("Error", err.message);
            }
          }
        }
      ]
    );
  };

  const renderSingleUserCard = (user: UserProfile, roleColor: string) => (
    <View key={user.uid} style={styles.userCard}>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.name || 'N/A'}</Text>
        <Text style={styles.userEmail}>{user.email || 'N/A'}</Text>
        <Text style={[styles.userRole, { color: roleColor }]}>{user.role?.toUpperCase()}</Text>
      </View>
      <View style={styles.userActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() =>
            router.push({ pathname: '/(admin)/edit-user', params: { uid: user.uid } })
          }
        >
          <Ionicons name="pencil-outline" size={24} color="#4CAF50" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteUser(user.uid, user.name)}
        >
          <Ionicons name="trash-outline" size={24} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTeachersCard = () => (
    <View style={styles.teacherCard}>
      <Text style={styles.teacherTitle}>Teachers</Text>
      {teachers.length === 0 ? (
        <Text style={styles.emptyText}>No teachers found</Text>
      ) : (
        teachers.map((t) => (
          <View key={t.uid} style={styles.teacherRow}>
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>{t.name || 'N/A'}</Text>
              <Text style={styles.teacherEmail}>{t.email || 'N/A'}</Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  router.push({ pathname: '/(admin)/edit-user', params: { uid: t.uid } })
                }
              >
                <Ionicons name="pencil-outline" size={22} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteUser(t.uid, t.name)}
              >
                <Ionicons name="trash-outline" size={22} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  const renderStudentsCard = (studentsToRender: UserProfile[]) => (
    <View style={styles.teacherCard}> {/* Reusing teacherCard style for now */}
      <Text style={styles.teacherTitle}>Students</Text>
      {studentsToRender.length === 0 ? (
        <Text style={styles.emptyText}>No students found</Text>
      ) : (
        studentsToRender.map((s) => (
          <View key={s.uid} style={styles.teacherRow}>
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>{s.name || 'N/A'}</Text>
              <Text style={styles.teacherEmail}>{s.email || 'N/A'}</Text>
            </View>
            <View style={styles.userActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() =>
                  router.push({ pathname: '/(admin)/edit-user', params: { uid: s.uid } })
                }
              >
                <Ionicons name="pencil-outline" size={22} color="#4CAF50" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleDeleteUser(s.uid, s.name)}
              >
                <Ionicons name="trash-outline" size={22} color="#F44336" />
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );

  if (loadingUsers || loadingSearch) {
    return (
      <View style={styles.centered}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (errorUsers) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Error: {errorUsers}</Text>
      </View>
    );
  }

  const filteredStudents = showAbsentStudents
    ? students.filter(student => absentStudentIds.includes(student.uid))
    : students;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>System Users</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Search students, teachers, or subjects..."
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {errorSearch && <Text style={styles.errorText}>{errorSearch}</Text>}

      <TouchableOpacity 
        style={styles.filterButton}
        onPress={() => setShowAbsentStudents(!showAbsentStudents)}
      >
        <Text style={styles.filterButtonText}>
          {showAbsentStudents ? 'Show All Students' : 'Show Absent Students Today'}
        </Text>
      </TouchableOpacity>

      {searchTerm.length > 0 && searchResults.length > 0 ? (
        <View>
          <Text style={styles.searchResultTitle}>Search Results</Text>
          {searchResults.map(result => (
            <View key={result.id} style={styles.searchResultCard}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{result.name}</Text>
                <Text style={styles.userEmail}>{result.type.charAt(0).toUpperCase() + result.type.slice(1)}</Text>
              </View>
              {/* Add actions based on result type if needed */}
            </View>
          ))}
        </View>
      ) : searchTerm.length > 0 && searchResults.length === 0 ? (
        <Text style={styles.emptyText}>No results found for "{searchTerm}"</Text>
      ) : (
        // Display original user lists when no search term or no results
        <>
          {admins.map(a => renderSingleUserCard(a, '#E91E63'))}
          {headteachers.map(h => renderSingleUserCard(h, '#FF9800'))}
          {renderTeachersCard()}
          {renderStudentsCard(filteredStudents)}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f2f5',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  title: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
    marginTop: -30,
    textAlign: 'center',
  },

  searchInput: {
    height: 40,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },

  searchResultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },

  searchResultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },

  userInfo: {
    flex: 1,
  },

  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 3,
  },

  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },

  userRole: {
    fontSize: 14,
    fontWeight: 'bold',
  },

  userActions: {
    flexDirection: 'row',
  },

  actionButton: {
    marginLeft: 15,
    padding: 5,
  },

  teacherCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },

  teacherTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E90FF',
    marginBottom: 10,
  },

  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 8,
  },

  teacherInfo: {
    flex: 1,
  },

  teacherName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },

  teacherEmail: {
    fontSize: 14,
    color: '#666',
  },

  emptyText: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },

  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },

  filterButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  filterButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
