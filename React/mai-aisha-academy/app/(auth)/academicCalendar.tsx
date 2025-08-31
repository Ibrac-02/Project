import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { router } from 'expo-router';
import { Timestamp } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar, DateObject, LocaleConfig } from 'react-native-calendars';

import { AcademicEvent, AcademicEventData, createAcademicEvent, deleteAcademicEvent, getAcademicEvents, updateAcademicEvent } from '../../lib/academicCalendar';
import { useAuth } from '../../lib/auth';

// Locale configuration for react-native-calendars (optional, but good practice)
LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ],
  monthNamesShort: ['Jan.', 'Feb.', 'Mar', 'Apr', 'May', 'Jun', 'Jul.', 'Aug', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
  today: 'Today',
};
LocaleConfig.defaultLocale = 'en';

export default function AcademicCalendarScreen() {
  const { user, role, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [markedDates, setMarkedDates] = useState<{ [key: string]: any }>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<AcademicEvent | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStartDate, setFormStartDate] = useState(new Date());
  const [formEndDate, setFormEndDate] = useState(new Date());
  const [formType, setFormType] = useState<AcademicEventData['type']>(`school-event`);
  const [formAudience, setFormAudience] = useState<AcademicEventData['audience']>(`all`);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    if (user?.uid && role) {
      setPageLoading(true);
      const fetchedEvents = await getAcademicEvents(user.uid, role);
      setEvents(fetchedEvents);

      const newMarkedDates: { [key: string]: any } = {};
      fetchedEvents.forEach(event => {
        const startDate = event.startDate.toDate().toISOString().split('T')[0];
        const endDate = event.endDate.toDate().toISOString().split('T')[0];

        // Mark all days between start and end date (inclusive)
        let currentDate = new Date(startDate);
        while (currentDate <= new Date(endDate)) {
          const dateString = currentDate.toISOString().split('T')[0];
          newMarkedDates[dateString] = {
            ...(newMarkedDates[dateString] || {}),
            dots: [...(newMarkedDates[dateString]?.dots || []), { color: '#1E90FF', selectedDotColor: 'white' }],
          };
          currentDate.setDate(currentDate.getDate() + 1);
        }
      });
      setMarkedDates(newMarkedDates);
      setPageLoading(false);
    }
  }, [user?.uid, role]);

  useEffect(() => {
    if (!authLoading) {
      fetchEvents();
    }
  }, [authLoading, fetchEvents]);

  const handleDayPress = (day: DateObject) => {
    setSelectedDate(day.dateString);
  };

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormStartDate(new Date());
    setFormEndDate(new Date());
    setFormType('school-event');
    setFormAudience('all');
    setCurrentEvent(null);
  };

  const openAddEventModal = (dateString: string | null) => {
    resetForm();
    if (dateString) {
      const initialDate = new Date(dateString);
      setFormStartDate(initialDate);
      setFormEndDate(initialDate);
    }
    setShowEventModal(true);
  };

  const openEditEventModal = (event: AcademicEvent) => {
    setCurrentEvent(event);
    setFormTitle(event.title);
    setFormDescription(event.description || '');
    setFormStartDate(event.startDate.toDate());
    setFormEndDate(event.endDate.toDate());
    setFormType(event.type);
    setFormAudience(event.audience);
    setShowEventModal(true);
  };

  const handleSaveEvent = async () => {
    if (!user?.uid) return;
    if (!formTitle || !formStartDate || !formEndDate) {
      Alert.alert('Error', 'Please fill in all required fields: Title, Start Date, End Date.');
      return;
    }

    const eventData: AcademicEventData = {
      title: formTitle,
      description: formDescription,
      startDate: Timestamp.fromDate(formStartDate),
      endDate: Timestamp.fromDate(formEndDate),
      type: formType,
      audience: formAudience,
      createdByUserId: user.uid,
    };

    if (currentEvent) {
      // Update existing event
      const success = await updateAcademicEvent(currentEvent.id, eventData);
      if (success) { // Handle case where headteacher can only update their own event
        Alert.alert('Success', 'Event updated successfully!');
        fetchEvents();
      } else {
        Alert.alert('Error', 'Failed to update event. Check permissions.');
      }
    } else {
      // Create new event
      const newEvent = await createAcademicEvent(eventData);
      if (newEvent) {
        Alert.alert('Success', 'Event added successfully!');
        fetchEvents();
      } else {
        Alert.alert('Error', 'Failed to add event. Check permissions.');
      }
    }
    setShowEventModal(false);
    resetForm();
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!user?.uid || role !== 'admin') {
      Alert.alert('Permission Denied', 'Only administrators can delete events.');
      return;
    }

    Alert.alert(
      'Delete Event',
      'Are you sure you want to delete this event?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => {
            const success = await deleteAcademicEvent(eventId);
            if (success) {
              Alert.alert('Success', 'Event deleted successfully!');
              fetchEvents();
            } else {
              Alert.alert('Error', 'Failed to delete event. Check permissions.');
            }
          }
        },
      ]
    );
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formStartDate;
    setShowDatePicker(false);
    setFormStartDate(currentDate);
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || formStartDate;
    setShowTimePicker(false);
    setFormStartDate(prev => {
      const newDate = new Date(prev);
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      return newDate;
    });
  };

  const handleEndDateChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || formEndDate;
    setShowEndDatePicker(false);
    setFormEndDate(currentDate);
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    const currentTime = selectedTime || formEndDate;
    setShowEndTimePicker(false);
    setFormEndDate(prev => {
      const newDate = new Date(prev);
      newDate.setHours(currentTime.getHours());
      newDate.setMinutes(currentTime.getMinutes());
      return newDate;
    });
  };

  const filteredEvents = selectedDate
    ? events.filter(event => {
        const eventStartDay = event.startDate.toDate().toISOString().split('T')[0];
        const eventEndDay = event.endDate.toDate().toISOString().split('T')[0];
        return selectedDate >= eventStartDay && selectedDate <= eventEndDay;
      })
    : events.sort((a, b) => a.startDate.toDate().getTime() - b.startDate.toDate().getTime()); // Sort if no specific day is selected

  const canCreateEdit = role === 'admin' || role === 'headteacher';
  const canDelete = role === 'admin';

  if (authLoading || pageLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text style={styles.loadingText}>Loading calendar...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Academic Calendar</Text>
        {canCreateEdit && (
          <TouchableOpacity onPress={() => openAddEventModal(selectedDate)} style={styles.addButton}>
            <Ionicons name="add-circle-outline" size={30} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            ...(selectedDate ? { [selectedDate]: { selected: true, marked: true, selectedColor: '#1E90FF' } } : {}),
          }}
          markingType="multi-dot"
          enableSwipeMonths={true}
          theme={{
            todayTextColor: '#1E90FF',
            arrowColor: '#1E90FF',
            textSectionTitleColor: '#666',
            selectedDayBackgroundColor: '#1E90FF',
            selectedDayTextColor: '#ffffff',
            dotColor: '#1E90FF',
            // More theme options as needed
          }}
        />

        <View style={styles.eventsContainer}>
          <Text style={styles.eventsHeader}>
            {selectedDate ? `Events on ${selectedDate}` : 'Upcoming Events'}
          </Text>
          {filteredEvents.length === 0 ? (
            <Text style={styles.noEventsText}>No events for this date.</Text>
          ) : (
            filteredEvents.map(event => (
              <View key={event.id} style={styles.eventCard}>
                <View style={styles.eventInfo}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDescription}>{event.description}</Text>
                  <Text style={styles.eventDate}>
                    {event.startDate.toDate().toLocaleDateString()} {event.startDate.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}
                    {event.endDate.toDate().toDateString() !== event.startDate.toDate().toDateString() ? ` - ${event.endDate.toDate().toLocaleDateString()} ${event.endDate.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit'})}` : ''}
                  </Text>
                  <Text style={styles.eventType}>Type: {event.type.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
                  <Text style={styles.eventAudience}>Audience: {event.audience.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>
                </View>
                {(canCreateEdit && (role === 'admin' || event.createdByUserId === user?.uid)) && (
                  <View style={styles.eventActions}>
                    <TouchableOpacity onPress={() => openEditEventModal(event)} style={styles.actionButton}>
                      <Ionicons name="pencil-outline" size={20} color="#1E90FF" />
                    </TouchableOpacity>
                    {canDelete && (
                      <TouchableOpacity onPress={() => handleDeleteEvent(event.id)} style={styles.actionButton}>
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showEventModal}
        onRequestClose={() => setShowEventModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{currentEvent ? 'Edit Event' : 'Add New Event'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Event Title"
              value={formTitle}
              onChangeText={setFormTitle}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={formDescription}
              onChangeText={setFormDescription}
              multiline
            />

            <Text style={styles.label}>Start Date:</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
              <Text>{formStartDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#1E90FF" />
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={formStartDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <Text style={styles.label}>Start Time:</Text>
            <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.datePickerButton}>
              <Text>{formStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Ionicons name="time-outline" size={20} color="#1E90FF" />
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={formStartDate}
                mode="time"
                display="default"
                onChange={handleTimeChange}
              />
            )}

            <Text style={styles.label}>End Date:</Text>
            <TouchableOpacity onPress={() => setShowEndDatePicker(true)} style={styles.datePickerButton}>
              <Text>{formEndDate.toLocaleDateString()}</Text>
              <Ionicons name="calendar-outline" size={20} color="#1E90FF" />
            </TouchableOpacity>
            {showEndDatePicker && (
              <DateTimePicker
                value={formEndDate}
                mode="date"
                display="default"
                onChange={handleEndDateChange}
              />
            )}

            <Text style={styles.label}>End Time:</Text>
            <TouchableOpacity onPress={() => setShowEndTimePicker(true)} style={styles.datePickerButton}>
              <Text>{formEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              <Ionicons name="time-outline" size={20} color="#1E90FF" />
            </TouchableOpacity>
            {showEndTimePicker && (
              <DateTimePicker
                value={formEndDate}
                mode="time"
                display="default"
                onChange={handleEndTimeChange}
              />
            )}

            <Text style={styles.label}>Event Type:</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formType}
                onValueChange={(itemValue) => setFormType(itemValue as AcademicEventData['type'])}
                style={styles.picker}
              >
                <Picker.Item label="School Event" value="school-event" />
                <Picker.Item label="Holiday" value="holiday" />
                <Picker.Item label="Exam" value="exam" />
                <Picker.Item label="Class Event" value="class-event" />
                <Picker.Item label="Meeting" value="meeting" />
                <Picker.Item label="Deadline" value="deadline" />
                <Picker.Item label="Other" value="other" />
              </Picker>
            </View>

            {role === 'admin' && (
              <>
                <Text style={styles.label}>Audience:</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formAudience}
                    onValueChange={(itemValue) => setFormAudience(itemValue as AcademicEventData['audience'])}
                    style={styles.picker}
                  >
                    <Picker.Item label="All" value="all" />
                    <Picker.Item label="Admin" value="admin" />
                    <Picker.Item label="Headteacher" value="headteacher" />
                    <Picker.Item label="Teacher" value="teacher" />
                    {/* Add options for specific classes later if needed */}
                  </Picker>
                </View>
              </>
            )}

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={() => setShowEventModal(false)} style={[styles.modalButton, styles.cancelButton]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSaveEvent} style={[styles.modalButton, styles.saveButton]}>
                <Text style={styles.buttonText}>{currentEvent ? 'Update' : 'Add'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 1.5,
    elevation: 3,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addButton: {
    padding: 5,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  eventsContainer: {
    marginTop: 20,
    paddingHorizontal: 15,
  },
  eventsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  noEventsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 20,
  },
  eventCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 2,
  },
  eventInfo: {
    flex: 1,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  eventDescription: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
  },
  eventDate: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },
  eventType: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
    fontStyle: 'italic',
  },
  eventAudience: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  eventActions: {
    flexDirection: 'row',
  },
  actionButton: {
    marginLeft: 10,
    padding: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  input: {
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  label: {
    alignSelf: 'flex-start',
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 5,
    color: '#333',
    fontSize: 16,
  },
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
    justifyContent: 'center',
  },
  picker: {
    width: '100%',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#ccc',
  },
  saveButton: {
    backgroundColor: '#1E90FF',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
