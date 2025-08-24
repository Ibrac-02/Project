import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function SplashScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Logo placeholder - you'll need to add your actual logo image */}
        <View style={styles.logoPlaceholder}>
          <Text style={styles.logoText}>MAI AISHA ACADEMY</Text>
          <View style={styles.bookIcon}>
            <Text style={styles.bookText}>📚</Text>
          </View>
          <View style={styles.ribbonContainer}>
            <Text style={styles.ribbonText}>KNOWLEDGE IS LIGHT</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.academyName}>Mai Aisha Academy</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoPlaceholder: {
    width: 200,
    height: 200,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#1e3a8a',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 10,
  },
  bookIcon: {
    marginVertical: 10,
  },
  bookText: {
    fontSize: 40,
  },
  ribbonContainer: {
    marginTop: 10,
  },
  ribbonText: {
    fontSize: 12,
    color: '#1e3a8a',
    fontWeight: '600',
    textAlign: 'center',
  },
  academyName: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 20,
  },
}); 