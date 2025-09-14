import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnnouncementCard } from '../../components/AnnouncementCard';
import { Announcement, createAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from '../../lib/announcements';
import { useAuth } from '../../lib/auth';

export default function AnnouncementsScreen() {
  const { user, role: userRole, loading: authLoading } = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope] = useState('school-wide');

  const fetchAnnouncements = async () => {
    console.log("fetchAnnouncements called.");
    if (authLoading || !user || !userRole) {
      console.log("fetchAnnouncements skipped: authLoading=", authLoading, ", user=", !!user, ", userRole=", userRole);
      return;
    }
    setLoading(true);
    console.log("Calling getAnnouncements with userRole=", userRole, ", userId=", user.uid);
    try {
      const fetchedAnnouncements = await getAnnouncements(userRole, user.uid);
      console.log("getAnnouncements returned:", fetchedAnnouncements.length, "announcements.");
      setAnnouncements(fetchedAnnouncements);
    } catch (error: any) {
      console.error("Error fetching announcements:", error);
      Alert.alert("Error", "Failed to fetch announcements: " + error.message);
    } finally {
      setLoading(false);
      console.log("fetchAnnouncements finished. Loading set to false.");
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, [user, userRole, authLoading]);

  const handleCreateOrUpdateAnnouncement = async () => {
    if (!user || !userRole || !title || !content || !scope) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, { title, content, scope });
        Alert.alert("Success", "Announcement updated successfully!");
      } else {
        await createAnnouncement({ title, content, createdByUserId: user.uid, createdByUserRole: userRole, scope });
        Alert.alert("Success", "Announcement created successfully!");
      }
      setIsModalVisible(false);
      setTitle('');
      setContent('');
      setEditingAnnouncement(null);
      fetchAnnouncements(); // Refresh list
    } catch (error: any) {
      Alert.alert("Error", "Failed to save announcement: " + error.message);
    }
  };

  const handleEdit = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setTitle(announcement.title);
    setContent(announcement.content);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this announcement?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            try {
              await deleteAnnouncement(id);
              Alert.alert("Success", "Announcement deleted successfully!");
              fetchAnnouncements(); // Refresh list
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete announcement: " + error.message);
            }
          }
        }
      ]
    );
  };

  const canCreateAnnouncement = userRole === 'admin' || userRole === 'headteacher' || userRole === 'teacher';

  if (loading || authLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading announcements...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {canCreateAnnouncement && (
          <TouchableOpacity style={styles.createButton} onPress={() => {
            setEditingAnnouncement(null);
            setTitle('');
            setContent('');
            // Scope is now fixed to 'school-wide' for all users
            setIsModalVisible(true);
          }}>
            <Ionicons name="add-circle-outline" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Create New Announcement</Text>
          </TouchableOpacity>
        )}

        {announcements.length === 0 ? (
          <Text style={styles.noAnnouncementsText}>No announcements available.</Text>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</Text>

            <TextInput
              style={styles.input}
              placeholder="Title"
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Content"
              multiline
              value={content}
              onChangeText={setContent}
            />


            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleCreateOrUpdateAnnouncement}>
                <Text style={styles.buttonText}>{editingAnnouncement ? 'Update' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
  },
  
  createButton: {
    backgroundColor: '#1E90FF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  noAnnouncementsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 25,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  scopeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    alignItems: 'center',
  },
  scopeLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#555',
    marginRight: 10,
  },
  scopeOption: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    marginBottom: 10,
  },
  scopeOptionActive: {
    backgroundColor: '#1E90FF',
  },
  scopeOptionText: {
    color: '#333',
    fontSize: 14,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#999',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    width: '45%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
