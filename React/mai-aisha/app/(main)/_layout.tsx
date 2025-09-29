import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function MainLayout() {
  return (
    <Stack screenOptions={{  headerStyle: {
          backgroundColor: '#1E90FF', 
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
        headerTitleAlign: 'left',
        }}>
      <Stack.Screen name="announcements" options={{ title: 'Announcements' }} />
      <Stack.Screen name="attendance" options={{ title: 'Attendance' }} />
      <Stack.Screen name="academic-calendar" options={{ title: 'Calendar', headerShown: true}} />
      <StatusBar style="auto" />
    </Stack>
  ); 
}
