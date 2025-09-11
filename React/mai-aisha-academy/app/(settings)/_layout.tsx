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
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="Profile" options={{ headerShown: true, title: 'Profile' }} />
      <Stack.Screen name="Notifications" options={{ headerShown: true, title: 'Notifications' }} />
      <Stack.Screen name="Appearance" options={{ headerShown: true, title: 'Appearance' }} />
      <Stack.Screen name="About" options={{ headerShown: true, title: 'About' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Delete Account' }} />
    </Stack>
  );
}
