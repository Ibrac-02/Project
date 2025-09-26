import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1E90FF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
        headerTitleAlign: 'left',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
      <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Notifications' }} />
      <Stack.Screen name="appearance" options={{ headerShown: true, title: 'Appearance' }} />
      <Stack.Screen name="about" options={{ headerShown: true, title: 'About' }} />
      <Stack.Screen name="change-password" options={{ headerShown: true, title: 'Change Password' }} />
      <Stack.Screen name="delete-account" options={{ headerShown: true, title: 'Delete Account' }} />
    </Stack>
  );
}
