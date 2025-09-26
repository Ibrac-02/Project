import { addDoc, collection, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from '@/config/firebase';

export type NotificationType = 'announcement' | 'system' | 'message';

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

export async function createNotification(
  message: string,
  type: NotificationType,
  targetUserIds: string[],
  link?: string,
): Promise<Notification> {
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
}

export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  try {
    // Get notifications that target this user
    const q = query(collection(db, 'notifications'), where('targetUserIds', 'array-contains', userId));
    const snap = await getDocs(q);
    let count = 0;
    snap.forEach((d) => {
      const data = d.data() as NotificationData;
      const readBy = (data.readBy || []) as string[];
      if (!readBy.includes(userId)) count += 1;
    });
    return count;
  } catch (e) {
    console.warn('getUnreadNotificationsCount failed:', e);
    return 0;
  }
}

export async function markNotificationRead(notificationId: string, userId: string): Promise<void> {
  const ref = doc(db, 'notifications', notificationId);
  // Firestore arrayUnion would be better, but keep minimal to avoid extra imports
  const currentDocs = await getDocs(query(collection(db, 'notifications'), where('__name__', '==', notificationId)));
  if (currentDocs.empty) return;
  const cur = currentDocs.docs[0].data() as NotificationData;
  const readBy = new Set<string>([...(cur.readBy || []), userId]);
  await updateDoc(ref, { readBy: Array.from(readBy) });
}
