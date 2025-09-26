import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { router, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';  
import React, { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/auth';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, loading, role } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!loaded || loading || hasRedirected.current) return;

    if (!user) {
      hasRedirected.current = true;
      router.replace('/(auth)/login');
      return;
    }

    hasRedirected.current = true;
    switch (role) {
      case 'admin': router.replace('/(admin)/dashboard'); break;
      case 'teacher': router.replace('/(teacher)/dashboard'); break;
      case 'headteacher': router.replace('/(headteacher)/dashboard'); break;
      default: router.replace('/(auth)/login');
    }
  }, [user, loading, role, loaded]);

  // 🟢 Show splash while loading auth or fonts
  if (!loaded || loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(headteacher)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" />
      </Stack>
      <StatusBar style = "auto"/>
    </ThemeProvider>
  );
}
