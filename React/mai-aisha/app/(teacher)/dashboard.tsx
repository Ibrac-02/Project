import { Ionicons } from '@expo/vector-icons';
import { useAuth, signOutUser } from '@/lib/auth';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
// notifications bell removed from header
import { listClasses } from '@/lib/classes';
import { listStudents } from '@/lib/students';
import { useTheme } from '@/contexts/ThemeContext';
import TermSummary from '@/components/TermSummary';
import { getUnreadMessageCount } from '@/lib/messages';

interface DashboardCardProps {
  iconName: keyof typeof Ionicons.glyphMap; // Type for Ionicons
  title: string;
  onPress: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ iconName, title, onPress }) => {
  const { colors } = useTheme();
  
  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.cardBackground }]} onPress={onPress}>
      <Ionicons name={iconName} size={32} color={colors.primaryBlue} />
      <Text style={[styles.cardTitle, { color: colors.text }]}>{title}</Text>
    </TouchableOpacity>
  );
}; 

const { width } = Dimensions.get('window');

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

export default function TeacherDashboardScreen() {
  const { userName, user, userProfile } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [classesCount, setClassesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const uid = user?.uid;
  const { colors } = useTheme();

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const fetchSummaryCounts = useCallback(async () => {
    try {
      if (!uid) { 
        setClassesCount(0); 
        setStudentsCount(0); 
        setUnreadMessages(0); 
        return; 
      }

      // Initialize counts
      setClassesCount(0);
      setStudentsCount(0);
      setUnreadMessages(0);

      // Get classes assigned to teacher using proper library function
      try {
        const allClasses = await listClasses();
        const teacherClasses = allClasses.filter(c => c.teacherId === uid);
        setClassesCount(teacherClasses.length);

        // Get students from teacher's classes
        if (teacherClasses.length > 0) {
          try {
            const allStudents = await listStudents();
            const teacherClassIds = teacherClasses.map(c => c.id);
            const studentsInTeacherClasses = allStudents.filter(student => 
              student.classes && teacherClassIds.includes(student.classes)
            );
            setStudentsCount(studentsInTeacherClasses.length);
          } catch (error) {
            console.log('Error fetching students:', error);
            setStudentsCount(0);
          }
        }
      } catch (error) {
        console.log('Error fetching classes:', error);
        setClassesCount(0);
      }

      // Removed pending tasks - replaced with unread messages functionality

      // Get unread message count
      try {
        const unreadCount = await getUnreadMessageCount(uid);
        setUnreadMessages(unreadCount);
      } catch (error) {
        console.log('Error fetching unread messages:', error);
        setUnreadMessages(0);
      }

    } catch (error) {
      console.error('Error in fetchSummaryCounts:', error);
      setClassesCount(0); 
      setStudentsCount(0); 
      setUnreadMessages(0);
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      fetchSummaryCounts();
    }, [fetchSummaryCounts])
  );

  const handleLogout = async () => {
    try {
      await signOutUser();
    } finally {
      router.replace('/(auth)/login');
    }
  };

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
            <Image source={require('../../assets/images/maa.png')} style={styles.headerLogo} />
            <View>
              <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
              <Text style={styles.headerDashboardTitle}>Teacher Dashboard</Text>
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
                <Text style={styles.profileText}>{getInitials(userName)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(settings)')} style={styles.settingsIconContainer} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
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
            {greeting()}, {userProfile?.title ? `${userProfile.title} ` : ''}{userName || 'Teacher'}
          </Text>
        </View>

        <ScrollView contentContainerStyle={[styles.contentContainer, { backgroundColor: colors.background }]}>
          {/* Summary Boxes */}
          <View style={styles.summaryRow}>
            <SummaryBox label="Classes" value={classesCount} />
            <SummaryBox label="Students" value={studentsCount} />
            <SummaryBox label="Pending Tasks" value={0} />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <View style={styles.cardGroupContainer}>
            <DashboardCard iconName="checkbox-outline" title="Attendance" onPress={() => router.push('/(teacher)/attendance' )} />
            <DashboardCard iconName="create-outline" title="Marks" onPress={() => router.push('/(teacher)/grade-screen' )} />
            <DashboardCard iconName="document-text-outline" title="Lesson Plans" onPress={() => router.push('/(teacher)/lesson-plan' )} />
            <DashboardCard iconName="bar-chart-outline" title="Reports" onPress={() => router.push('/(teacher)/performance-screen' )} />
            <DashboardCard iconName="calendar-outline" title="Calendar" onPress={() => router.push('/(main)/academic-calendar' )} />
            <DashboardCard iconName="chatbubbles-outline" title={unreadMessages > 0 ? `Messages (${unreadMessages})` : "Messages"} onPress={() => router.push('/(main)/messages' )} />
            <DashboardCard iconName="people-outline" title="My Students" onPress={() => router.push('/(teacher)/students' )} />
          </View>

          {/* Term Summary Card */}
          <TermSummary />
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: {
    padding: 20,
    paddingBottom: 100, // Account for bottom navigation
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF', // Keep header blue for branding
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
  headerRight: { flexDirection: 'row', alignItems: 'center' },
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
  settingsIconContainer: { marginRight: 5, marginLeft: 12, padding: 6 },
  greetingCard: {
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
    textAlign: 'center',
  },
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
  /** Summary Boxes */
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  summaryBox: {
    flex: 1,
    marginHorizontal: 8,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 14,
  },
  /** Cards Grid */
  card: {
    width: (width / 4) - 20,
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
    marginBottom: 12,
    marginLeft: 5,
  },
});
