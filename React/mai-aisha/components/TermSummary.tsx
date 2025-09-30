import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentTerm, getDaysUntilExams, getDaysUntilClosing, getUpcomingHolidays, createTerm, setActiveTerm, type AcademicTerm } from '@/lib/terms';

interface TermSummaryProps {
  style?: any;
}

export default function TermSummary({ style }: TermSummaryProps) {
  const [currentTerm, setCurrentTerm] = useState<AcademicTerm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurrentTerm();
  }, []);

  const loadCurrentTerm = async () => {
    try {
      const term = await getCurrentTerm();
      console.log('Current term loaded:', term);
      setCurrentTerm(term);
    } catch (error) {
      console.error('Error loading current term:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const showHolidays = () => {
    if (!currentTerm) return;
    
    const upcomingHolidays = getUpcomingHolidays(currentTerm);
    if (upcomingHolidays.length === 0) {
      Alert.alert('Holidays', 'No upcoming holidays this term.');
      return;
    }

    const holidayText = upcomingHolidays.map(holiday => 
      `• ${holiday.name}\n  ${formatDate(holiday.startDate)} - ${formatDate(holiday.endDate)}`
    ).join('\n\n');

    Alert.alert('Upcoming Holidays', holidayText);
  };

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.loadingText}>Loading term info...</Text>
      </View>
    );
  }

  if (!currentTerm) {
    return (
      <View style={[styles.container, styles.noTermContainer, style]}>
        <Ionicons name="calendar-outline" size={24} color="#999" />
        <Text style={styles.noTermText}>No active term set</Text>
        <Text style={styles.noTermSubtext}>Admin needs to create and activate a term</Text>
        <View style={{ flexDirection: 'row', marginTop: 8, gap: 8 }}>
          <TouchableOpacity 
            onPress={loadCurrentTerm}
            style={{ flex: 1, padding: 8, backgroundColor: '#1E90FF', borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>Refresh</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={async () => {
              try {
                console.log('Creating sample term for testing...');
                const currentYear = new Date().getFullYear();
                const nextYear = currentYear + 1;
                
                // Create a sample term
                const sampleTerm = await createTerm({
                  name: `First Term ${currentYear}`,
                  academicYear: `${currentYear}/${nextYear}`,
                  termNumber: 1,
                  openingDate: `${currentYear}-09-01`,
                  examStartDate: `${currentYear}-11-15`,
                  closingDate: `${currentYear}-12-15`,
                  holidays: [
                    {
                      id: '1',
                      name: 'Mid-Term Break',
                      startDate: `${currentYear}-10-15`,
                      endDate: `${currentYear}-10-22`,
                      description: 'One week break'
                    }
                  ],
                  isActive: false
                });
                
                // Set it as active
                await setActiveTerm(sampleTerm.id);
                
                // Reload the term
                await loadCurrentTerm();
                
                Alert.alert('Success', 'Sample term created and activated!');
              } catch (error) {
                console.error('Error creating sample term:', error);
                Alert.alert('Error', 'Failed to create sample term');
              }
            }}
            style={{ flex: 1, padding: 8, backgroundColor: '#10B981', borderRadius: 6 }}
          >
            <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>Create Sample</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const daysUntilExams = getDaysUntilExams(currentTerm);
  const daysUntilClosing = getDaysUntilClosing(currentTerm);
  const upcomingHolidays = getUpcomingHolidays(currentTerm);

  // Determine term status and color
  const getTermStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    const opening = currentTerm.openingDate;
    const closing = currentTerm.closingDate;
    const examStart = currentTerm.examStartDate;

    if (today < opening) {
      return { text: 'Upcoming', color: '#3B82F6', bgColor: '#EBF8FF' }; // Blue
    } else if (today >= opening && today < examStart) {
      return { text: 'Current Term', color: '#10B981', bgColor: '#ECFDF5' }; // Green
    } else if (today >= examStart && today <= closing) {
      return { text: 'Exam Period', color: '#F59E0B', bgColor: '#FFFBEB' }; // Orange
    } else {
      return { text: 'Completed', color: '#6B7280', bgColor: '#F9FAFB' }; // Gray
    }
  };

  const termStatus = getTermStatus();

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <View style={styles.termInfo}>
          <View style={styles.termHeader}>
            <Text style={styles.termName}>{currentTerm.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: termStatus.bgColor }]}>
              <Text style={[styles.statusText, { color: termStatus.color }]}>{termStatus.text}</Text>
            </View>
          </View>
          <Text style={styles.academicYear}>{currentTerm.academicYear}</Text>
        </View>
        <TouchableOpacity onPress={showHolidays} style={styles.holidayBtn}>
          <Ionicons name="calendar" size={20} color="#1E90FF" />
          <Text style={styles.holidayBtnText}>Holidays</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.datesGrid}>
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Opening</Text>
          <Text style={styles.dateValue}>{formatDate(currentTerm.openingDate)}</Text>
        </View>
        
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Exams Start</Text>
          <Text style={styles.dateValue}>{formatDate(currentTerm.examStartDate)}</Text>
          {daysUntilExams > 0 && daysUntilExams <= 30 && (
            <Text style={[
              styles.countdown, 
              { color: daysUntilExams <= 7 ? '#EF4444' : daysUntilExams <= 14 ? '#F59E0B' : '#1E90FF' }
            ]}>
              {daysUntilExams} days
            </Text>
          )}
        </View>
        
        <View style={styles.dateItem}>
          <Text style={styles.dateLabel}>Closing</Text>
          <Text style={styles.dateValue}>{formatDate(currentTerm.closingDate)}</Text>
          {daysUntilClosing > 0 && daysUntilClosing <= 30 && (
            <Text style={[
              styles.countdown,
              { color: daysUntilClosing <= 7 ? '#EF4444' : daysUntilClosing <= 14 ? '#F59E0B' : '#1E90FF' }
            ]}>
              {daysUntilClosing} days
            </Text>
          )}
        </View>
      </View>

      {upcomingHolidays.length > 0 && (
        <View style={styles.nextHoliday}>
          <Ionicons name="gift-outline" size={16} color="#1E90FF" />
          <Text style={styles.nextHolidayText}>
            Next: {upcomingHolidays[0].name} ({formatDate(upcomingHolidays[0].startDate)})
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  noTermContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noTermText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#999',
    marginTop: 8,
  },
  noTermSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  termInfo: {
    flex: 1,
  },
  termHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  termName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E90FF',
    marginRight: 12,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  academicYear: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  holidayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EAF4FF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  holidayBtnText: {
    color: '#1E90FF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  datesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateItem: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 4,
  },
  dateValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#222',
    textAlign: 'center',
  },
  countdown: {
    fontSize: 11,
    color: '#1E90FF',
    fontWeight: '600',
    marginTop: 2,
  },
  nextHoliday: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  nextHolidayText: {
    fontSize: 13,
    color: '#1E90FF',
    fontWeight: '500',
    marginLeft: 6,
    flex: 1,
  },
});
