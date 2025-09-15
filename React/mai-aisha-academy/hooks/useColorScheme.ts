import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as useRNColorScheme } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

export function useColorScheme(): ColorSchemeName {
  const deviceColorScheme = useRNColorScheme();
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [isHydrated, setIsHydrated] = useState(false); // New state to track hydration

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem('themePreference');
        if (storedPreference) {
          setThemePreference(storedPreference as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsHydrated(true); // Mark as hydrated after loading preference
      }
    };
    loadThemePreference();
  }, []);

  if (!isHydrated) {
    return 'light'; // Or a loading state, or null, depending on desired behavior
  }

  return themePreference === 'system' ? deviceColorScheme : themePreference;
}
