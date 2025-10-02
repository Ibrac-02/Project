import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc, where } from 'firebase/firestore';
import { getAllUsers } from './auth'; // Import getAllUsers and UserProfile
import { db } from './firebase'; // Assuming firebase.ts exports 'db'
import { createNotification } from './messages'; // Import createNotification from consolidated messages file

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

// Helper function to generate notifications based on announcement
export const generateNotificationsForAnnouncement = async (announcement: Announcement) => {
  try {
    const allUsers = await getAllUsers();
    let targetUserIds: string[] = [];

    if (announcement.scope === 'school-wide') {
      targetUserIds = allUsers.map(user => user.uid);
    } else if (announcement.scope === 'staff-only') {
      targetUserIds = allUsers.filter(user => user.role === 'admin' || user.role === 'headteacher' || user.role === 'teacher').map(user => user.uid);
    } else if (announcement.scope.startsWith('class-')) {
      // For class-specific announcements, assume the scope is like 'class-[teacherUid]'
      // In a real scenario, you'd filter users by class enrollment
      const teacherUid = announcement.scope.split('-')[1];
      const relevantUsers = allUsers.filter(user => user.uid === teacherUid || user.role === 'headteacher' || user.role === 'admin'); // Teachers of that class, plus admin/headteacher
      targetUserIds = relevantUsers.map(user => user.uid);
    } else if (announcement.scope.startsWith('teacher-')) {
      const specificTeacherUid = announcement.scope.split('-')[1];
      targetUserIds = [specificTeacherUid];
    }
    // For other scopes, or if no specific targeting, you might default to a subset or all.
    // For now, if no specific scope match, we won't create notifications by default.

    if (targetUserIds.length > 0) {
      await createNotification(
        announcement.title, // Use announcement title as notification message
        'announcement',
        targetUserIds,
        '/(auth)/announcements' // Link to the announcements screen
      );
      console.log(`Notifications generated for announcement ${announcement.id}`);
    }
  } catch (error) {
    console.error("Error generating notifications for announcement:", error);
  }
};

// Create an announcement
export const createAnnouncement = async (data: AnnouncementData): Promise<Announcement> => {
  try {
    const docRef = await addDoc(collection(db, 'announcements'), {
      ...data,
      createdAt: Timestamp.now(),
    });
    const newAnnouncement = { id: docRef.id, createdAt: Timestamp.now(), ...data };
    await generateNotificationsForAnnouncement(newAnnouncement); // Generate notifications after creating announcement
    return newAnnouncement;
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
    let q = query(collection(db, 'announcements'));

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
      announcements.push({ id: doc.id, createdAt: Timestamp.now(), ...data });
    });
    
    // Sort by createdAt in descending order (newest first) in JavaScript
    const filteredAnnouncements = announcements
      .filter(announcement => !announcement.expiresAt || announcement.expiresAt.toDate() > new Date())
      .sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    
    return filteredAnnouncements;
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
