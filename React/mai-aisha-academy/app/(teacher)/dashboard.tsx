import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View, } from 'react-native';
import { getStudents, useAuth } from '../../lib/auth';
import { db } from '../../lib/firebase';
import { getUnreadNotificationsCount } from '../../lib/notifications';

const { width } = Dimensions.get('window');

export default function TeacherDashboardScreen() {
  const [showLogout, setShowLogout] = useState(false);
  const { userName, loading, userProfile, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Summary values
  const [classesCount, setClassesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [pendingTasksCount, setPendingTasksCount] = useState(0);

  /** 🔹 Fetch unread notifications */
  const fetchUnreadCount = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const count = await getUnreadNotificationsCount(user.uid);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching unread notifications count:', error);
    }
  }, [user]);

  /** 🔹 Fetch dynamic dashboard data */
  const fetchDashboardData = useCallback(async () => {
    try {
      if (!user?.uid) {
        console.warn("Skipping dashboard fetch: no user yet");
        return;
      }

      setClassesCount(userProfile?.classesHandled?.length || 0);

      const students = await getStudents();
      setStudentsCount(students?.length || 0);

      const q = query(
        collection(db, 'assignments'),
        where('teacherId', '==', user.uid),
        where('status', '==', 'pending')
      );
      const snapshot = await getDocs(q);
      setPendingTasksCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setClassesCount(0);
      setStudentsCount(0);
      setPendingTasksCount(0);
    }
  }, [user, userProfile]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      fetchDashboardData();
    }, [fetchUnreadCount, fetchDashboardData])
  );

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    return nameParts.length === 1
      ? nameParts[0].charAt(0).toUpperCase()
      : nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const DashboardCard = ({ iconName, title, onPress }: { iconName: any; title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={iconName} size={28} color="#1E90FF" />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const SummaryBox = ({ label, value }: { label: string; value: number }) => (
    <View style={styles.summaryBox}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setShowLogout(false)}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/images/maa.jpg')}
              style={styles.headerLogo}
            />
            <View>
              <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
              <Text style={styles.headerDashboardTitle}>Teacher Dashboard</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/announcements')}
              style={styles.notificationIconContainer}
            >
              <Ionicons name="notifications-outline" size={28} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>
                    {unreadCount}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
           
            <TouchableOpacity
              onPress={(event) => {
                event.stopPropagation();
                setShowLogout(!showLogout);
              }}
              style={styles.profileIconContainer}
            >
              <View style={styles.profileIcon}>
                <Text style={styles.profileText}>
                  {loading ? '' : getInitials(userName)}
                </Text>
              </View>
            </TouchableOpacity>
             <TouchableOpacity
              onPress={() => router.push('/(settings)')}
              style={styles.settingsIconContainer}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {showLogout && (
          <View style={styles.logoutDropdown}>
            <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Greeting */}
        <View style={styles.greetingCard}>
          <Text style={styles.welcomeMessage}>
            {getGreetingTime()},{' '}{userProfile?.title || ''}{' '}
            {loading ? 'Loading...' : userName || 'User'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Summary Boxes */}
          <View style={styles.summaryRow}>
            <SummaryBox label="Classes" value={classesCount} />
            <SummaryBox label="Students" value={studentsCount} />
            <SummaryBox label="Pending Tasks" value={pendingTasksCount} />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.cardGroupContainer}>
            <DashboardCard iconName="checkmark-done-outline" title="Mark Attendance" onPress={() => router.push('/(auth)/attendance')} />
            <DashboardCard iconName="book-outline" title="My Subjects" onPress={() => router.push('/(teacher)/subject-screen')} />
            <DashboardCard iconName="people-outline" title="My Students" onPress={() => router.push('/(teacher)/students')} />
            <DashboardCard iconName="create-outline" title="Assignments" onPress={() => router.push('/(teacher)/assignment-screen')} />
            <DashboardCard iconName="stats-chart-outline" title="Enter Grades" onPress={() => router.push('/(teacher)/grade-screen')} />
            <DashboardCard iconName="calendar-outline" title="Academic Calendar" onPress={() => router.push('/(auth)/academic-calendar')} />
            <DashboardCard iconName="trending-up-outline" title="Performance" onPress={() => router.push('/(teacher)/performance-screen')} />
            <DashboardCard iconName="book-open-outline" title="Lesson Plan" onPress={() => router.push('/(teacher)/lesson-plan')} />
            <DashboardCard iconName="document-text-outline" title="Upload Documents" onPress={() => router.push('/(teacher)/upload-document')} />
          </View>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  contentContainer: {
    padding: 20,
    backgroundColor: '#f0f2f5',
    paddingBottom: 20,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF',
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 35,
    elevation: 3,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'whitesmoke',
  },
  schoolName: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold' 
  },
  headerDashboardTitle: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },
  profileIconContainer: { 
    position: 'relative'
   },
  profileIcon: {
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'whitesmoke',
  },
  profileText: { 
    color: '#1E90FF', 
    fontSize: 14, 
    fontWeight: 'bold'
   },
  logoutDropdown: {
    position: 'absolute',
    top: 45,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
    width: 150,
  },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 15 },
  dropdownItemText: { fontSize: 16, color: '#333' },
  greetingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    elevation: 5,
  },
  welcomeMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  summaryBox: {
    flex: 1,
    backgroundColor: '#fff',
    marginHorizontal: 8,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#1E90FF',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 14,
    color: '#333',
  },
  card: {
    width: (width / 4) - 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 20,
    marginBottom: 18,
    marginHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: '500',
    color: '#382323ff',
    textAlign: 'center',
  },
  cardGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 12,
    marginLeft: 5,
  },
  headerRight: { 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  notificationIconContainer: { 
    position: 'relative', 
    marginRight: 15
   },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 7,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: { 
    color: '#fff', 
    fontSize: 10, 
    fontWeight: 'bold' },
  settingsIconContainer: {
    marginRight: 5,
    },
});
