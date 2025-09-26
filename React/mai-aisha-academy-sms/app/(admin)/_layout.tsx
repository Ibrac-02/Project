
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Admin Dashboard' }} />
      <Stack.Screen
        name="create-user"
        options={{
          headerShown: true,
          title: 'Create New User',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '500',
          },
          headerTitleAlign: 'left',
        }}
      />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Supervisor Profile',
          headerStyle: { 
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff', // White color for header title and back button
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'left', // left the header title
        }}
      />
      <Stack.Screen
        name="manage-user"
        options={{
          headerShown: true,
          title: 'Manage Users',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '500',
          },
          headerTitleAlign: 'left', // left the header title
        }}
      />
      <Stack.Screen
        name="edit-user"
        options={{
          headerShown: true,
          title: 'Edit User',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '500',
          },
          headerTitleAlign: 'left', // left the header title
        }}
      />
      <Stack.Screen
        name="grade-report"
        options={{
          headerShown: true,
          title: 'Grade Reports',
          headerStyle: { 
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '500',
          },
          headerTitleAlign: 'left', // left the header title
        }}
      />
      <Stack.Screen
        name="school-data"
        options={{
          headerShown: true,
          title: 'Manage School Data',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '500',
          },
          headerTitleAlign: 'left', // left the header title
        }}
      />
    </Stack>
  );
}
