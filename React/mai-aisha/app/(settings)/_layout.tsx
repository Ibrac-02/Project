import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack>
      {/* Make the index menu the entry for settings */}
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="appearance" options={{ title: 'Appearance' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Delete Account' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}
