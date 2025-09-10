import React from 'react';
import { Stack } from 'expo-router';

export default function SettingsLayout() {
  return (
     <Stack
          screenOptions={{ 
            headerStyle: { 
              backgroundColor: '#1E90FF', // DodgerBlue color
              paddingVertical: 12, // makes header look taller
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
       <Stack.Screen name="(settings)" options={{ headerShown: false }} />    
      <Stack.Screen name="change-password" options={{title: 'Change Password',}}/>
      <Stack.Screen name="delete-account" options={{ title: 'Delete Account', }} />
    </Stack>
  );
}
