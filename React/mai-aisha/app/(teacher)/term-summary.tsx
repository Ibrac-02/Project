import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { animatedGoBack } from '@/utils/navigation';

interface TermEvent {
  id: string;
  title: string;
  date: Date;
  type: 'semester' | 'registration' | 'exam' | 'holiday';
  status: 'current' | 'upcoming' | 'completed';
  description?: string;
}

export default function TermSummaryScreen() {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(true);
  const [termEvents, setTermEvents] = useState<TermEvent[]>([]);

  const loadTermEvents = useCallback(async () => {
    setLoading(true);
    try {
      // In a real app, you'd fetch from a 'academic_calendar' or 'term_events' collection
      // For now, I'll create sample data based on your image
      const sampleEvents: TermEvent[] = [
        {
          id: '1',
          title: 'Semester 2 starts',
          date: new Date('2025-05-05'),
          type: 'semester',
          status: 'current',
          description: 'Second semester begins'
        },
        {
          id: '2',
          title: 'Registration start date',
          date: new Date('2025-05-30'),
          type: 'registration',
          status: 'upcoming',
          description: 'Student registration opens'
        },
        {
          id: '3',
          title: 'Registration End date',
          date: new Date('2025-06-13'),
          type: 'registration',
          status: 'upcoming',
          description: 'Last day for student registration'
        },
        {
          id: '4',
          title: 'Late Registration Date',
          date: new Date('2025-08-06'),
          type: 'registration',
          status: 'upcoming',
          description: 'Late registration deadline'
        },
        {
          id: '5',
          title: 'Exams Start Date',
          date: new Date('2025-09-15'),
          type: 'exam',
          status: 'upcoming',
          description: 'Final examinations begin'
        },
        {
          id: '6',
          title: 'Semester completes',
          date: new Date('2025-10-30'),
          type: 'semester',
          status: 'upcoming',
          description: 'End of second semester'
        }
      ];

      setTermEvents(sampleEvents);
    } catch (error) {
      console.error('Error loading term events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTermEvents();
    }, [loadTermEvents])
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'semester': return 'school-outline';
      case 'registration': return 'person-add-outline';
      case 'exam': return 'document-text-outline';
      case 'holiday': return 'calendar-outline';
      default: return 'calendar-outline';
    }
  };

  const getEventColor = (status: string) => {
    switch (status) {
      case 'current': return '#28a745';
      case 'upcoming': return '#1E90FF';
      case 'completed': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'current': return { backgroundColor: '#28a745' };
      case 'upcoming': return { backgroundColor: '#ffc107' };
      case 'completed': return { backgroundColor: '#6c757d' };
      default: return { backgroundColor: '#6c757d' };
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const EventCard = ({ event }: { event: TermEvent }) => (
    <View style={[styles.eventCard, { backgroundColor: colors.cardBackground }]}>
      <View style={styles.eventHeader}>
        <View style={styles.eventIconContainer}>
          <Ionicons 
            name={getEventIcon(event.type) as any} 
            size={24} 
            color={getEventColor(event.status)} 
          />
        </View>
        <View style={styles.eventDetails}>
          <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          <Text style={styles.eventDate}>{formatDate(event.date)}</Text>
          {event.description && (
            <Text style={styles.eventDescription}>{event.description}</Text>
          )}
        </View>
        <View style={[styles.statusBadge, getStatusBadgeColor(event.status)]}>
          <Text style={styles.statusText}>
            {event.status === 'current' ? 'Current' : 
             event.status === 'upcoming' ? 'Upcoming' : 'Completed'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading term summary...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => animatedGoBack('/(teacher)/dashboard')} 
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Term Summary</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Current Term Info */}
        <View style={[styles.currentTermCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.currentTermTitle, { color: colors.text }]}>Academic Year 2024/2025</Text>
          <Text style={[styles.currentTermSubtitle, { color: colors.primaryBlue }]}>Semester 2 - Current</Text>
        </View>

        {/* Events List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Important Dates</Text>
        
        {termEvents.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}

        {/* Quick Stats */}
        <View style={[styles.statsCard, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Quick Stats</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primaryBlue }]}>2</Text>
              <Text style={styles.statLabel}>Current Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primaryBlue }]}>4</Text>
              <Text style={styles.statLabel}>Upcoming Events</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: colors.primaryBlue }]}>156</Text>
              <Text style={styles.statLabel}>Days Remaining</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    elevation: 3,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  currentTermCard: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    elevation: 3,
  },
  currentTermTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  currentTermSubtitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 4,
  },
  eventCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  eventIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  eventDetails: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  eventDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  eventDescription: {
    fontSize: 12,
    color: '#888',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statsCard: {
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
