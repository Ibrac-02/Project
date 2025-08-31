
import { Stack } from 'expo-router';
import React from 'react';

export default function TeacherLayout() {
  return (
    <Stack>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ title: 'My Profile' }} />
      <Stack.Screen name="ManageSubjectsScreen" options={{ title: 'My Subjects' }} />
      <Stack.Screen name="GradeEntryScreen" options={{ title: 'Grade Entry' }} />
      <Stack.Screen
        name="TeacherPerformanceScreen"
        options={{
          headerShown: true,
          title: 'My Performance',
          headerStyle: {
            backgroundColor: '#1E90FF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </Stack>
  );
}
 