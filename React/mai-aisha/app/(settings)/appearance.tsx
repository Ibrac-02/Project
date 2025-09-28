import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/contexts/ThemeContext';

type ThemePreference = 'light' | 'dark' | 'system';

export default function AppearanceScreen() {
  const { colors, themePreference, setThemePreference } = useTheme();

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: 'Appearance' }} />
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>Theme</ThemedText>
        {['light', 'dark', 'system'].map((preference) => (
          <TouchableOpacity
            key={preference}
            style={styles.optionItem}
            onPress={() => setThemePreference(preference as ThemePreference)}
          >
            <ThemedText style={styles.optionText}>
              {preference.charAt(0).toUpperCase() + preference.slice(1)}
            </ThemedText>
            {
              themePreference === preference && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primaryBlue}
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


