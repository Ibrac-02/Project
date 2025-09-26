import { addDoc, collection, deleteDoc, doc, getDocs, query, Timestamp, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

// Interface for academic event data (before adding ID and createdByUserId)
export interface AcademicEventData {
  title: string;
  description?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  type: 'holiday' | 'exam' | 'school-event' | 'class-event' | 'meeting' | 'deadline' | 'other';
  audience: 'all' | 'admin' | 'headteacher' | 'teacher' | string; // string for classId
  classId?: string; // Optional, for class-specific events
  createdByUserId: string; // The user ID who created the event
}

// Interface for an Academic Event (after fetching from Firestore, includes ID)
export interface AcademicEvent extends AcademicEventData {
  id: string;
}

// Create an academic event
export const createAcademicEvent = async (eventData: AcademicEventData): Promise<AcademicEvent | null> => {
  try {
    const docRef = await addDoc(collection(db, 'academicEvents'), eventData);
    console.log("Document written with ID: ", docRef.id);
    return { id: docRef.id, ...eventData };
  } catch (e) {
    console.error("Error adding document: ", e);
    return null;
  }
};

// Get academic events
export const getAcademicEvents = async (userId: string, userRole: string): Promise<AcademicEvent[]> => {
  try {
    const eventsQuery = query(collection(db, 'academicEvents'));
    const querySnapshot = await getDocs(eventsQuery);
    const events: AcademicEvent[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as AcademicEventData;
      // Implement role-based filtering for client-side display if needed, though security rules handle server-side
      // For now, client will get all events and display based on client-side logic.
      events.push({ id: doc.id, ...data });
    });
    return events;
  } catch (e) {
    console.error("Error getting documents: ", e);
    return [];
  }
};

// Function to get upcoming academic events within a certain number of days
export const getUpcomingAcademicEvents = async (
  daysInAdvance: number,
  userId: string,
  userRole: string
): Promise<AcademicEvent[]> => {
  try {
    const allEvents = await getAcademicEvents(userId, userRole);
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysInAdvance);

    return allEvents.filter(event => {
      const eventStartDate = event.startDate.toDate();
      return eventStartDate >= now && eventStartDate <= futureDate;
    });
  } catch (e) {
    console.error("Error getting upcoming academic events: ", e);
    return [];
  }
};

// Update an academic event
export const updateAcademicEvent = async (eventId: string, eventData: Partial<AcademicEventData>): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'academicEvents', eventId);
    await updateDoc(eventRef, eventData);
    console.log("Document updated with ID: ", eventId);
    return true;
  } catch (e) {
    console.error("Error updating document: ", e);
    return false;
  }
};

// Delete an academic event
export const deleteAcademicEvent = async (eventId: string): Promise<boolean> => {
  try {
    const eventRef = doc(db, 'academicEvents', eventId);
    await deleteDoc(eventRef);
    console.log("Document deleted with ID: ", eventId);
    return true;
  } catch (e) {
    console.error("Error deleting document: ", e);
    return false;
  }
};

/**
 * Fetches all academic terms from Firestore.
 * @returns A promise that resolves to an array of Term objects.
 */
export const getAllTerms = async (): Promise<Term[]> => {
  try {
    const termsCollection = collection(db, 'terms');
    const querySnapshot = await getDocs(termsCollection);
    const terms: Term[] = [];
    querySnapshot.forEach(doc => {
      terms.push({ id: doc.id, ...doc.data() as Omit<Term, 'id'> });
    });
    return terms;
  } catch (error) {
    console.error("Error fetching all terms:", error);
    return [];
  }
};

/**
 * Checks if any term is ending within a specified number of days from today.
 * @param daysInAdvance The number of days to look ahead for term end dates.
 * @returns A promise that resolves to an array of terms that are ending soon.
 */
export const getTermsEndingSoon = async (daysInAdvance: number = 7): Promise<Term[]> => {
  try {
    const allTerms = await getAllTerms();
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Normalize to start of day
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + daysInAdvance);
    futureDate.setHours(23, 59, 59, 999); // Normalize to end of day

    return allTerms.filter(term => {
      const termEndDate = new Date(term.endDate); // Assuming endDate is an ISO string
      termEndDate.setHours(23, 59, 59, 999); // Normalize term end date to end of day

      return termEndDate >= now && termEndDate <= futureDate;
    });
  } catch (error) {
    console.error("Error fetching terms ending soon:", error);
    return [];
  }
};

