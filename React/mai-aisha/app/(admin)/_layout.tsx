
import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Admin Dashboard' }} />
      <Stack.Screen name="(settings)/index" options={{ headerShown: false, title: 'Settings' }} />
      <Stack.Screen name="(main)/index" options={{ headerShown: false, title: 'Main' }} />
    </Stack>
  );
}
