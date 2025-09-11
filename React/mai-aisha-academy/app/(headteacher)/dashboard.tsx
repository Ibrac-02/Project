import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useAuth } from '../../lib/auth';
import { getUnreadNotificationsCount } from '../../lib/notifications'; // Import getUnreadNotificationsCount

const { width } = Dimensions.get('window');

export default function HeadteacherDashboardScreen() {
  const [showLogout, setShowLogout] = useState(false);
  const { userName, loading, userProfile, user } = useAuth(); // Destructure user from useAuth
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
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };


  return (
    <TouchableWithoutFeedback onPress={() => setShowLogout(false)}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Image source={require('../../assets/images/maa.jpg')} style={styles.headerLogo} />
            <View>
              <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
              <Text style={styles.headerDashboardTitle}>Headteacher Dashboard</Text>
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
            <TouchableOpacity onPress={() => router.push('/(settings)')} style={styles.settingsIconContainer}>
              <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
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
            <TouchableOpacity style={styles.dropdownItem} onPress={() => router.push('/(settings)/Profile')}>
              <Text style={styles.dropdownItemText}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.greetingCard}>
          <Text style={styles.welcomeMessage}>
            {getGreetingTime()}, {userProfile?.title || ''} {loading ? 'Loading...' : userName || 'User'}
          </Text>
        </View>

         <ScrollView contentContainerStyle={styles.contentContainer}>
           {/* Summary Cards */}
           <View style={styles.summaryContainer}>
             <View style={styles.summaryCard}>
               <Text style={styles.summaryNumber}>0</Text>
               <Text style={styles.summaryLabel}>Classes</Text>
             </View>
             <View style={styles.summaryCard}>
               <Text style={styles.summaryNumber}>0</Text>
               <Text style={styles.summaryLabel}>Students</Text>
             </View>
             <View style={styles.summaryCard}>
               <Text style={styles.summaryNumber}>0</Text>
               <Text style={styles.summaryLabel}>Pending Tasks</Text>
             </View>
           </View>

           {/* Quick Actions */}
           <Text style={styles.quickActionsTitle}>Quick Actions</Text>
           <View style={styles.quickActionsGrid}>
             <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(headteacher)/LessonPlansScreen')}>
               <Ionicons name="book-outline" size={24} color="#1E90FF" />
               <Text style={styles.quickActionText}>Lesson Plans</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(headteacher)/ManageTeachersScreen')}>
               <Ionicons name="people-outline" size={24} color="#1E90FF" />
               <Text style={styles.quickActionText}>Manage Teachers</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(headteacher)/ManageSubjectsScreen')}>
               <Ionicons name="library-outline" size={24} color="#1E90FF" />
               <Text style={styles.quickActionText}>Manage Subjects</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(headteacher)/GradeApprovalScreen')}>
               <Ionicons name="checkmark-circle-outline" size={24} color="#1E90FF" />
               <Text style={styles.quickActionText}>Grade Approval</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(headteacher)/ClassPerformanceAnalyticsScreen')}>
               <Ionicons name="bar-chart-outline" size={24} color="#1E90FF" />
               <Text style={styles.quickActionText}>Class Performance</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(auth)/attendance')}>
               <Ionicons name="checkmark-done-outline" size={24} color="#1E90FF" />
               <Text style={styles.quickActionText}>Attendance</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(auth)/announcements')}>
               <Ionicons name="megaphone-outline" size={24} color="#1E90FF" />
               <Text style={styles.quickActionText}>Announcements</Text>
             </TouchableOpacity>
             
             <TouchableOpacity style={styles.quickActionButton} onPress={() => router.push('/(settings)/index' as any)}>
               <Ionicons name="settings-outline" size={24} color="#1E90FF" />
               <Text style={styles.quickActionText}>Settings</Text>
             </TouchableOpacity>
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
     paddingBottom: 100,
   },
   summaryContainer: {
     flexDirection: 'row',
     marginBottom: 20,
     gap: 12,
   },
   summaryCard: {
     flex: 1,
     backgroundColor: '#fff',
     padding: 20,
     borderRadius: 12,
     alignItems: 'center',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   summaryNumber: {
     fontSize: 32,
     fontWeight: 'bold',
     color: '#1E90FF',
     marginBottom: 4,
   },
   summaryLabel: {
     fontSize: 14,
     color: '#666',
     fontWeight: '500',
   },
   quickActionsTitle: {
     fontSize: 20,
     fontWeight: 'bold',
     color: '#333',
     marginBottom: 16,
   },
   quickActionsGrid: {
     flexDirection: 'row',
     flexWrap: 'wrap',
     justifyContent: 'space-between',
   },
   quickActionButton: {
     width: (width - 80) / 4,
     height: 100,
     borderRadius: 12,
     marginBottom: 16,
     justifyContent: 'center',
     alignItems: 'center',
     backgroundColor: '#fff',
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.1,
     shadowRadius: 4,
     elevation: 3,
   },
   quickActionText: {
     color: '#333',
     fontSize: 12,
     fontWeight: '600',
     marginTop: 8,
     textAlign: 'center',
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
  settingsIconContainer: {
    marginRight: 10,
  },
}); 