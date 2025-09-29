import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname, useSegments } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { getUnreadMessageCount } from '@/lib/messages';
import { useTheme } from '@/contexts/ThemeContext';

export default function BottomNav() {
  const pathname = usePathname();
  const segments = useSegments();
  const { user, role } = useAuth();
  const [unread, setUnread] = useState(0);
  const { colors } = useTheme();

  const hidden = useMemo(() => {
    // Hide on any auth route. Some environments may provide different path shapes, so cover common patterns.
    const p = pathname || '';
    return (
      // Root index (splash): when there is no first segment
      (!segments?.[0]) ||
      p.startsWith('/(auth)') ||
      p.includes('/(auth)/') ||
      p === '/(auth)' ||
      // Hide on splash/index routes
      p === '/' ||
      p === '/index' ||
      p.endsWith('/index') ||
      p === '/login' ||
      p === '/register' ||
      p.includes('/forgot-password')
    );
  }, [pathname, segments]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user?.uid) {
          const c = await getUnreadMessageCount(user.uid);
          if (mounted) setUnread(c);
        } else {
          if (mounted) setUnread(0);
        }
      } catch {
        if (mounted) setUnread(0);
      }
    })();
    return () => { mounted = false; };
  }, [user?.uid, pathname]);

  // Also hide when no authenticated user is present
  if (hidden || !user) return null;

  const goHome = () => {
    if (role === 'admin') router.replace('/(admin)/dashboard');
    else if (role === 'teacher') router.replace('/(teacher)/dashboard');
    else if (role === 'headteacher') router.replace('/(headteacher)/dashboard');
    else router.replace('/(main)/messages');
  };

  const goNotifications = () => router.replace('/(main)/messages');
  const goProfile = () => router.replace('/(settings)/profile');

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={[styles.bar, { backgroundColor: colors.primaryBlue }]}>
        <TouchableOpacity style={styles.item} onPress={goHome}>
          <View>
            <Ionicons name="home" size={26} color="#fff" />
          </View>
          <Text style={styles.label}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={goNotifications}>
          <View>
            <Ionicons name="notifications-outline" size={26} color="#fff" />
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </View>
          <Text style={styles.label}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={goProfile}>
          <View>
            <Ionicons name="person-circle-outline" size={28} color="#fff" />
            <View style={[styles.presenceDot, { borderColor: colors.primaryBlue }]} />
          </View>
          <Text style={styles.label}>You</Text>
        </TouchableOpacity>
      </View> 
    </View>
  );
}

const HEIGHT = 70;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    // allow touches to pass above except on the bar
  },
  bar: {
    height: HEIGHT,
    backgroundColor: '#1E90FF',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 14 : 10,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  label: { color: '#fff', marginTop: 2, fontSize: 12, fontWeight: '700' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    backgroundColor: 'red',
    borderRadius: 10,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  presenceDot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#86efac',
    borderWidth: 1,
    borderColor: '#1E90FF',
  },
});
