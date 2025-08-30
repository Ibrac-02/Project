
import { Stack } from 'expo-router';

export default function TeacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Teacher Dashboard' }} />
    </Stack>
  );
}
