import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../lib/auth';

export default function AuthLayout() {
  const { user, loading, role } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      if (role === 'admin') router.replace('/(admin)/dashboard');
      else if (role === 'headteacher') router.replace('/(headteacher)/dashboard');
      else if (role === 'teacher') router.replace('/(teacher)/dashboard');
    }
  }, [user, loading, role]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}
