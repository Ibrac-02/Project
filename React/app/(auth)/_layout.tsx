
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../lib/auth';

export default function AuthLayout() {
  const { user, loading, role } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      // If the user is logged in, redirect them to their respective dashboard
      if (role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else if (role === 'headteacher') {
        router.replace('/(headteacher)/dashboard');
      } else if (role === 'teacher') {
        router.replace('/(teacher)/dashboard');
      }
      
    }
  }, [user, loading, role]);

  return (
    <Stack>
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen
        name="announcements"
        options={{
          headerShown: true,
          title: 'Announcements',
          headerStyle: { backgroundColor: '#1E90FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen
        name="attendance"
        options={{
          headerShown: true,
          title: 'Attendance',
          headerStyle: { backgroundColor: '#1E90FF' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      />
      <Stack.Screen name="academic-calendar" options={{ headerShown: false }} />
    </Stack>
  );
}
