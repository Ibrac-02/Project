import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
    <Stack screenOptions={{ 
       headerStyle: {
          backgroundColor: '#1E90FF', 
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '500',
          fontSize: 20,
        },
        headerTitleAlign: 'left',
        }}>
      <Stack.Screen name="index" options={{ headerShown: true, title: 'Settings' }} />
      <Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="appearance" options={{ title: 'App Theme' }} />
      <Stack.Screen name="delete-account" options={{ title: 'Delete Account' }} />
      <Stack.Screen name="about" options={{ title: 'About' }} />
    </Stack>
  );
}
