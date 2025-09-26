
import { Stack } from 'expo-router';

export default function HeadteacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFD700', // Gold color for Headteacher
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
        headerTitleAlign: 'left',
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-plan-screen" options={{ title: 'View Lesson Plans' }} />
      <Stack.Screen name="grade-approval-screen" options={{title: 'Grade Approval'}}/>
      <Stack.Screen name="performance-analytics" options={{title:'Performance Analytics'}}/>
      <Stack.Screen name="manage-teacher-screen" options={{title:'Manage Teachers'}}/>
      <Stack.Screen name="reports" options={{title:'View Reports'}}/>
      <Stack.Screen name="timetable" options={{title:'Class Timetable'}}/>
      <Stack.Screen name="manage-subject-screen" options={{title:'My Subjects'}}/>
      <Stack.Screen name="profile" options={{title:'My Profile'}}/>
    </Stack>
  );
}
