import { getAllUsers } from './auth';
import { getAllSubjects } from './subjects';

export interface SearchResult {
  id: string;
  name: string;
  type: 'student' | 'teacher' | 'subject';
  // Add other relevant fields for display if needed
  email?: string | null;
  role?: string | null;
  description?: string;
}

/**
 * Performs an intelligent search across students, teachers, and subjects.
 * @param searchTerm The term to search for.
 * @returns A promise that resolves to an array of SearchResult objects.
 */
export const performSmartSearch = async (searchTerm: string): Promise<SearchResult[]> => {
  const normalizedSearchTerm = searchTerm.toLowerCase().trim();
  if (!normalizedSearchTerm) {
    return [];
  }

  const results: SearchResult[] = [];

  // Search users (students and teachers)
  try {
    const allUsers = await getAllUsers();
    allUsers.forEach(user => {
      const userName = user.name?.toLowerCase();
      const userEmail = user.email?.toLowerCase();
      if (userName && userName.startsWith(normalizedSearchTerm) || (userEmail && userEmail.startsWith(normalizedSearchTerm))) {
        if (user.role === 'student' || user.role === 'teacher') {
          results.push({
            id: user.uid,
            name: user.name || user.email || '',
            type: user.role,
            email: user.email,
            role: user.role,
          });
        }
      }
    });
  } catch (error) {
    console.error("Error searching users:", error);
  }

  // Search subjects
  try {
    const allSubjects = await getAllSubjects();
    allSubjects.forEach(subject => {
      const subjectName = subject.name.toLowerCase();
      if (subjectName.startsWith(normalizedSearchTerm)) {
        results.push({
          id: subject.id,
          name: subject.name,
          type: 'subject',
          description: subject.description,
        });
      }
    });
  } catch (error) {
    console.error("Error searching subjects:", error);
  }

  return results;
};
