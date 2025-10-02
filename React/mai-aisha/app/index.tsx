import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { Image, StyleSheet, Text, View, ImageBackground } from 'react-native';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/(auth)/login');
    }, 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <ImageBackground 
      source={require('../assets/images/maa.bg.png')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Image source={require('../assets/images/maa.png')} style={styles.logo} />
        <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white overlay
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    borderRadius: 75,
    overflow: 'hidden',
  },
  schoolName: {
    color: '#1E90FF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});
