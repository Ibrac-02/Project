import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/lib/auth';
import { SplashScreen } from 'expo-router';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { user, loading, role } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect unauthenticated users to the login screen
        // (auth) is the group for login and sign-up
        // TODO: Handle redirection based on the current path, avoid infinite loops
        // For now, it will always go to login
        if (role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else if (role === 'headteacher') {
          router.replace('/(headteacher)/dashboard');
        } else if (role === 'teacher') {
          router.replace('/(teacher)/dashboard');
        } else {
          router.replace('/(auth)/login');
        }
      } else {
        // Redirect authenticated users to their respective dashboards
        if (role === 'admin') {
          router.replace('/(admin)/dashboard');
        } else if (role === 'headteacher') {
          router.replace('/(headteacher)/dashboard');
        } else if (role === 'teacher') {
          router.replace('/(teacher)/dashboard');
        } else {
          router.replace('/(tabs)');
        }
      }
    }
  }, [user, loading, role]);

  if (!loaded || loading) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        {user ? (
          // Authenticated routes
          <>
            {role === 'admin' && (
              <Stack.Screen name="(admin)" options={{ headerShown: false }} />
            )}
            {role === 'headteacher' && (
              <Stack.Screen name="(headteacher)" options={{ headerShown: false }} />
            )}
            {role === 'teacher' && (
              <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
            )}
            {role === null && (
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            )}
          </>
        ) : (
          // Unauthenticated routes
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
