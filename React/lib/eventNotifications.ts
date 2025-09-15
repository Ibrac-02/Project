import { AcademicEvent } from './academicCalendar';
import { getAllUsers } from './auth';
import { createNotification } from './notifications';

export const generateNotificationsForEvent = async (event: AcademicEvent) => {
  try {
    const allUsers = await getAllUsers();
    let targetUserIds: string[] = [];

    if (event.audience === 'all') {
      targetUserIds = allUsers.map(user => user.uid);
    } else if (event.audience === 'admin') {
      targetUserIds = allUsers.filter(user => user.role === 'admin').map(user => user.uid);
    } else if (event.audience === 'headteacher') {
      targetUserIds = allUsers.filter(user => user.role === 'headteacher').map(user => user.uid);
    } else if (event.audience === 'teacher') {
      targetUserIds = allUsers.filter(user => user.role === 'teacher').map(user => user.uid);
    } else if (event.audience.startsWith('class-')) {
      const classId = event.audience.split('-')[1];
      // In a real scenario, you'd filter users by class enrollment. 
      // For now, assuming teachers are associated with classIds via their user profile or a separate mapping.
      // For this example, we'll notify all teachers and admins/headteachers for class-specific events.
      targetUserIds = allUsers.filter(user => 
        user.role === 'teacher' || 
        user.role === 'admin' || 
        user.role === 'headteacher'
      ).map(user => user.uid);
    }

    if (targetUserIds.length > 0) {
      const notificationMessage = `Upcoming ${event.type}: ${event.title} on ${event.startDate.toDate().toLocaleDateString()}`;
      await createNotification(
        notificationMessage,
        'event',
        targetUserIds,
        '/(auth)/academic-calendar' // Link to the academic calendar screen
      );
      console.log(`Notifications generated for event ${event.id}`);
    }
  } catch (error) {
    console.error("Error generating notifications for event:", error);
  }
};
