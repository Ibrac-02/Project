import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Admin Dashboard' }} />
      <Stack.Screen name="manage-user" options={{ headerShown: false, title: 'Manage Users' }} />
      <Stack.Screen name="school-data" options={{ headerShown: false, title: 'School Data' }} />
      <Stack.Screen name="grade-report" options={{ headerShown: false, title: 'Grade Report' }} />
      <Stack.Screen name="(settings)/index" options={{ headerShown: false, title: 'Settings' }} />
    </Stack>
  );
}

