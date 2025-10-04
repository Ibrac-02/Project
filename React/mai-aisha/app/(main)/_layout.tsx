import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

export default function MainLayout() {
  const { colors } = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primaryBlue,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
        headerTitleAlign: 'left',
      }}
    >
      <Stack.Screen name="announcements" options={{ title: 'Announcements' }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
      <Stack.Screen name="academic-calendar" options={{ title: 'Calendar', headerShown: true}} />
      <Stack.Screen name="messages" options={{ title: 'My Messages' }} />
      <StatusBar style="auto" />
    </Stack>
  );  
}
