
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Admin Dashboard' }} />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Admin Profile',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff', // White color for header title and back button
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
