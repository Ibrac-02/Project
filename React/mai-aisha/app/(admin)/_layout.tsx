import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{
        headerStyle: {
          backgroundColor: '#1E90FF', 
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
        headerTitleAlign: 'left',
         }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Admin Dashboard' }} />
      <Stack.Screen name="manage-user" options={{ headerShown: true, title: 'Manage Users' }} />
      <Stack.Screen name="school-data" options={{ headerShown: true, title: 'School Data' }} />
      <Stack.Screen name="grade-report" options={{ headerShown: true, title: 'Grade Report' }} />
    </Stack>
  );
}

