
import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Teacher Dashboard' }} />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Teacher Profile',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff', // White color for header title and back button
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="students"
        options={{
          headerShown: true,
          title: 'Manage Students',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
 