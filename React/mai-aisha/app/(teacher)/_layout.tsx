import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AnimatedBackButton from '@/components/AnimatedBackButton';
import { useTheme } from '@/contexts/ThemeContext';

export default function TeacherLayout() {
  const { colors } = useTheme();
  return (
    <>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primaryBlue, 
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '500',
            fontSize: 18, 
          },
          headerTitleAlign: 'left',
          headerLeft: ({ canGoBack }) => 
            canGoBack ? (
              <AnimatedBackButton 
                fallbackRoute="/(teacher)/dashboard" 
                style={{ marginLeft: 10 }}
              />
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
