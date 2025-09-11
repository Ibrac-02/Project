import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { collection, getDocs } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { getAllUsers, getStudents, useAuth } from '../../lib/auth';
import { db } from '../../lib/firebase';
import { getUnreadNotificationsCount } from '../../lib/notifications';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const [showLogout, setShowLogout] = useState(false);
  const { userName, loading, userProfile, user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  // Summary values
  const [teachersCount, setTeachersCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [reportsCount, setReportsCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (user?.uid) {
      try {
        const count = await getUnreadNotificationsCount(user.uid);
        setUnreadCount(count);
      } catch (error) {
        console.error('Error fetching unread notifications count:', error);
      }
    }
  }, [user]);

  /** 🔹 Fetch dynamic dashboard data */
  const fetchDashboardData = useCallback(async () => {
    try {
      if (!user?.uid) {
        console.warn("Skipping dashboard fetch: no user yet");
        return;
      }

      // Get all users and filter by role
      const allUsers = await getAllUsers();
      const teachers = allUsers.filter(user => user.role === 'teacher');
      setTeachersCount(teachers.length);

      // Get students count
      const students = await getStudents();
      setStudentsCount(students.length);

      // Get reports count (assignments + grades + attendance records)
      const [assignmentsSnapshot, gradesSnapshot, attendanceSnapshot] = await Promise.all([
        getDocs(collection(db, 'assignments')),
        getDocs(collection(db, 'grades')),
        getDocs(collection(db, 'attendance'))
      ]);
      
      const totalReports = assignmentsSnapshot.size + gradesSnapshot.size + attendanceSnapshot.size;
      setReportsCount(totalReports);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setTeachersCount(0);
      setStudentsCount(0);
      setReportsCount(0);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      fetchDashboardData();
    }, [fetchUnreadCount, fetchDashboardData])
  );

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return (
      nameParts[0].charAt(0).toUpperCase() +
      nameParts[nameParts.length - 1].charAt(0).toUpperCase()
    );
  };

  const handleLogout = () => {
    router.replace('/(auth)/login');
  };

  const DashboardCard = ({
    iconName,
    title,
    onPress,
  }: {
    iconName: any;
    title: string;
    onPress: () => void;
  }) => (
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
              <Text style={styles.headerDashboardTitle}>Admin Dashboard</Text>
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
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(settings)')}
              style={styles.settingsIconContainer}
            >
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
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
          </View>
        </View>

        {showLogout && (
          <View style={styles.logoutDropdown}>
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => router.push('/(settings)/Profile')}
            >
              <Text style={styles.dropdownItemText}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Greeting */}
        <View style={styles.greetingCard}>
          <Text style={styles.welcomeMessage}>
            {getGreetingTime()},{' '}
            {userProfile?.title || ''}{' '}
            {loading ? 'Loading...' : userName || 'User'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Summary Boxes */}
          <View style={styles.summaryRow}>
            <SummaryBox label="Teachers" value={teachersCount} />
            <SummaryBox label="Students" value={studentsCount} />
            <SummaryBox label="Reports" value={reportsCount} />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.cardGroupContainer}>
            <DashboardCard iconName="people-outline" title="User Management" onPress={() => router.push('/(admin)/manage-user')} />
            <DashboardCard iconName="school-outline" title="School Setup" onPress={() => router.push('/(admin)/school-data')} />
            <DashboardCard iconName="bar-chart-outline" title="Reports & Analytics" onPress={() => router.push('/(admin)/grade-report')} />
            <DashboardCard iconName="checkmark-done-outline" title="Attendance Overview" onPress={() => router.push('/(auth)/attendance')} />
            <DashboardCard iconName="calendar-outline" title="Academic Calendar" onPress={() => router.push('/(auth)/academicCalendar')} />
            <DashboardCard iconName="analytics-outline" title="Performance Reports" onPress={() => router.push('/(admin)/edit-user')} />
            <DashboardCard iconName="notifications-outline" title="Notifications" onPress={() => router.push('/(auth)/announcements')} />
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
  schoolName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerDashboardTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  profileIconContainer: { position: 'relative' },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'whitesmoke',
  },
  profileText: { color: '#1E90FF', fontSize: 16, fontWeight: 'bold' },
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
  /** Summary Boxes */
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
  /** Cards Grid */
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
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
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
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  notificationIconContainer: { position: 'relative', marginRight: 15 },
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
  notificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  settingsIconContainer: { marginRight: 10 },
});
