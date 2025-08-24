import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Dimensions, Image, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  useEffect(() => {
    // Navigate to login page after 3 seconds
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="dark" backgroundColor="#ffffff" />
      
      {/* Logo Container */}
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/maa.jpg')}
          style={styles.logoImage}
          resizeMode="contain"
        />
      </View>
      
      {/* Academy name below logo */}
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
    marginBottom: 30,
    justifyContent: 'center',
  },
  logoImage: {
    width: 250,
    height: 250,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 12,
  },
  academyName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1e3a8a',
    textAlign: 'center',
    marginTop: 20,
  },
}); 