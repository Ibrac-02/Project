import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface DashboardCardProps {
  iconName: keyof typeof Ionicons.glyphMap; // Type for Ionicons
  title: string;
  onPress: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ iconName, title, onPress }) => (
  <TouchableOpacity style={styles.card} onPress={onPress}>
    <Ionicons name={iconName} size={32} color="#1E90FF" />
    <Text style={styles.cardTitle}>{title}</Text>
  </TouchableOpacity>
);

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export default function TeacherDashboardScreen() {
  const { userName } = useAuth();

  return (
    <View style={styles.container}>
      {/* Simple Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Teacher Dashboard</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/(main)/announcements' as any)} style={{ marginRight: 12 }}>
            <Ionicons name="notifications-outline" size={24} color="#333" />
            {/* unreadCount can be shown as a badge later if desired */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(settings)/profile' as any)}>
            <Ionicons name="person-circle-outline" size={28} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.cardsContainer}>
        <Text style={styles.welcomeMessage}>{greeting()}, {userName || 'Teacher'}</Text>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.cardsContainer}>
          <DashboardCard
            iconName="checkbox-outline"
            title="Attendance"
            onPress={() => router.push('/(teacher)/attendance' as any)}
          />
          <DashboardCard
            iconName="create-outline"
            title="Marks"
            onPress={() => router.push('/(teacher)/grade-screen' as any)}
          />
          <DashboardCard
            iconName="document-text-outline"
            title="Lesson Plans"
            onPress={() => router.push('/(teacher)/lesson-plan' as any)}
          />
          <DashboardCard
            iconName="bar-chart-outline"
            title="Reports"
            onPress={() => router.push('/(teacher)/performance-screen' as any)}
          />
          <DashboardCard
            iconName="calendar-outline"
            title="Calendar"
            onPress={() => router.push('/(main)/academic-calendar' as any)}
          />
        </View>
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
  welcomeMessage: {
    color: '#333',
    fontSize: 18,
    fontWeight: '500',
    marginTop: 15,
    marginBottom: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginVertical: 10,
  },
});
