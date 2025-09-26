
import { Stack } from 'expo-router';

export default function HeadteacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFD700', // Gold color for Headteacher
        },
        headerTintColor: '#333',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="view-lesson-plans" options={{ title: 'View Lesson Plans' }} />
    </Stack>
  );
}
