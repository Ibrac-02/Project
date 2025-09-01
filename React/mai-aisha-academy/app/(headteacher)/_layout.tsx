
import { Stack } from 'expo-router';

export default function HeadteacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Headteacher Dashboard' }} />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Headteacher Profile',
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
        name="ManageSubjectsScreen"
        options={{
          headerShown: true,
          title: 'Manage Subjects',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="GradeApprovalScreen"
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
        }}
      />
      <Stack.Screen
        name="ClassPerformanceAnalyticsScreen"
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
        }}
      />
      <Stack.Screen
        name="ManageTeachersScreen"
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
        }}
      />
    </Stack>
  );
}
