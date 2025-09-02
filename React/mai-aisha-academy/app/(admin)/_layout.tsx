
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
            height: 120, // Set header height
          },
          headerTintColor: '#fff', // White color for header title and back button
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center', // Center the header title
        }}
      />
      <Stack.Screen
        name="ManageUsersScreen"
        options={{
          headerShown: true,
          title: 'Manage Users',
          headerStyle: {
            backgroundColor: '#1E90FF',
            height: 120, // Set header height
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center', // Center the header title
        }}
      />
      <Stack.Screen
        name="EditUserScreen"
        options={{
          headerShown: true,
          title: 'Edit User',
          headerStyle: {
            backgroundColor: '#1E90FF',
            height: 120, // Set header height
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center', // Center the header title
        }}
      />
      <Stack.Screen
        name="GradeReportsScreen"
        options={{
          headerShown: true,
          title: 'Grade Reports',
          headerStyle: {
            backgroundColor: '#1E90FF',
            height: 120, // Set header height
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center', // Center the header title
        }}
      />
      <Stack.Screen
        name="ManageSchoolDataScreen"
        options={{
          headerShown: true,
          title: 'Manage School Data',
          headerStyle: {
            backgroundColor: '#1E90FF',
            height: 120, // Set header height
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center', // Center the header title
        }}
      />
    </Stack>
  );
}
