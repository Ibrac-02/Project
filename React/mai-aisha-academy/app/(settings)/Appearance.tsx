import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AppearanceSettingsScreen() {
  const scheme = useColorScheme();
  const [preference, setPreference] = useState<'system' | 'light' | 'dark'>('system');

  const effectiveTheme = useMemo(() => {
    return preference === 'system' ? scheme : preference;
  }, [preference, scheme]);

  const Option = ({ value, label }: { value: 'system' | 'light' | 'dark'; label: string }) => (
    <TouchableOpacity style={[styles.option, preference === value && styles.optionActive]} onPress={() => setPreference(value)}>
      <Text style={styles.optionText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Appearance</Text>
        <Text style={styles.subtitle}>Theme preference (applies next launch)</Text>

        <View style={styles.card}>
          <Option value="system" label="Use system setting" />
          <Option value="light" label="Light" />
          <Option value="dark" label="Dark" />
        </View>

        <Text style={styles.note}>Current effective theme: {effectiveTheme}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  optionActive: {
    borderColor: '#1E90FF',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  note: {
    marginTop: 12,
    fontSize: 13,
    color: '#666',
  },
});



