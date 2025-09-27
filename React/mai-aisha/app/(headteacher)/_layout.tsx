
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function HeadteacherLayout() {
  return (
    <Stack
      screenOptions={{
         headerStyle: {
          backgroundColor: '#1E90FF', 
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
        headerTitleAlign: 'left',
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="teacher-supervision" options={{ headerShown: true, title: 'Teacher Supervision' }} />
      <Stack.Screen name="reports-approvals" options={{ headerShown: true, title: 'Approve Reports' }} />
      <Stack.Screen name="exams" options={{ headerShown: true, title: 'Exams' }} />
      <Stack.Screen name="announcements" options={{ headerShown: true, title: 'Announcements' }} />
      <Stack.Screen name="view-lesson-plans" options={{ headerShown: true, title: 'Lesson Plans' }} />
      <StatusBar style='auto' />
      
    </Stack>
  );
}
