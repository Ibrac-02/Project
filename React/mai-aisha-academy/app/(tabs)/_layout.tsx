import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../lib/auth';

export default function TabLayout() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  // Redirect based on role if they try to access a tab group directly
  // without being routed from the main app_layout
  if (role === 'admin' && location.pathname === '/admin') return <Redirect href="/(tabs)/admin" />;
  if (role === 'headteacher' && location.pathname === '/headteacher') return <Redirect href="/(tabs)/headteacher" />;
  if (role === 'teacher' && location.pathname === '/teacher') return <Redirect href="/(tabs)/teacher" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#1E90FF',
        headerShown: false,
      }}>
      {/* Admin Tabs */}
      {role === 'admin' && (
        <>
          <Tabs.Screen
            name="admin/index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="attendance"
            options={{
              title: 'Attendance',
              tabBarIcon: ({ color }) => <Ionicons name="checkbox-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
            }}
          />
        </>
      )}

      {/* Headteacher Tabs */}
      {role === 'headteacher' && (
        <>
          <Tabs.Screen
            name="headteacher/index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="attendance"
            options={{
              title: 'Attendance',
              tabBarIcon: ({ color }) => <Ionicons name="checkbox-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
            }}
          />
        </>
      )}

      {/* Teacher Tabs */}
      {role === 'teacher' && (
        <>
          <Tabs.Screen
            name="teacher/index"
            options={{
              title: 'Home',
              tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="attendance"
            options={{
              title: 'Attendance',
              tabBarIcon: ({ color }) => <Ionicons name="checkbox-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              title: 'Notifications',
              tabBarIcon: ({ color }) => <Ionicons name="notifications-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <Ionicons name="settings-outline" size={24} color={color} />,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profile',
              tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
            }}
          />
        </>
      )}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
});
