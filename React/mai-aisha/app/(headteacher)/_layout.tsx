
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function HeadteacherLayout() {
  const goBackToDashboard = () => {
    router.replace('/(headteacher)/dashboard');
  };

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
        headerLeft: ({ canGoBack }) => 
          canGoBack ? (
            <TouchableOpacity onPress={goBackToDashboard} style={{ marginLeft: 10 }}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
          ) : null,
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
