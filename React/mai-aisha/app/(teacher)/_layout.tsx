import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E90FF', 
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 18, 
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="lesson-plan" options={{ headerShown: false }} />
      <Stack.Screen name="grade-screen" options={{ headerShown: false }} />
      <Stack.Screen name="attendance" options={{ headerShown: false }} />
      <Stack.Screen name="performance-screen" options={{ headerShown: false }} />
    </Stack>
  );
}
