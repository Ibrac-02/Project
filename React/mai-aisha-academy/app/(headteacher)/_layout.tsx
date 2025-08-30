
import { Stack } from 'expo-router';

export default function HeadteacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Headteacher Dashboard' }} />
    </Stack>
  );
}
