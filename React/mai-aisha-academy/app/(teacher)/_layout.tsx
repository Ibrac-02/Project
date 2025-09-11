import { Stack } from 'expo-router';
import React from 'react';

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{ 
        headerStyle: { 
          backgroundColor: '#1E90FF', // DodgerBlue color
        },
        headerTintColor: '#fff',
        headerTitleStyle: { 
          fontWeight: 'bold', 
          fontSize: 20, // bigger text
        },
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="profile"  options={{ title: 'My Profile' }} />
      <Stack.Screen name="subject-screen" options={{ title: 'Manage Subjects' }} />
      <Stack.Screen name="grade-screen" options={{ title: 'Grade Entry' }} />
      <Stack.Screen name="students" options={{ title: 'My Students' }} />
      <Stack.Screen name="assignment-screen" options={{ title: 'Manage Assignments' }} />
      <Stack.Screen name="performance-screen" options={{ title: 'My Performance' }} />
      <Stack.Screen name="lesson-plan" options={{ headerShown: false }} />
       
    </Stack>
  );
}
