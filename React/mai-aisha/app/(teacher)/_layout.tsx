import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TeacherLayout() {
  const goBackToDashboard = () => {
    router.replace('/(teacher)/dashboard');
  };

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
          headerTitleAlign: 'left',
          headerLeft: ({ canGoBack }) => 
            canGoBack ? (
              <TouchableOpacity onPress={goBackToDashboard} style={{ marginLeft: 10 }}>
                <Ionicons name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            ) : null,
        }}
      >
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="lesson-plan" options={{ headerShown: true , title: 'My Lesson Plan' }} />
        <Stack.Screen name="grade-screen" options={{ headerShown: true , title: 'My Grade Screen' }} />
        <Stack.Screen name="attendance" options={{ headerShown: true , title: 'My Attendance' }} />
        <Stack.Screen name="performance-screen" options={{ headerShown: true , title: 'My Performance' }} />
        <Stack.Screen name="students" options={{ headerShown: true , title: 'My Students' }} />
        <StatusBar style='auto' />
      </Stack>
      
    </>
  );
}
