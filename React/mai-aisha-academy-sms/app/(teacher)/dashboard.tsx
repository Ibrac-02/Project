 import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../lib/auth';

interface DashboardCardProps {
  iconName: keyof typeof Ionicons.glyphMap; // Type for Ionicons
  title: string;
  onPress: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ iconName, title, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Ionicons name={iconName} size={40} color="#1E90FF" />
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function TeacherDashboardScreen() {
  const { userName, role } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teacher Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {userName || 'Teacher'}!</Text>
        {role && <Text style={styles.roleText}>Role: {role.toUpperCase()}</Text>}
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        <DashboardCard
          iconName="checkmark-circle-outline"
          title="Manage Attendance"
          onPress={() => router.push('/(teacher)/attendance')}
        />
        <DashboardCard
          iconName="school-outline"
          title="Manage Grades"
          onPress={() => router.push('/(teacher)/grades')}
        />
        <DashboardCard
          iconName="file-tray-full-outline"
          title="My Classes"
          onPress={() => router.push('/(teacher)/my-classes')}
        />
        <DashboardCard
          iconName="clipboard-outline"
          title="Manage Lesson Plans"
          onPress={() => router.push('/(teacher)/lesson-plans')}
        />
        <DashboardCard
          iconName="notifications-outline"
          title="Announcements"
          onPress={() => router.push('/(main)/announcements')}
        />
        <DashboardCard
          iconName="person-circle-outline"
          title="Profile & Settings"
          onPress={() => router.push('/(settings)/profile')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    backgroundColor: '#1E90FF',
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  welcomeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 5,
  },
  roleText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    marginTop: 2,
  },
  cardsContainer: {
    padding: 15,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '46%', // Approximately half width with spacing
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
});
