
import { Stack } from 'expo-router';

export default function AuthLayout() {
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
      <Stack.Screen name="academicCalendar" options={{ headerShown: false }} />
    </Stack>
  );
}
