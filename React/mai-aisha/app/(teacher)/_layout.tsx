import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function TeacherLayout() {
  return (
    <>
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
        <Stack.Screen name="lesson-plan" options={{ headerShown: true }} />
        <Stack.Screen name="grade-screen" options={{ headerShown: true }} />
        <Stack.Screen name="attendance" options={{ headerShown: true }} />
        <Stack.Screen name="performance-screen" options={{ headerShown: true }} />
      </Stack>
      <StatusBar style='auto' />
    </>
  );
}
