import React, { useState } from 'react';
import { ScrollView, StyleSheet, View, TouchableOpacity, Text } from 'react-native';
import { NotificationBell } from './components/NotificationBell';
import { NotificationCard } from './components/NotificationCard';
import { NotificationList } from './components/NotificationList';
import { NotificationInput } from './components/NotificationInput';
import { ThemedText } from './components/ThemedText';
import { ThemedView } from './components/ThemedView';

export default function NotificationsPreview() {
  const [showNotificationInput, setShowNotificationInput] = useState(false);
  const [mockTargetUsers] = useState(['user1', 'user2', 'user3']); // Mock user IDs

  const handleBellPress = () => {
    console.log('Notification bell pressed - navigate to notifications list');
  };

  const handleNotificationSent = (notification: any) => {
    console.log('Notification sent:', notification);
  };

  const handleNotificationPress = (notification: any) => {
    console.log('Notification pressed:', notification);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Notification Bell */}
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Mai Aisha Academy
          </ThemedText>
          <View style={styles.headerRight}>
            <NotificationBell 
              onPress={handleBellPress}
              size={28}
              color="#1E90FF"
            />
          </View>
        </View>

        {/* Demo Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Notification Components Demo
          </ThemedText>
          
          <View style={styles.demoGrid}>
            {/* Notification Bell Demo */}
            <View style={styles.demoCard}>
              <ThemedText style={styles.demoTitle}>Notification Bell</ThemedText>
              <ThemedText style={styles.demoDescription}>
                Shows unread notification count only
              </ThemedText>
              <View style={styles.demoContent}>
                <NotificationBell 
                  onPress={handleBellPress}
                  size={32}
                  color="#1E90FF"
                />
              </View>
            </View>

            {/* Notification Card Demo */}
            <View style={styles.demoCard}>
              <ThemedText style={styles.demoTitle}>Notification Card</ThemedText>
              <ThemedText style={styles.demoDescription}>
                Separate card for writing messages
              </ThemedText>
              <NotificationCard
                onNotificationSent={handleNotificationSent}
                targetUserIds={mockTargetUsers}
                style={styles.cardDemo}
              />
            </View>
          </View>
        </View>

        {/* Full Screen Notification Input Button */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.fullScreenButton}
            onPress={() => setShowNotificationInput(true)}
          >
            <Text style={styles.fullScreenButtonText}>
              Open Full Screen Notification Input
            </Text>
          </TouchableOpacity>
        </View>

        {/* Notification List Demo */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>
            Notifications List
          </ThemedText>
          <View style={styles.listContainer}>
            <NotificationList
              onNotificationPress={handleNotificationPress}
              style={styles.listDemo}
            />
          </View>
        </View>
      </ScrollView>

      {/* Full Screen Notification Input Modal */}
      <NotificationInput
        visible={showNotificationInput}
        onClose={() => setShowNotificationInput(false)}
        onNotificationSent={handleNotificationSent}
        preselectedUsers={mockTargetUsers}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1E90FF',
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 15,
    textAlign: 'center',
    color: '#333',
  },
  demoGrid: {
    gap: 20,
  },
  demoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 5,
    color: '#333',
  },
  demoDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  demoContent: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  cardDemo: {
    marginTop: 0,
    marginVertical: 0,
  },
  fullScreenButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
  },
  fullScreenButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    height: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listDemo: {
    backgroundColor: 'transparent',
  },
});