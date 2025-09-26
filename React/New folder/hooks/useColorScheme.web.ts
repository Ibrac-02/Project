import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as useRNColorScheme } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme(): ColorSchemeName {
  const deviceColorScheme = useRNColorScheme();
  const [hasHydrated, setHasHydrated] = useState(false);
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');

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
        setHasHydrated(true);
      }
    };
    loadThemePreference();
  }, []);

  if (hasHydrated) {
    return themePreference === 'system' ? deviceColorScheme : themePreference;
  }

  return 'light';
}
