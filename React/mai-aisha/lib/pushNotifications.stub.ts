// Temporary stub file for push notifications until expo-notifications is installed

export interface PushNotificationSettings {
  pushEnabled: boolean;
  emailEnabled: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

class PushNotificationServiceStub {
  private settings: PushNotificationSettings = {
    pushEnabled: true,
    emailEnabled: false,
    soundEnabled: true,
    vibrationEnabled: true,
  };

  async initialize(): Promise<void> {
    console.log('Push notification service stub initialized');
  }

  async getSettings(): Promise<PushNotificationSettings> {
    return this.settings;
  }

  async updateSettings(newSettings: Partial<PushNotificationSettings>): Promise<void> {
    this.settings = { ...this.settings, ...newSettings };
    console.log('Settings updated:', this.settings);
  }

  async sendLocalNotification(title: string, body: string, data?: any): Promise<void> {
    console.log('Stub: Local notification would be sent:', { title, body, data });
  }
}

export const pushNotificationService = new PushNotificationServiceStub();

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
  console.log('Stub: School notification would be sent:', { type, title, body, additionalData });
};
