import { collection, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { db } from '../../config/firebase';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList: User[] = [];
      
      usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        usersList.push({
          id: doc.id,
          fullName: userData.fullName || 'N/A',
          email: userData.email || 'N/A',
          role: userData.role || 'student',
        });
      });
      
      setUsers(usersList);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const renderUser = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <Text style={styles.userName}>{item.fullName}</Text>
      <Text style={styles.userEmail}>{item.email}</Text>
      <Text style={styles.userRole}>Role: {item.role}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users ({users.length})</Text>
      
      <FlatList
        data={users}
        renderItem={renderUser}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
  userCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '500',
  },
}); 