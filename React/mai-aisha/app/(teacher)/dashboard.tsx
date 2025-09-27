import { Ionicons } from '@expo/vector-icons';
import { useAuth, signOutUser } from '@/lib/auth';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';
import { getUnreadNotificationsCount } from '@/lib/notifications';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

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

const { width } = Dimensions.get('window');

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 17) return 'Good Afternoon';
  return 'Good evening';
};

export default function TeacherDashboardScreen() {
  const { userName, user } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [classesCount, setClassesCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [pendingTasks, setPendingTasks] = useState(0);
  const uid = user?.uid;

  const fetchUnreadCount = useCallback(async () => {
    if (!user?.uid) return;
    try {
      const count = await getUnreadNotificationsCount(user.uid);
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  }, [user]);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
  };

  const fetchSummaryCounts = useCallback(async () => {
    try {
      if (!uid) { setClassesCount(0); setStudentsCount(0); setPendingTasks(0); return; }

      // Classes assigned to teacher
      const classesSnap = await getDocs(query(collection(db, 'classes'), where('teacherId', '==', uid)));
      setClassesCount(classesSnap.size);

      // Unique students taught (from grades and attendance)
      const [gradesSnap, attendanceSnap] = await Promise.all([
        getDocs(query(collection(db, 'grades'), where('teacherId', '==', uid))),
        getDocs(query(collection(db, 'attendance'), where('teacherId', '==', uid))),
      ]);
      const studentSet = new Set<string>();
      gradesSnap.forEach(d => { const s = (d.data() as any).studentId; if (s) studentSet.add(String(s)); });
      attendanceSnap.forEach(d => { const s = (d.data() as any).studentId; if (s) studentSet.add(String(s)); });
      setStudentsCount(studentSet.size);

      // Pending tasks: pending grades + pending lesson plans for this teacher
      const [pendingGradesSnap, pendingPlansSnap] = await Promise.all([
        getDocs(query(collection(db, 'grades'), where('teacherId', '==', uid), where('status', '==', 'pending'))),
        getDocs(query(collection(db, 'lessonPlans'), where('teacherId', '==', uid), where('status', '==', 'pending'))),
      ]);
      setPendingTasks(pendingGradesSnap.size + pendingPlansSnap.size);
    } catch {
      setClassesCount(0); setStudentsCount(0); setPendingTasks(0);
    }
  }, [uid]);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
      fetchSummaryCounts();
    }, [fetchUnreadCount, fetchSummaryCounts])
  );

  const handleLogout = async () => {
    try {
      await signOutUser();
    } finally {
      router.replace('/(auth)/login');
    }
  };

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
            <Image source={require('../../assets/images/maa.png')} style={styles.headerLogo} />
            <View>
              <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
              <Text style={styles.headerDashboardTitle}>Teacher Dashboard</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push('/(main)/announcements' )} style={styles.notificationIconContainer}>
              <Ionicons name="notifications-outline" size={28} color="#fff" />
              {unreadCount > 0 && (
                <View style={styles.notificationBadge}>
                  <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
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
                <Text style={styles.profileText}>{getInitials(userName)}</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push('/(settings)')} style={styles.settingsIconContainer}>
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
          <Text style={styles.welcomeMessage}>{greeting()}, {userName || 'Teacher'}</Text>
        </View>

        <ScrollView contentContainerStyle={styles.contentContainer}>
          {/* Summary Boxes */}
          <View style={styles.summaryRow}>
            <SummaryBox label="Classes" value={classesCount} />
            <SummaryBox label="Students" value={studentsCount} />
            <SummaryBox label="Pending Tasks" value={pendingTasks} />
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.cardGroupContainer}>
            <DashboardCard iconName="checkbox-outline" title="Attendance" onPress={() => router.push('/(teacher)/attendance' as any)} />
            <DashboardCard iconName="create-outline" title="Marks" onPress={() => router.push('/(teacher)/grade-screen' as any)} />
            <DashboardCard iconName="document-text-outline" title="Lesson Plans" onPress={() => router.push('/(teacher)/lesson-plan' as any)} />
            <DashboardCard iconName="bar-chart-outline" title="Reports" onPress={() => router.push('/(teacher)/performance-screen' as any)} />
            <DashboardCard iconName="calendar-outline" title="Calendar" onPress={() => router.push('/(main)/academic-calendar' as any)} />
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
  settingsIconContainer: { marginRight: 5 },
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
  logoutDropdown: {
    position: 'absolute',
    top: 45,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 5,
    zIndex: 999,
    width: 100,
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
});
