import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, usePathname } from 'expo-router';
import { useAuth } from '@/lib/auth';
import { getUnreadNotificationsCount } from '@/lib/notifications';

export default function BottomNav() {
  const pathname = usePathname();
  const { user, role } = useAuth();
  const [unread, setUnread] = useState(0);

  const hidden = useMemo(() => {
    // Hide on auth and on the root index splash if any
    return pathname?.startsWith('/(auth)');
  }, [pathname]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (user?.uid) {
          const c = await getUnreadNotificationsCount(user.uid);
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

  if (hidden) return null;

  const goHome = () => {
    if (role === 'admin') router.replace('/(admin)/dashboard');
    else if (role === 'teacher') router.replace('/(teacher)/dashboard');
    else if (role === 'headteacher') router.replace('/(headteacher)/dashboard');
    else router.replace('/(main)/announcements');
  };

  const goNotifications = () => router.replace('/(main)/announcements');
  const goProfile = () => router.replace('/(settings)');

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bar}>
        <TouchableOpacity style={styles.item} onPress={goHome}>
          <View>
            <Ionicons name="home" size={26} color="#111" />
            {unread > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
              </View>
            )}
          </View>
          <Text style={styles.label}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={goNotifications}>
          <Ionicons name="notifications-outline" size={26} color="#666" />
          <Text style={styles.label}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.item} onPress={goProfile}>
          <View>
            <Ionicons name="person-circle-outline" size={28} color="#666" />
            <View style={styles.presenceDot} />
          </View>
          <Text style={styles.label}>You</Text>
        </TouchableOpacity>
      </View> 
    </View>
  );
}

const HEIGHT = 62;

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
    backgroundColor: '#f3f4f6',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 10 : 6,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
  },
  label: { color: '#555', marginTop: 2, fontSize: 12, fontWeight: '600' },
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
    borderColor: '#fff',
  },
});
