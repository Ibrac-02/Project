import Constants from 'expo-constants';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

export default function AboutScreen() {
  const { colors } = useTheme();
  const version = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.row, { color: colors.text }]}><Text style={[styles.label, { color: colors.text }]}>App:</Text> Mai Aisha Academy</Text>
          <Text style={[styles.row, { color: colors.text }]}><Text style={[styles.label, { color: colors.text }]}>Version:</Text> {version}</Text>
          <Text style={[styles.row, { color: colors.text }]}><Text style={[styles.label, { color: colors.text }]}>Contact:</Text> support@maiaisha.academy</Text>
          <Text style={[styles.row, { color: colors.text }]}><Text style={[styles.label, { color: colors.text }]}>Developed by:</Text> Ibrac02</Text>
        </View>

        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@maiaisha.academy')} style={[styles.button, { backgroundColor: colors.primaryBlue }]}>
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    borderRadius: 10,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  row: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  label: {
    fontWeight: '700',
  },
  button: {
    marginTop: 16,
    backgroundColor: '#1E90FF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});



