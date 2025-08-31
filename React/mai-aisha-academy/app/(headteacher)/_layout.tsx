
import { Stack } from 'expo-router';

export default function HeadteacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false, title: 'Headteacher Dashboard' }} />
      <Stack.Screen
        name="profile"
        options={{
          headerShown: true,
          title: 'Headteacher Profile',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff', // White color for header title and back button
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
