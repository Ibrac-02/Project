import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E90FF', // DodgerBlue color
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20, // bigger text
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="attendance" options={{ title: 'Manage Attendance' }} />
      <Stack.Screen name="grades" options={{ title: 'Academic Reports' }} />
      <Stack.Screen name="my-classes" options={{ title: 'My Classes' }} />
      <Stack.Screen name="students" options={{ title: 'My Students' }} />
      <Stack.Screen name="subjects" options={{ title: 'My Subjects' }} />
      <Stack.Screen name="upload-document" options={{ title: 'Upload Docs' }} />
      <Stack.Screen name="performance-screen" options={{ title: 'Performance' }} />
      <Stack.Screen name="lesson-plans" options={{ title: 'Manage Lesson Plans' }} />
    </Stack>
  );
}
 