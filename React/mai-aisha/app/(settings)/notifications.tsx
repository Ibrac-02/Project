import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { pushNotificationService, sendSchoolNotification, NotificationTypes } from '@/lib/pushNotifications';
import { useTheme } from '@/contexts/ThemeContext';

export default function NotificationsSettingsScreen() {
  const { colors } = useTheme();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await pushNotificationService.getSettings();
      setPushEnabled(settings.pushEnabled);
      setEmailEnabled(settings.emailEnabled);
      setSoundEnabled(settings.soundEnabled);
      setVibrationEnabled(settings.vibrationEnabled);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: boolean) => {
    try {
      await pushNotificationService.updateSettings({ [key]: value });
      
      if (key === 'pushEnabled' && value) {
        Alert.alert(
          'Push Notifications Enabled',
          'You will now receive push notifications for important school updates.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Failed to update notification setting:', error);
      Alert.alert('Error', 'Failed to update notification settings. Please try again.');
    }
  };

  const handlePushToggle = async (value: boolean) => {
    setPushEnabled(value);
    await updateSetting('pushEnabled', value);
  };

  const handleEmailToggle = async (value: boolean) => {
    setEmailEnabled(value);
    await updateSetting('emailEnabled', value);
  };

  const handleSoundToggle = async (value: boolean) => {
    setSoundEnabled(value);
    await updateSetting('soundEnabled', value);
  };

  const handleVibrationToggle = async (value: boolean) => {
    setVibrationEnabled(value);
    await updateSetting('vibrationEnabled', value);
  };

  const sendTestNotification = async () => {
    try {
      await sendSchoolNotification(
        NotificationTypes.SYSTEM_UPDATE,
        'Test Notification',
        'This is a test notification from Mai Aisha Academy!'
      );
      Alert.alert('Success', 'Test notification sent! (Using stub - install expo-notifications for real functionality)');
    } catch {
      Alert.alert('Error', 'Failed to send test notification.');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.label, { color: colors.text }]}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}>
      <View style={styles.container}>
        {/* Push Notifications Section */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Push Notifications</Text>
          
          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Enable Push Notifications</Text>
              <Text style={[styles.description, { color: colors.icon }]}>
                Receive notifications for announcements, grades, and attendance
              </Text>
            </View>
            <Switch 
              value={pushEnabled} 
              onValueChange={handlePushToggle}
              trackColor={{ false: colors.border, true: colors.primaryBlue }}
            />
          </View>

          {pushEnabled && (
            <>
              <View style={styles.row}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Sound</Text>
                  <Text style={[styles.description, { color: colors.icon }]}>
                    Play sound when notifications arrive
                  </Text>
                </View>
                <Switch 
                  value={soundEnabled} 
                  onValueChange={handleSoundToggle}
                  trackColor={{ false: colors.border, true: colors.primaryBlue }}
                />
              </View>

              <View style={styles.row}>
                <View style={styles.labelContainer}>
                  <Text style={[styles.label, { color: colors.text }]}>Vibration</Text>
                  <Text style={[styles.description, { color: colors.icon }]}>
                    Vibrate when notifications arrive
                  </Text>
                </View>
                <Switch 
                  value={vibrationEnabled} 
                  onValueChange={handleVibrationToggle}
                  trackColor={{ false: colors.border, true: colors.primaryBlue }}
                />
              </View>

              <TouchableOpacity 
                style={[styles.testButton, { backgroundColor: colors.primaryBlue }]} 
                onPress={sendTestNotification}
              >
                <Ionicons name="notifications-outline" size={20} color="#fff" />
                <Text style={styles.testButtonText}>Send Test Notification</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Email Notifications Section */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Email Notifications</Text>
          
          <View style={styles.row}>
            <View style={styles.labelContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Email Updates</Text>
              <Text style={[styles.description, { color: colors.icon }]}>
                Receive important updates via email
              </Text>
            </View>
            <Switch 
              value={emailEnabled} 
              onValueChange={handleEmailToggle}
              trackColor={{ false: colors.border, true: colors.primaryBlue }}
            />
          </View>
        </View>

        {/* Information Section */}
        <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.infoRow}>
            <Ionicons name="information-circle-outline" size={24} color={colors.primaryBlue} />
            <View style={styles.infoText}>
              <Text style={[styles.infoTitle, { color: colors.text }]}>About Notifications</Text>
              <Text style={[styles.infoDescription, { color: colors.icon }]}>
                You&apos;ll receive notifications for important school updates including new announcements, 
                grade updates, attendance reminders, and system notifications.
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
});



