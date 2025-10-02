import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface PushNotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

const SETTINGS_KEY = 'push_notification_settings';
const TOKEN_KEY = 'expo_push_token';

class PushNotificationService {
  private expoPushToken: string | null = null;
  private settings: PushNotificationSettings = {
    pushEnabled: true,
    emailEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
  };

  async initialize(): Promise<void> {
    try {
      // Load saved settings
      await this.loadSettings();
      
      // Register for push notifications if enabled
      if (this.settings.pushEnabled) {
        await this.registerForPushNotifications();
      }
      
      // Set up notification listeners
      this.setupNotificationListeners();
    } catch (error) {
      console.error('Failed to initialize push notifications:', error);
    }
  }

  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      // Silently return null for simulators/emulators without warning
      return null;
    }

    try {
      // Check existing permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      // Request permissions if not granted
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Push notification permissions not granted');
        return null;
      }

      // Get push token
      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        console.error('Project ID not found in app config');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId,
      });

      this.expoPushToken = token.data;
      
      // Store token locally
      if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token.data);
      } else {
        await AsyncStorage.setItem(TOKEN_KEY, token.data);
      }
      
      console.log('Expo push token:', token.data);
      return token.data;
    } catch (error) {
      console.error('Failed to register for push notifications:', error);
      return null;
    }
  }

  private setupNotificationListeners(): void {
    // Handle notification received while app is in foreground
    Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received:', notification);
    });

    // Handle notification tapped
    Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      // Handle navigation based on notification data
      this.handleNotificationTap(response.notification);
    });
  }

  private handleNotificationTap(notification: Notifications.Notification): void {
    const data = notification.request.content.data;
    
    // Handle different notification types
    if (data?.type === 'announcement') {
      // Navigate to announcements
      console.log('Navigate to announcements');
    } else if (data?.type === 'grade') {
      // Navigate to grades
      console.log('Navigate to grades');
    } else if (data?.type === 'attendance') {
      // Navigate to attendance
      console.log('Navigate to attendance');
    }
  }

  async getSettings(): Promise<PushNotificationSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<PushNotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    await this.saveSettings();
    
    // Re-register if push notifications were enabled
    if (newSettings.pushEnabled && !this.expoPushToken) {
      await this.registerForPushNotifications();
    }
  }

  private async loadSettings(): Promise<void> {
    try {
      let savedSettings: string | null = null;
      
      if (Platform.OS === 'web') {
        savedSettings = localStorage.getItem(SETTINGS_KEY);
      } else {
        savedSettings = await AsyncStorage.getItem(SETTINGS_KEY);
      }
      
      if (savedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  }

  private async saveSettings(): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      } else {
        await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      }
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    }
  }

  async getExpoPushToken(): Promise<string | null> {
    if (this.expoPushToken) {
      return this.expoPushToken;
    }
    
    // Try to load from storage
    try {
      let token: string | null = null;
      
      if (Platform.OS === 'web') {
        token = localStorage.getItem(TOKEN_KEY);
      } else {
        token = await AsyncStorage.getItem(TOKEN_KEY);
      }
      
      if (token) {
        this.expoPushToken = token;
        return token;
      }
    } catch (error) {
      console.error('Failed to load push token:', error);
    }
    
    return null;
  }

  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    if (!this.settings.pushEnabled) {
      return;
    }

    try {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: this.settings.soundEnabled ? 'default' : undefined,
          autoDismiss: true, // Auto dismiss after few seconds
        },
        trigger: null, // Send immediately
      });

      // Auto-dismiss notification after 5 seconds
      setTimeout(async () => {
        try {
          await Notifications.dismissNotificationAsync(notificationId);
        } catch {
          console.log('Notification already dismissed or expired');
        }
      }, 5000); // 5 seconds
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  async scheduledNotification(
    title: string, 
    body: string, 
    trigger: Date | number,
    data?: any
  ): Promise<string | null> {
    if (!this.settings.pushEnabled) {
      return null;
    }

    try {
      let notificationTrigger: Notifications.NotificationTriggerInput;
      if (typeof trigger === 'number') {
        notificationTrigger = { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: trigger 
        };
      } else {
        // Convert Date to seconds from now
        const now = new Date().getTime();
        const triggerTime = trigger.getTime();
        const secondsFromNow = Math.max(1, Math.floor((triggerTime - now) / 1000));
        notificationTrigger = { 
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: secondsFromNow 
        };
      }

      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: this.settings.soundEnabled ? 'default' : undefined,
          autoDismiss: true, // Auto dismiss after few seconds
        },
        trigger: notificationTrigger,
      });

      // Auto-dismiss scheduled notification after 5 seconds once it appears
      setTimeout(async () => {
        try {
          await Notifications.dismissNotificationAsync(notificationId);
        } catch {
          console.log('Scheduled notification already dismissed or expired');
        }
      }, (typeof trigger === 'number' ? trigger : Math.max(1, Math.floor((trigger.getTime() - new Date().getTime()) / 1000))) * 1000 + 5000);
      
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getBadgeCount(): Promise<number> {
    try {
      return await Notifications.getBadgeCountAsync();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  async setBadgeCount(count: number): Promise<void> {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  async clearBadge(): Promise<void> {
    await this.setBadgeCount(0);
  }
}

// Export singleton instance
export const pushNotificationService = new PushNotificationService();

// Utility functions for common notification types
export const NotificationTypes = {
  ANNOUNCEMENT: 'announcement',
  GRADE_UPDATE: 'grade',
  ATTENDANCE_REMINDER: 'attendance',
  ASSIGNMENT_DUE: 'assignment',
  SYSTEM_UPDATE: 'system',
} as const;

export type NotificationType = typeof NotificationTypes[keyof typeof NotificationTypes];

export const sendSchoolNotification = async (
  type: NotificationType,
  title: string,
  body: string,
  additionalData?: any
) => {
  await pushNotificationService.sendLocalNotification(title, body, {
    type,
    timestamp: Date.now(),
    ...additionalData,
  });
};
