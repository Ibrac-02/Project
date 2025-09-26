import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { FC } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/lib/auth';

interface DashboardCardProps {
  iconName: keyof typeof Ionicons.glyphMap; // Type for Ionicons
  title: string;
  onPress: () => void;
}

const DashboardCard: FC<DashboardCardProps> = ({ iconName, title, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Ionicons name={iconName} size={40} color="#1E90FF" />
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

export default function HeadteacherDashboardScreen() {
  const { userName, role } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Headteacher Dashboard</Text>
        <Text style={styles.welcomeText}>Welcome, {userName || 'Headteacher'}!</Text>
        {role && <Text style={styles.roleText}>Role: {role.toUpperCase()}</Text>}
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        <DashboardCard
          iconName="people-outline"
          title="Manage Teachers"
          onPress={() => router.push('/(headteacher)/teacher-supervision' as any)}
        />
        <DashboardCard
          iconName="document-text-outline"
          title="Approve Reports"
          onPress={() => router.push('/(headteacher)/reports-approvals' as any)}
        />
        <DashboardCard
          iconName="reader-outline"
          title="View Lesson Plans"
          onPress={() => router.push('/(headteacher)/view-lesson-plans' as any)}
        />
        <DashboardCard
          iconName="calendar-outline"
          title="Exam Schedules"
          onPress={() => router.push('/(headteacher)/exams' as any)}
        />
        <DashboardCard
          iconName="megaphone-outline"
          title="Announcements"
          onPress={() => router.push('/(headteacher)/announcements' as any)}
        />
        <DashboardCard
          iconName="person-circle-outline"
          title="Profile & Settings"
          onPress={() => router.push('/(settings)/profile' as any)}
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
    backgroundColor: '#FFD700',
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
    color: '#333',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  welcomeText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 5,
  },
  roleText: {
    color: 'rgba(51,51,51,0.8)',
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
