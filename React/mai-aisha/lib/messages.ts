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
