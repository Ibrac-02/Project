import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { useAuth } from '../../lib/auth';

const { width } = Dimensions.get('window');

export default function HeadteacherDashboardScreen() {
  const [showLogout, setShowLogout] = useState(false);
  const { userName, loading } = useAuth(); // Destructure userName and loading from useAuth

  const getInitials = (name: string | null) => {
    if (!name) return 'U'; // Default to 'U' if no name is available
    const nameParts = name.split(' ');
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0).toUpperCase();
    }
    return nameParts[0].charAt(0).toUpperCase() + nameParts[nameParts.length - 1].charAt(0).toUpperCase();
  };

  const handleLogout = () => {
    // Implement logout logic here
    console.log('User logged out');
    router.replace('/(auth)/login'); // Redirect to login page
  };

  const DashboardCard = ({ iconName, title, onPress }: { iconName: any; title: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Ionicons name={iconName} size={30} color="#1E90FF" />
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
            <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
          </View>
          <TouchableOpacity onPress={(event) => { event.stopPropagation(); setShowLogout(!showLogout); }} style={styles.profileIconContainer}>
            <View style={styles.profileIcon}>
              <Text style={styles.profileText}>{loading ? '' : getInitials(userName)}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {showLogout && (
          <View style={styles.logoutDropdown}>
            <TouchableOpacity style={styles.dropdownItem} onPress={() => router.push('/(headteacher)/profile')}>
              <Text style={styles.dropdownItemText}>My Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
              <Text style={styles.dropdownItemText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text style={styles.dashboardTitle}>Headteacher Dashboard</Text>
        <Text style={styles.welcomeMessage}>Welcome, {loading ? 'Loading...' : userName || 'Headteacher'}</Text>
        <ScrollView contentContainerStyle={styles.contentContainer}>

          <View style={styles.cardsContainer}>
            <DashboardCard iconName="checkbox-outline" title="Approve Marks/Gradebooks" onPress={() => console.log('Approve Marks/Gradebooks')} />
            <DashboardCard iconName="stats-chart-outline" title="View Attendance Reports" onPress={() => router.push('/(auth)/attendance')} />
            <DashboardCard iconName="megaphone-outline" title="Manage Announcements" onPress={() => router.push('/(auth)/announcements')} />
            <DashboardCard iconName="people-circle-outline" title="Teacher Attendance" onPress={() => router.push({ pathname: '/(auth)/attendance', params: { recordType: 'teacher' } })} />
            <DashboardCard iconName="calendar-outline" title="Academic Calendar" onPress={() => router.push('/(auth)/academicCalendar')} />
            <DashboardCard iconName="people-outline" title="View Staff Performance" onPress={() => console.log('View Staff Performance')} />
            <DashboardCard iconName="person-add-outline" title="Teacher Management" onPress={() => console.log('Teacher Management')} />
            <DashboardCard iconName="analytics-outline" title="Class Performance Analytics" onPress={() => console.log('Class Performance Analytics')} />
            <DashboardCard iconName="document-text-outline" title="Internal Memos / Staff Notices" onPress={() => console.log('Internal Memos / Staff Notices')} />
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
    paddingBottom: 20, // Add some bottom padding if needed
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF', // Dodger Blue from login button
    paddingTop: 70, // Increased height
    paddingHorizontal: 20,
    paddingBottom: 35, // Increased height
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
  },
  schoolName: {
    color: '#fff',
    fontSize: 18,
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
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f0f2f5',
    zIndex: 1,
  },
  dashboardTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
    textAlign: 'center',
  },
  welcomeMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  cardsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: (width / 2) - 30,
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  cardTitle: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