/**
 * Ensures that all standard holidays for a given year are present in Firestore.
 * It will only add holidays that do not already exist.
 * @param year The year for which to ensure holidays.
 * @param createdByUserId The user ID creating these events (e.g., 'system' or an admin's UID).
 */
export const ensureHolidaysForYear = async (year: number, createdByUserId: string): Promise<void> => {
  try {
    const holidaysToAdd = getMalawiHolidaysForYear(year);
    const existingEvents = await getAcademicEvents(createdByUserId, 'admin'); // Fetch all existing events

    for (const holiday of holidaysToAdd) {
      const holidayExists = existingEvents.some(existingEvent =>
        existingEvent.title === holiday.title &&
        existingEvent.startDate.isEqual(holiday.startDate) &&
        existingEvent.type === holiday.type
      );

      if (!holidayExists) {
        console.log(`Adding holiday: ${holiday.title} for ${year}`);
        await createAcademicEvent({ ...holiday, createdByUserId });
      } else {
        console.log(`Holiday already exists: ${holiday.title} for ${year}`);
      }
    }
    console.log(`Finished ensuring holidays for year ${year}.`);
  } catch (e) {
    console.error(`Error ensuring holidays for year ${year}:`, e);
  }
};

// Helper function to calculate Easter Sunday for a given year (Meeus/Butcher's algorithm)
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;

  return new Date(year, month - 1, day);
}

// Function to get Malawi public and major religious holidays for a given year
export const getMalawiHolidaysForYear = (year: number): AcademicEventData[] => {
  const holidays: AcademicEventData[] = [];

  // Fixed Date Holidays
  holidays.push({ title: 'New Year\'s Day', startDate: Timestamp.fromDate(new Date(year, 0, 1)), endDate: Timestamp.fromDate(new Date(year, 0, 1)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'John Chilembwe Day', startDate: Timestamp.fromDate(new Date(year, 0, 15)), endDate: Timestamp.fromDate(new Date(year, 0, 15)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Martyrs\' Day', startDate: Timestamp.fromDate(new Date(year, 2, 3)), endDate: Timestamp.fromDate(new Date(year, 2, 3)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Labour Day', startDate: Timestamp.fromDate(new Date(year, 4, 1)), endDate: Timestamp.fromDate(new Date(year, 4, 1)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Kamuzu Day', startDate: Timestamp.fromDate(new Date(year, 4, 14)), endDate: Timestamp.fromDate(new Date(year, 4, 14)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Independence Day', startDate: Timestamp.fromDate(new Date(year, 6, 6)), endDate: Timestamp.fromDate(new Date(year, 6, 6)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Mother\'s Day', startDate: Timestamp.fromDate(new Date(year, 9, 15)), endDate: Timestamp.fromDate(new Date(year, 9, 15)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Christmas Day', startDate: Timestamp.fromDate(new Date(year, 11, 25)), endDate: Timestamp.fromDate(new Date(year, 11, 25)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Boxing Day', startDate: Timestamp.fromDate(new Date(year, 11, 26)), endDate: Timestamp.fromDate(new Date(year, 11, 26)), type: 'holiday', audience: 'all', createdByUserId: 'system' });

  // Variable Date Holidays (Easter)
  const easterSunday = getEasterSunday(year);
  const goodFriday = new Date(easterSunday);
  goodFriday.setDate(easterSunday.getDate() - 2);
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);

  holidays.push({ title: 'Good Friday', startDate: Timestamp.fromDate(goodFriday), endDate: Timestamp.fromDate(goodFriday), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Easter Monday', startDate: Timestamp.fromDate(easterMonday), endDate: Timestamp.fromDate(easterMonday), type: 'holiday', audience: 'all', createdByUserId: 'system' });

  // Variable Date Holidays (Islamic - placeholder/approximate, requires external API or annual update)
  // Dates for Eid al-Fitr and Eid al-Adha vary significantly and are based on moon sightings.
  // The dates below are approximations for 2025 based on previous search results and should be verified annually.
  holidays.push({ title: 'Eid al-Fitr', description: 'Approximate date, verify annually', startDate: Timestamp.fromDate(new Date(year, 2, 31)), endDate: Timestamp.fromDate(new Date(year, 2, 31)), type: 'holiday', audience: 'all', createdByUserId: 'system' });
  holidays.push({ title: 'Eid al-Adha', description: 'Approximate date, verify annually', startDate: Timestamp.fromDate(new Date(year, 5, 9)), endDate: Timestamp.fromDate(new Date(year, 5, 9)), type: 'holiday', audience: 'all', createdByUserId: 'system' });

  return holidays;
};