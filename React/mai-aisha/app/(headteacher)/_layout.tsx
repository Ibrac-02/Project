
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
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="teacher-supervision" options={{ headerShown: false, title: 'Teacher Supervision' }} />
      <Stack.Screen name="reports-approvals" options={{ headerShown: false, title: 'Approve Reports' }} />
      <Stack.Screen name="exams" options={{ headerShown: false, title: 'Exams' }} />
      <Stack.Screen name="announcements" options={{ headerShown: false, title: 'Announcements' }} />
      
    </Stack>
  );
}
