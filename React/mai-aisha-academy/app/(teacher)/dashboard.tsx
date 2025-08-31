import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { getUnreadNotificationsCount } from '../../lib/notifications'; // Import getUnreadNotificationsCount

const { width } = Dimensions.get('window');

export default function TeacherDashboardScreen() {
  const [showLogout, setShowLogout] = useState(false);
  const { userName, loading, user } = useAuth(); // Destructure user from useAuth
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (user?.uid) {
      try {
        const count = await getUnreadNotificationsCount(user.uid);
        setUnreadCount(count);
      } catch (error) {
        console.error("Error fetching unread notifications count:", error);
      }
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  const getInitials = (name: string | null) => {
    if (!name) return 'U';
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    console.log('User logged out');
    router.replace('/(auth)/login');
  };

  const getGreetingTime = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  };

  const DashboardCard = ({ iconName, title, onPress }: { iconName: any; title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={iconName} size={40} color="#1E90FF" />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableWithoutFeedback onPress={() => setShowLogout(false)}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/images/maa.jpg')} style={styles.headerLogo} />
            <View>
              <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
              <Text style={styles.headerDashboardTitle}>Teacher Dashboard</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/(auth)/announcements')} style={styles.notificationIconContainer}>
              <Ionicons name="notifications-outline" size={28} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={(event) => { event.stopPropagation(); setShowLogout(!showLogout); }} style={styles.profileIconContainer}>
              <View style={styles.profileIcon}>
                <Text style={styles.profileText}>{loading ? '' : getInitials(userName)}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {showLogout && (
          <View style={styles.logoutDropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => router.push('/(teacher)/profile')}>
              <Text style={styles.dropdownItemText}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.greetingCard}>
          <Text style={styles.welcomeMessage}>
            {getGreetingTime()}, {loading ? 'Loading...' : userName || 'Teacher'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>

          <Text style={styles.cardGroupTitle}>Classroom Management</Text>
          <View style={styles.cardGroupContainer}>
            <DashboardCard iconName="checkmark-done-outline" title="Mark Attendance" onPress={() => router.push('/(auth)/attendance')} />
            <DashboardCard iconName="book-outline" title="Manage Subjects" onPress={() => router.push('/(teacher)/ManageSubjectsScreen')} />
            <DashboardCard iconName="people-outline" title="Manage Students" onPress={() => router.push('/(teacher)/students')} />
            <DashboardCard iconName="create-outline" title="Assignments Management" onPress={() => console.log('Assignments Management')} />
          </View>

          <Text style={styles.cardGroupTitle}>Academics & Grading</Text>
          <View style={styles.cardGroupContainer}>
            <DashboardCard iconName="stats-chart-outline" title="Gradebook / Marks Register" onPress={() => router.push('/(teacher)/GradeEntryScreen')} />
            <DashboardCard iconName="calendar-outline" title="Academic Calendar" onPress={() => router.push('/(auth)/academicCalendar')} />
          </View>

          <Text style={styles.cardGroupTitle}>Performance</Text>
          <View style={styles.cardGroupContainer}>
            <DashboardCard iconName="trending-up-outline" title="Performance Tracking" onPress={() => router.push('/(teacher)/TeacherPerformanceScreen')} />
          </View>

        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  contentContainer: {
    padding: 20,
    backgroundColor: '#f0f2f5',
    paddingBottom: 20,
    flexGrow: 1, // Ensure content can grow to fill space and enable scrolling
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF',
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 35,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomEndRadius: 0,
    borderBottomStartRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'whitesmoke',
  },
  schoolName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerDashboardTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileIconContainer: {
    position: 'relative',
  },
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
  profileText: {
    color: '#1E90FF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutDropdown: {
    position: 'absolute',
    top: 45,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 999,
    width: 150,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
  greetingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  welcomeMessage: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  card: {
    width: (width / 2) - 30,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 25,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 5,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  cardGroupTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'gray',
    marginBottom: 15,
    marginLeft: 10,
  },
  cardGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  notificationIconContainer: {
    position: 'relative',
    marginRight: 15,
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
    fontWeight: 'bold',
  },
});
