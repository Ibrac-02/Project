import Constants from 'expo-constants';
import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AboutScreen() {
  const version = Constants.expoConfig?.version || '1.0.0';

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>About</Text>

        <View style={styles.card}>
          <Text style={styles.row}><Text style={styles.label}>App:</Text> Mai Aisha Academy</Text>
          <Text style={styles.row}><Text style={styles.label}>Version:</Text> {version}</Text>
          <Text style={styles.row}><Text style={styles.label}>Contact:</Text> support@maiaisha.academy</Text>
        </View>

        <TouchableOpacity onPress={() => Linking.openURL('mailto:support@maiaisha.academy')} style={styles.button}>
          <Text style={styles.buttonText}>Contact Support</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: '#fff',
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



