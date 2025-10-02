import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { useTheme } from '@/contexts/ThemeContext';

interface AnimatedLoaderProps {
  text?: string;
  size?: 'small' | 'large';
  style?: any;
}

export default function AnimatedLoader({ 
  text = 'Loading...', 
  size = 'large',
  style 
}: AnimatedLoaderProps) {
  const { colors } = useTheme();
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    // Rotation animation
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1
    );

    // Pulse animation
    scale.value = withRepeat(
      withTiming(1.1, {
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${rotation.value}deg` },
        { scale: scale.value }
      ],
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scale.value,
      [1, 1.1],
      [0.7, 1]
    );
    
    return {
      opacity,
    };
  });

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.loaderContainer, animatedStyle]}>
        <ActivityIndicator 
          size={size} 
          color={colors.primaryBlue} 
        />
      </Animated.View>
      
      <Animated.Text style={[
        styles.loadingText, 
        { color: colors.text },
        textAnimatedStyle
      ]}>
        {text}
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loaderContainer: {
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});
