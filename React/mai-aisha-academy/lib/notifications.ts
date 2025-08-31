import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Notification } from './types';

// Create a new notification
export const createNotification = async (message: string, type: Notification['type'], targetUserIds: string[], link?: string): Promise<Notification> => {
  try {
    const notificationsCollection = collection(db, "notifications");
    const newNotificationRef = await addDoc(notificationsCollection, {
      message,
      type,
      targetUserIds,
      readByUsers: [], // Initially, no one has read it
      createdAt: new Date().toISOString(),
      ...(link && { link }),
    });
    return { id: newNotificationRef.id, message, type, targetUserIds, readByUsers: [], createdAt: new Date().toISOString(), link };
  } catch (error: any) {
    console.error("Error creating notification:", error);
    throw new Error(error.message);
  }
};

// Get unread notifications count for a specific user
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  try {
    const notificationsCollection = collection(db, "notifications");
    // Query notifications targeted at this user
    const q = query(
      notificationsCollection,
      where("targetUserIds", "array-contains", userId),
      // Remove where("readByUsers", "not-array-contains", userId) due to Firestore limitation
    );
    const querySnapshot = await getDocs(q);
    let unreadCount = 0;
    querySnapshot.forEach(doc => {
      const notification = doc.data() as Notification;
      if (!notification.readByUsers.includes(userId)) {
        unreadCount++;
      }
    });
    return unreadCount;
  } catch (error: any) {
    console.error("Error fetching unread notifications count:", error);
    throw new Error(error.message);
  }
};

// Mark a specific notification as read by a user
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  try {
    const notificationDocRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationDocRef, {
      readByUsers: arrayUnion(userId), // Add user ID to readByUsers array
    });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw new Error(error.message);
  }
};

// Get all notifications for a specific user (read and unread)
export const getAllNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const notificationsCollection = collection(db, "notifications");
    const q = query(
      notificationsCollection,
      where("targetUserIds", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    const notifications: Notification[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      message: doc.data().message,
      type: doc.data().type,
      targetUserIds: doc.data().targetUserIds,
      readByUsers: doc.data().readByUsers,
      createdAt: doc.data().createdAt,
      link: doc.data().link,
    }));
    return notifications;
  } catch (error: any) {
    console.error("Error fetching all notifications:", error);
    throw new Error(error.message);
  }
};
