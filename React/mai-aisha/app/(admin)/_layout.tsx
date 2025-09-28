import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

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
      
      {/* Student Pages */}
      <Stack.Screen name="students" options={{ headerShown: true, title: 'Students' }} />
      <Stack.Screen name="students/index" options={{ headerShown: true, title: 'Students' }} />
      <Stack.Screen name="students/new" options={{ headerShown: false }} />
      <Stack.Screen name="students/[id]" options={{ headerShown: false }} />
      <Stack.Screen name="students/import" options={{ headerShown: true, title: 'Import Students' }} />
      
      {/* Teachers Pages */}
      <Stack.Screen name="teachers" options={{ headerShown: true, title: 'Teachers' }} />
      <Stack.Screen name="teachers/index" options={{ headerShown: true, title: 'Teachers' }} />
      <Stack.Screen name="teachers/new" options={{ headerShown: false }} />
      <Stack.Screen name="teachers/[id]" options={{ headerShown: false }} />
      
      {/* Headteachers Pages */}
      <Stack.Screen name="headteachers" options={{ headerShown: true, title: 'Headteachers' }} />
      <Stack.Screen name="headteachers/index" options={{ headerShown: true, title: 'Headteachers' }} />
      <Stack.Screen name="headteachers/new" options={{ headerShown: false }} />
      <Stack.Screen name="headteachers/[id]" options={{ headerShown: false }} />
      <StatusBar style='auto' />
     </Stack>
  );
}

