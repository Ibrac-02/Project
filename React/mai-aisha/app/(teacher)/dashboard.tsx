import { DashboardHeader, GreetingCard, QuickActionCard, QuickActionsGrid, SummaryBox, SummaryRow } from '@/components/dashboard/UI';
import { useAuth } from '@/lib/auth';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function TeacherDashboardScreen() {
  const { userName } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <DashboardHeader
        title="Teacher Dashboard"
        userName={userName}
        onPressNotifications={() => router.push('/(main)/announcements' as any)}
        onPressProfile={() => router.push('/(settings)/profile' as any)}
        onPressMenu={() => router.push('/(settings)/profile' as any)}
      />

      <ScrollView contentContainerStyle={styles.container}>
        <GreetingCard>
          <Text style={styles.welcomeMessage}>
            {greeting()}, {userName || 'Teacher'}
          </Text>
        </GreetingCard>

        <SummaryRow>
          <SummaryBox label="Classes" value={0} />
          <SummaryBox label="Students" value={0} />
          <SummaryBox label="Pending Tasks" value={0} />
        </SummaryRow>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <QuickActionsGrid>
          <QuickActionCard iconName="people-outline" title="My Students" onPress={() => router.push('/(teacher)/my-classes' as any)} />
          <QuickActionCard iconName="document-text-outline" title="Lesson Plan" onPress={() => router.push('/(teacher)/lesson-plan' )} />
          <QuickActionCard iconName="bar-chart-outline" title="Performance" onPress={() => router.push('/(teacher)/performance-screen' as any)} />
          <QuickActionCard iconName="calendar-outline" title="Academic Calendar" onPress={() => router.push('/(main)/academic-calendar' as any)} />
        </QuickActionsGrid>
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
  sectionTitle: {
    fontSize: 18,
  },
  welcomeMessage: {
    fontSize: 16,
  },
});
