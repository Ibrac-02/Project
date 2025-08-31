import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { db } from './firebase'; // Assuming firebase.ts exports 'db'

export interface AnnouncementData {
  title: string;
  content: string;
  createdByUserId: string;
  createdByUserRole: string;
  scope: string; // e.g., 'school-wide', 'staff-only', 'class-[classId]', 'teacher-specific'
  expiresAt?: Timestamp; // Optional expiration date
}

export interface Announcement extends AnnouncementData {
  id: string;
  createdAt: Timestamp;
}

// Create an announcement
export const createAnnouncement = async (data: AnnouncementData): Promise<Announcement> => {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...data,
      createdAt: Timestamp.now(),
    });
    return { id: docRef.id, createdAt: Timestamp.now(), ...data };
  } catch (error: any) {
    throw new Error('Failed to create announcement: ' + error.message);
  }
};

// Get announcements based on user role and context
export const getAnnouncements = async (
  userRole: string,
  currentUserId?: string,
  classIds?: string[]
): Promise<Announcement[]> => {
  try {
    let q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'));

    if (userRole === 'admin') {
      // Admin can see all announcements (no specific scope filtering needed at application level, rules handle it)
    } else if (userRole === 'headteacher') {
      // Headteachers see school-wide and staff-only announcements
      q = query(q, where('scope', 'in', ['school-wide', 'staff-only']));
    } else if (userRole === 'teacher' && currentUserId) {
      // Teachers see school-wide, staff-only, and their own class-specific announcements
      // Note: This assumes 'class-[teacherId]' scope where teacherId is currentUserId
      q = query(q, where('scope', 'in', ['school-wide', 'staff-only', 'class-' + currentUserId]));
    }

    const querySnapshot = await getDocs(q);
    const announcements: Announcement[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as AnnouncementData;
      announcements.push({ id: doc.id, createdAt: data.createdAt || Timestamp.now(), ...data });
    });
    return announcements.filter(announcement => !announcement.expiresAt || announcement.expiresAt.toDate() > new Date());
  } catch (error: any) {
    throw new Error('Failed to get announcements: ' + error.message);
  }
};

// Update an announcement
export const updateAnnouncement = async (id: string, updates: Partial<AnnouncementData>): Promise<void> => {
  try {
    const announcementRef = doc(db, 'announcements', id);
    await updateDoc(announcementRef, updates);
  } catch (error: any) {
    throw new Error('Failed to update announcement: ' + error.message);
  }
};

// Delete an announcement
export const deleteAnnouncement = async (id: string): Promise<void> => {
  try {
    const announcementRef = doc(db, 'announcements', id);
    await deleteDoc(announcementRef);
  } catch (error: any) {
    throw new Error('Failed to delete announcement: ' + error.message);
  }
};
