import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';

export default function BlurTabBarBackground() {
  return <View style={[StyleSheet.absoluteFill, styles.translucent]} />;
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}

const styles = StyleSheet.create({
  translucent: {
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});
