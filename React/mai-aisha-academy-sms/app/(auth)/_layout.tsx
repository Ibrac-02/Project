import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      {/* In a group layout, screen names should be relative to this folder */}
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
    </Stack>
  );
}
 