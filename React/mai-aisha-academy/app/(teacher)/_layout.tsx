import { Stack } from 'expo-router';
import React from 'react';

export default function TeacherLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { 
          backgroundColor: '#1E90FF', // DodgerBlue color
          paddingVertical: 16, // makes header look taller
        },
        headerTintColor: '#fff',
        headerTitleStyle: { 
          fontWeight: 'bold', 
          fontSize: 20, // bigger text
        },
        headerTitleAlign: 'center',
        headerBackTitleVisible: false, // removes back button text
      }}
    >
      <Stack.Screen 
        name="dashboard" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ title: 'My Profile' }} 
      />
      <Stack.Screen 
        name="ManageSubjectsScreen" 
        options={{ title: 'Manage Subjects' }} 
      />
      <Stack.Screen 
        name="GradeEntryScreen" 
        options={{ title: 'Grade Entry' }} 
      />
      <Stack.Screen 
        name="students" 
        options={{ title: 'My Students' }} 
      />
      <Stack.Screen 
        name="ManageAssignmentsScreen" 
        options={{ title: 'Manage Assignments' }} 
      />
      <Stack.Screen 
        name="TeacherPerformanceScreen" 
        options={{ title: 'My Performance' }} 
      />
    </Stack>
  );
}
