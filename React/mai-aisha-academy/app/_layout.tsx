import AsyncStorage from '@react-native-async-storage/async-storage';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as Notifications from 'expo-notifications';
import { router, Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { ensureHolidaysForYear, getTermsEndingSoon, getUpcomingAcademicEvents, } from '@/lib/academicCalendar';
import { getAllUsers, useAuth } from '@/lib/auth';
import { generateNotificationsForEvent } from '@/lib/eventNotifications';
import { getAllGrades } from '@/lib/grades';
import { registerForPushNotificationsAsync } from '@/lib/notificationService';
import { generateAndUploadGradeReport } from '@/lib/reportGeneration';
import { getAllSubjects } from '@/lib/subjects';
import { Grade } from '@/lib/types';
import { generateNotificationForAttendanceWarning, generateNotificationForPerformanceWarning } from '@/lib/warningNotifications';
import { checkStudentAttendanceWarnings, checkStudentPerformanceWarnings } from '@/lib/warningUtils';
import { Timestamp } from 'firebase/firestore';

// AsyncStorage keys
const NOTIFIED_EVENTS_KEY = 'notified_academic_events';
const NOTIFIED_WARNINGS_KEY = 'notified_student_warnings';
const HOLIDAYS_CHECKED_KEY = 'holidays_checked_for_year';
const REPORTS_GENERATED_KEY = 'reports_generated_for_term';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, loading, role } = useAuth();

  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);
  const hasRedirected = useRef(false);

  // --- Redirect & notifications logic ---
  useEffect(() => {
    if (!fontsLoaded || loading) return;

    // Prevent multiple redirects
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    if (!user) {
      console.log("Redirecting to login" + user + " " + role);
      router.replace('/(auth)/login');
      return;
    }

    // Redirect by role
    switch (role) {
      case 'admin':
        router.replace('/(admin)/dashboard');
        break;
      case 'headteacher':
        router.replace('/(headteacher)/dashboard');
        break;
      case 'teacher':
        router.replace('/(teacher)/dashboard');
        break;
      default:
        router.replace('/(auth)/login');
    }

    // Register push notifications
    registerForPushNotificationsAsync(user.uid);

    // Listen to notifications
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response received:', response);
      const { data } = response.notification.request.content;
      if (data?.link) router.push(data.link as any);
    });

    // Async tasks (holidays, events, warnings, reports)
    const asyncTasks = async () => {
      try {
        const currentYear = new Date().getFullYear();

        // Admin: ensure holidays
        if (role === 'admin') {
          const holidaysChecked = await AsyncStorage.getItem(HOLIDAYS_CHECKED_KEY);
          if (holidaysChecked !== String(currentYear)) {
            console.log(`Ensuring holidays for ${currentYear}`);
            await ensureHolidaysForYear(currentYear, user.uid);
            await AsyncStorage.setItem(HOLIDAYS_CHECKED_KEY, String(currentYear));
          }
        }

        // Upcoming events
        const upcomingEvents = await getUpcomingAcademicEvents(7, user.uid, role || '');
        const storedNotifiedEvents = await AsyncStorage.getItem(NOTIFIED_EVENTS_KEY);
        let notifiedEvents = storedNotifiedEvents ? JSON.parse(storedNotifiedEvents) : [];
        for (const event of upcomingEvents) {
          if (!notifiedEvents.includes(event.id)) {
            await generateNotificationsForEvent(event);
            notifiedEvents.push(event.id);
          }
        }
        await AsyncStorage.setItem(NOTIFIED_EVENTS_KEY, JSON.stringify(notifiedEvents));

        // Student warnings
        const allUsers = await getAllUsers();
        const students = allUsers.filter((u) => u.role === 'student');
        const storedNotifiedWarnings = await AsyncStorage.getItem(NOTIFIED_WARNINGS_KEY);
        let notifiedWarnings = storedNotifiedWarnings ? JSON.parse(storedNotifiedWarnings) : [];

        for (const student of students) {
          const attendanceWarning = await checkStudentAttendanceWarnings(student.uid, student.name || student.email || '');
          if (attendanceWarning) {
            const warningId = `attendance-${student.uid}-${attendanceWarning.absentCount}`;
            if (!notifiedWarnings.includes(warningId) && ['admin','headteacher'].includes(role || '')) {
              await generateNotificationForAttendanceWarning(attendanceWarning, user.uid);
              notifiedWarnings.push(warningId);
            }
          }

          const performanceWarning = await checkStudentPerformanceWarnings(student.uid, student.name || student.email || '');
          if (performanceWarning) {
            const warningId = `performance-${student.uid}-${performanceWarning.averageGrade}`;
            if (!notifiedWarnings.includes(warningId) && ['admin','headteacher'].includes(role || '')) {
              await generateNotificationForPerformanceWarning(performanceWarning, user.uid);
              notifiedWarnings.push(warningId);
            }
          }
        }

        await AsyncStorage.setItem(NOTIFIED_WARNINGS_KEY, JSON.stringify(notifiedWarnings));

        // Generate reports
        if (['admin','headteacher'].includes(role || '')) {
          const termsEndingSoon = await getTermsEndingSoon(7);
          const storedReports = await AsyncStorage.getItem(REPORTS_GENERATED_KEY);
          let generatedReports = storedReports ? JSON.parse(storedReports) : [];

          for (const term of termsEndingSoon) {
            const reportId = `term-report-${term.id}`;
            if (!generatedReports.includes(reportId)) {
              const [allGrades, allSubjects] = await Promise.all([getAllGrades(), getAllSubjects()]);

              const approvedGrades = allGrades.filter(g => g.status === 'approved');

              // Group grades by student
              const gradesByStudentMap = new Map<string, Grade[]>();
              approvedGrades.forEach(g => {
                if (!gradesByStudentMap.has(g.studentId)) gradesByStudentMap.set(g.studentId, []);
                gradesByStudentMap.get(g.studentId)!.push(g);
              });

              const gradesByStudent = Array.from(gradesByStudentMap.entries()).map(([studentId, studentGrades]) => ({
                studentId,
                studentName: allUsers.find(u => u.uid === studentId)?.name || 'Unknown',
                grades: studentGrades,
                averagePercentage: studentGrades.reduce((s,g)=>s+g.gradePercentage,0)/studentGrades.length,
              }));

              // Group grades by subject
              const gradesBySubjectMap = new Map<string, Grade[]>();
              approvedGrades.forEach(g => {
                if (!gradesBySubjectMap.has(g.subjectId)) gradesBySubjectMap.set(g.subjectId, []);
                gradesBySubjectMap.get(g.subjectId)!.push(g);
              });

              const gradesBySubject = Array.from(gradesBySubjectMap.entries()).map(([subjectId, subjectGrades]) => ({
                subjectId,
                subjectName: allSubjects.find(s => s.id===subjectId)?.name || 'Unknown',
                grades: subjectGrades,
                averagePercentage: subjectGrades.reduce((s,g)=>s+g.gradePercentage,0)/subjectGrades.length,
              }));

              const downloadURL = await generateAndUploadGradeReport(
                gradesByStudent,
                gradesBySubject,
                approvedGrades,
                allUsers,
                allSubjects,
                `${term.name}_${term.academicYearId}`
              );

              if (downloadURL) {
                console.log(`Report uploaded: ${downloadURL}`);
                generatedReports.push(reportId);
                await generateNotificationsForEvent({
                  id: `report-${term.id}`,
                  title: `End-of-term report for ${term.name}`,
                  description: `A grade report for ${term.name} has been generated.`,
                  startDate: Timestamp.fromDate(new Date()),
                  endDate: Timestamp.fromDate(new Date()),
                  type: 'school-event',
                  audience: 'admin',
                  createdByUserId: 'system',
                });
              }
            }
          }

          await AsyncStorage.setItem(REPORTS_GENERATED_KEY, JSON.stringify(generatedReports));
        }

      } catch (err) {
        console.error('Error in async tasks:', err);
      }
    };

    asyncTasks();

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [fontsLoaded, loading, user, role]);

  // --- Render ---
  if (!fontsLoaded) return null;

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(headteacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(settings)" options={{ headerShown: false }} />
        <Stack.Screen name="(main)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
