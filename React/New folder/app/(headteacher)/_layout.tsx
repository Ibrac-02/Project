
import { Stack } from 'expo-router';

export default function HeadteacherLayout() {
  return (
    <Stack screenOptions={{
          headerShown: true,
          title: 'Headteacher Profile', 
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff', // White color for header title and back button
          headerTitleStyle: {
            fontWeight: 500,
          },
          headerTitleAlign: 'center', // Center the header title
        }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Headteacher Dashboard' }} />
      <Stack.Screen name="lesson-plan-screen" options={{ headerShown: false }} />
      <Stack.Screen
        name="profile"
        
      />
      <Stack.Screen
        name="manage-subject-screen"
        options={{
          headerShown: true,
          title: 'Subject Allocation',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 500,
          },
          headerTitleAlign: 'center', // Center the header title
        }}
      />
      <Stack.Screen
        name="grade-approval-screen"
        options={{
          headerShown: true,
          title: 'Approve Grades',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center', // Center the header title
        }}
      />
      <Stack.Screen
        name="performance-analytic-screen"
        options={{
          headerShown: true,
          title: 'Class Performance',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center', // Center the header title
        }}
      />
      <Stack.Screen
        name="manage-teacher-screen"
        options={{
          headerShown: true,
          title: 'Manage Teachers',
          headerStyle: {
            backgroundColor: '#1E90FF',
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
