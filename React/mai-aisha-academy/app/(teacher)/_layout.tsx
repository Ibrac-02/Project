
import { Stack } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';

export default function TeacherLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{
        headerShown: true,
        title: 'My Profile',
        headerStyle: { backgroundColor: Colors.primaryBlue }, // Use the consistent blue color
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }} />
      <Stack.Screen name="ManageSubjectsScreen" options={{
        headerShown: true,
        title: 'My Subjects',
        headerStyle: { backgroundColor: Colors.primaryBlue }, // Use the consistent blue color
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }} />
      <Stack.Screen name="GradeEntryScreen" options={{
        headerShown: true,
        title: 'Grade Entry',
        headerStyle: { backgroundColor: Colors.primaryBlue }, // Use the consistent blue color
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
      }} />
      <Stack.Screen
        name="students"
        options={{
          headerShown: true,
          title: 'My Students',
          headerStyle: {
            backgroundColor: Colors.primaryBlue, // Use the consistent blue color
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="ManageAssignmentsScreen"
        options={{
          headerShown: true,
          title: 'Manage Assignments',
          headerStyle: {
            backgroundColor: Colors.primaryBlue,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen
        name="TeacherPerformanceScreen"
        options={{
          headerShown: true,
          title: 'My Performance',
          headerStyle: {
            backgroundColor: Colors.primaryBlue,
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
 