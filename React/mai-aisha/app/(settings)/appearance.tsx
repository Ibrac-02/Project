import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, TouchableOpacity, useColorScheme as useDeviceColorScheme, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/Colors';

type ThemePreference = 'light' | 'dark' | 'system';

export default function AppearanceScreen() {
  const navigation = useNavigation();
  const deviceColorScheme = useDeviceColorScheme();
  const { dark } = useTheme(); // Only need dark from useTheme for Colors indexing
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
      }
    };
    loadThemePreference();
  }, []);

  const saveThemePreference = async (preference: ThemePreference) => {
    try {
      await AsyncStorage.setItem('themePreference', preference);
      setThemePreference(preference);
    } catch (error) {
      console.error('Failed to save theme preference', error);
    }
  };

  // Determine the actual theme based on preference and device setting
  const currentTheme = themePreference === 'system' ? deviceColorScheme : themePreference;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Appearance' }} />
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Theme</ThemedText>
        {['light', 'dark', 'system'].map((preference) => (
          <TouchableOpacity
            key={preference}
            style={styles.optionItem}
            onPress={() => saveThemePreference(preference as ThemePreference)}
          >
            <ThemedText style={styles.optionText}>
              {preference.charAt(0).toUpperCase() + preference.slice(1)}
            </ThemedText>
            {
              themePreference === preference && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={Colors[dark ? 'dark' : 'light'].tint}
                />
              )
            }
          </TouchableOpacity>
        ))}
      </View>
      {/* Future settings like accent color, font size can go here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
  },
});


