import { addDoc, arrayUnion, collection, doc, getDocs, query, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { Notification } from './types';

// Create a new notification
export const createNotification = async (
  message: string,
  type: Notification['type'],
  targetUserIds: string[],
  link?: string
): Promise<Notification> => {
  try {
    const notificationsCollection = collection(db, "notifications");
    const newNotificationRef = await addDoc(notificationsCollection, {
      message,
      type,
      targetUserIds,
      readByUsers: [],
      createdAt: new Date().toISOString(),
      ...(link && { link }),
    });
    return {
      id: newNotificationRef.id,
      message,
      type,
      targetUserIds,
      readByUsers: [],
      createdAt: new Date().toISOString(),
      link,
    };
  } catch (error: any) {
    console.error("Error creating notification:", error);
    throw new Error(error.message);
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId: string): Promise<number> => {
  if (!userId) return 0;
  try {
    const q = query(
      collection(db, "notifications"),
      where("targetUserIds", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    let unreadCount = 0;
    querySnapshot.forEach((docSnap) => {
      const notification = docSnap.data() as Notification;
      if (!notification.readByUsers.includes(userId)) {
        unreadCount++;
      }
    });
    return unreadCount;
  } catch (error: any) {
    console.error("Error fetching unread notifications count:", error);
    return 0;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string, userId: string) => {
  if (!userId) return;
  try {
    const notificationDocRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationDocRef, {
      readByUsers: arrayUnion(userId),
    });
  } catch (error: any) {
    console.error("Error marking notification as read:", error);
    throw new Error(error.message);
  }
};

// Get all notifications
export const getAllNotifications = async (userId: string): Promise<Notification[]> => {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, "notifications"),
      where("targetUserIds", "array-contains", userId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Notification, "id">),
    }));
  } catch (error: any) {
    console.error("Error fetching all notifications:", error);
    return [];
  }
};
