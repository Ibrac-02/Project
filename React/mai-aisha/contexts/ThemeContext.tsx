import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

type ThemePreference = 'light' | 'dark' | 'system';
type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  colorScheme: ColorScheme;
  colors: typeof Colors.light;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const deviceColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Determine actual color scheme based on preference
  const colorScheme: ColorScheme = themePreference === 'system' 
    ? (deviceColorScheme ?? 'light') 
    : themePreference;

  const colors = Colors[colorScheme];

  // Load theme preference from storage
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem('themePreference');
        if (storedPreference) {
          setThemePreferenceState(storedPreference as ThemePreference);
        }
      } catch (error) {
        console.error('Failed to load theme preference', error);
      } finally {
        setIsLoaded(true);
      }
    };
    loadThemePreference();
  }, []);

  // Save theme preference to storage
  const setThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem('themePreference', preference);
      setThemePreferenceState(preference);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  // Don't render until theme is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{
      colorScheme,
      colors,
      themePreference,
      setThemePreference,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
