import React, { useMemo } from 'react';
import { View, Platform } from 'react-native';
import { usePathname } from 'expo-router';
import { useAuth } from '@/lib/auth';

// Keep height in sync with BottomNav HEIGHT
const HEIGHT = 70;

export default function BottomNavSpacer() {
  const pathname = usePathname();
  const { user } = useAuth();

  const hidden = useMemo(() => {
    const p = pathname || '';
    return (
      p.startsWith('/(auth)') ||
      p.includes('/(auth)/') ||
      p === '/(auth)' ||
      p === '/' ||
      p === '/index' ||
      p.endsWith('/index')
    );
  }, [pathname]);

  if (hidden || !user) return null;

  // Provide a spacer only when the BottomNav is visible so content isn't obscured.
  return <View style={{ height: HEIGHT + (Platform.OS === 'ios' ? 10 : 6) }} />;
}
