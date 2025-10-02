import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { roleBasedGoBack, animatedGoBack } from '@/utils/navigation';
import { useAuth } from '@/lib/auth';

interface AnimatedBackButtonProps {
  fallbackRoute?: string;
  style?: ViewStyle;
  iconColor?: string;
  iconSize?: number;
  useRoleBasedNavigation?: boolean;
  onPress?: () => void;
}

export default function AnimatedBackButton({
  fallbackRoute,
  style,
  iconColor = '#fff',
  iconSize = 24,
  useRoleBasedNavigation = false,
  onPress,
}: AnimatedBackButtonProps) {
  const { role } = useAuth();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (useRoleBasedNavigation) {
      roleBasedGoBack(role);
    } else {
      animatedGoBack(fallbackRoute);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.backButton, style]}
      onPress={handlePress}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
      activeOpacity={0.6}
    >
      <Ionicons name="arrow-back" size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    padding: 12,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 48,
    minHeight: 48,
  },
});
