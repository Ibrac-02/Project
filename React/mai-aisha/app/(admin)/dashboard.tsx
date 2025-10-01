import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { getAllUsers, getStudents, useAuth, signOutUser } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';
import TermSummary from '@/components/TermSummary';
import { getUnreadMessageCount } from '@/lib/messages';
// removed unread notifications badge from header

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const [showLogout, setShowLogout] = useState(false);
  const { userName, loading, userProfile, user } = useAuth();
  const { colors } = useTheme();
  // const [unreadCount, setUnreadCount] = useState(0);

  // Summary values
  const [teachersCount, setTeachersCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  // Unread count removed with bell icon

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

      // Removed reports count - replaced with unread messages functionality

      // Get unread message count
      try {
        const unreadCount = await getUnreadMessageCount(user.uid);
        setUnreadMessages(unreadCount);
      } catch (error) {
        console.log('Error fetching unread messages:', error);
        setUnreadMessages(0);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setTeachersCount(0);
      setStudentsCount(0);
      setUnreadMessages(0);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [fetchDashboardData])
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

  const handleLogout = async () => {
    try {
      await signOutUser();
    } finally {
      router.replace('/(auth)/login');
    }
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
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBackground }]} onPress={onPress}>
      <Ionicons name={iconName} size={28} color={colors.primaryBlue} />
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );

  const SummaryBox = ({ label, value }: { label: string; value: number }) => (
    <View style={[styles.summaryBox, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.summaryValue, { color: colors.primaryBlue }]}>{value}</Text>
      <Text style={[styles.summaryLabel, { color: colors.text }]}>{label}</Text>
    </View>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setShowLogout(false)}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image
              source={require('../../assets/images/maa.png')}
              style={styles.headerLogo}
            />
            <View>
              <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
              <Text style={styles.headerDashboardTitle}>Supervisor Dashboard</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
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
             hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="menu-outline" size={40} color="#fff" />
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
        <View style={[styles.greetingCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.welcomeMessage, { color: colors.text }]}>
            {getGreetingTime()},{' '}
            {userProfile?.title || ''}{' '}
            {loading ? 'Loading...' : userName || 'User'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={[styles.contentContainer, { backgroundColor: colors.background }]}>
          {/* Summary Boxes */}
          <View style={styles.summaryRow}>
            <SummaryBox label="Teachers" value={teachersCount} />
            <SummaryBox label="Students" value={studentsCount} />
            <SummaryBox label="Active Terms" value={1} />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.cardGroupContainer}>
            <DashboardCard iconName="people-circle-outline" title="Student Management" onPress={() => router.push({ pathname: '/(admin)/students' })} />
            <DashboardCard iconName="people-outline" title="Staff Management" onPress={() => router.push('/(admin)/manage-user')} />
            <DashboardCard iconName="school-outline" title="School Setup" onPress={() => router.push('/(admin)/school-data')} />
            <DashboardCard iconName="bar-chart-outline" title="Reports & Analytics" onPress={() => router.push('/(admin)/grade-report')} />
            <DashboardCard iconName="checkmark-done-outline" title="Attendance Overview" onPress={() => router.push('/(main)/attendance')} />
            <DashboardCard iconName="analytics-outline" title="Performance Reports" onPress={() => router.push('/(admin)/grade-report')} />
            <DashboardCard iconName="notifications-outline" title="Announcements" onPress={() => router.push('/(admin)/announcements')} />
            <DashboardCard iconName="time-outline" title="Term Management" onPress={() => router.push('/(admin)/terms')} />
          </View>

          {/* Term Summary Card */}
          <TermSummary />
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
    paddingBottom: 100, // Account for bottom navigation
    flexGrow: 1,
  }, 
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF',
    paddingTop: 40,
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
    width: 30,
    height: 30,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'whitesmoke',
  },
  profileText: { color: '#1E90FF', fontSize: 14, fontWeight: 'bold' },
  logoutDropdown: {
    position: 'absolute',
    top: 115, // show below header under profile icon
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
    width: 120,
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
  settingsIconContainer: { marginRight: 5, marginLeft: 12 },
});
