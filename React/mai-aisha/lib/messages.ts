import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export interface MessageData {
  title: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[]; // Array of user IDs who should receive this message
  isRead: { [userId: string]: boolean }; // Track read status per user
  messageType: 'announcement' | 'personal' | 'class' | 'staff';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Message extends MessageData {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Create a new message
export const createMessage = async (data: MessageData): Promise<Message> => {
  try {
    const now = Timestamp.now();
    const docRef = await addDoc(collection(db, 'messages'), {
      ...data,
      createdAt: now,
      updatedAt: now,
    });
    return { id: docRef.id, createdAt: now, updatedAt: now, ...data };
  } catch (error: any) {
    throw new Error('Failed to create message: ' + error.message);
  }
};

// Get messages for a specific user
export const getMessagesForUser = async (userId: string): Promise<Message[]> => {
  try {
    // Simple query without composite index - just get messages for user
    const q = query(
      collection(db, 'messages'),
      where('recipientIds', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const messages: Message[] = [];
    
    querySnapshot.forEach((doc: any) => {
      const data = doc.data() as MessageData;
      messages.push({
        id: doc.id,
        createdAt: data.createdAt || Timestamp.now(),
        updatedAt: data.updatedAt || Timestamp.now(),
        ...data
      });
    });
    
    // Sort in JavaScript instead of Firestore to avoid composite index
    return messages.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error: any) {
    throw new Error('Failed to get messages: ' + error.message);
  }
};

// Mark message as read for a specific user
export const markMessageAsRead = async (messageId: string, userId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      [`isRead.${userId}`]: true,
      updatedAt: Timestamp.now()
    });
  } catch (error: any) {
    throw new Error('Failed to mark message as read: ' + error.message);
  }
};

// Get unread message count for a user
export const getUnreadMessageCount = async (userId: string): Promise<number> => {
  try {
    const messages = await getMessagesForUser(userId);
    return messages.filter(message => !message.isRead[userId]).length;
  } catch (error: any) {
    console.error('Failed to get unread count:', error);
    return 0;
  }
};

// Delete a message
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await deleteDoc(messageRef);
  } catch (error: any) {
    throw new Error('Failed to delete message: ' + error.message);
  }
};

// Update a message
export const updateMessage = async (messageId: string, updates: Partial<MessageData>): Promise<void> => {
  try {
    const messageRef = doc(db, 'messages', messageId);
    await updateDoc(messageRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error: any) {
    throw new Error('Failed to update message: ' + error.message);
  }
};

// ===== NOTIFICATION FUNCTIONALITY =====
// Consolidated from notifications.ts

export type NotificationType = 'announcement' | 'system' | 'message' | 'grade_update' | 'attendance_reminder';

export interface NotificationData {
  message: string;
  type: NotificationType;
  targetUserIds: string[]; // users who should see this notification
  link?: string; // optional deep link or route
  createdAt?: Timestamp;
  readBy?: string[]; // userIds who have read it
}

export interface Notification extends NotificationData {
  id: string;
  createdAt: Timestamp;
  readBy: string[];
}

// Create a notification
export const createNotification = async (
  message: string,
  type: NotificationType,
  targetUserIds: string[],
  link?: string,
): Promise<Notification> => {
  try {
    const payload: NotificationData = {
      message,
      type,
      targetUserIds,
      link,
      createdAt: Timestamp.now(),
      readBy: [],
    };
    const ref = await addDoc(collection(db, 'notifications'), payload);
    return { id: ref.id, ...(payload as Required<NotificationData>) } as Notification;
  } catch (error: any) {
    throw new Error('Failed to create notification: ' + error.message);
  }
};

// Get notifications for a user
export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
  try {
    // Simple query without composite index
    const q = query(
      collection(db, 'notifications'),
      where('targetUserIds', 'array-contains', userId)
    );
    
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = [];
    
    querySnapshot.forEach((doc: any) => {
      const data = doc.data() as NotificationData;
      notifications.push({
        id: doc.id,
        createdAt: data.createdAt || Timestamp.now(),
        readBy: data.readBy || [],
        ...data
      });
    });
    
    // Sort in JavaScript to avoid composite index
    return notifications.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
  } catch (error: any) {
    throw new Error('Failed to get notifications: ' + error.message);
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  try {
    const notifications = await getNotificationsForUser(userId);
    return notifications.filter(notification => !notification.readBy.includes(userId)).length;
  } catch (error: any) {
    console.error('Failed to get unread notifications count:', error);
    return 0;
  }
};

// Mark notification as read
export const markNotificationRead = async (notificationId: string, userId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, 'notifications', notificationId);
    
    // Get current notification to update readBy array
    const currentDocs = await getDocs(query(collection(db, 'notifications'), where('__name__', '==', notificationId)));
    if (currentDocs.empty) return;
    
    const current = currentDocs.docs[0].data() as NotificationData;
    const readBy = new Set<string>([...(current.readBy || []), userId]);
    
    await updateDoc(notificationRef, { 
      readBy: Array.from(readBy),
      updatedAt: Timestamp.now()
    });
  } catch (error: any) {
    throw new Error('Failed to mark notification as read: ' + error.message);
  }
};

// Send notification to specific users
export const sendNotificationToUsers = async (
  message: string,
  type: NotificationType,
  userIds: string[],
  link?: string
): Promise<Notification> => {
  return await createNotification(message, type, userIds, link);
};

// Send notification to all users
export const sendNotificationToAll = async (
  message: string,
  type: NotificationType = 'announcement',
  link?: string
): Promise<Notification> => {
  // This would need to get all user IDs - for now, pass empty array
  // In practice, you'd fetch all user IDs from your users collection
  return await createNotification(message, type, [], link);
};

// Utility function to create both message and notification
export const createMessageWithNotification = async (
  messageData: MessageData,
  notificationMessage?: string
): Promise<{ message: Message; notification?: Notification }> => {
  try {
    // Create the message
    const message = await createMessage(messageData);
    
    // Create notification if specified
    let notification: Notification | undefined;
    if (notificationMessage) {
      notification = await createNotification(
        notificationMessage,
        'message',
        messageData.recipientIds,
        `/messages/${message.id}`
      );
    }
    
    return { message, notification };
  } catch (error: any) {
    throw new Error('Failed to create message with notification: ' + error.message);
  }
};
