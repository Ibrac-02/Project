import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AnnouncementCard } from '@/components/AnnouncementCard';
import { Announcement, createAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from '@/lib/announcements';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/contexts/ThemeContext';

export default function AnnouncementsScreen() {
  const { user, role: userRole, loading: authLoading } = useAuth();
  const { colors } = useTheme();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [scope] = useState('school-wide');
  const [selectedAnnouncements, setSelectedAnnouncements] = useState<string[]>([]);

  const fetchAnnouncements = useCallback(async () => {
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
  }, [authLoading, user, userRole]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleCreateOrUpdateAnnouncement = async () => {
    if (!user || !userRole || !title || !content || !scope) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    // Role guard: only admin/headteacher can create or update
    if (!(userRole === 'admin' || userRole === 'headteacher')) {
      Alert.alert("Permission Denied", "Only administrators or headteachers can manage announcements.");
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

  const toggleSelectAnnouncement = (id: string) => {
    setSelectedAnnouncements((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((aid) => aid !== id) : [...prevSelected, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedAnnouncements.length === 0) {
      Alert.alert("No Announcements Selected", "Please select announcements to delete.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${selectedAnnouncements.length} selected announcement(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            try {
              await Promise.all(selectedAnnouncements.map(id => deleteAnnouncement(id)));
              Alert.alert("Success", `${selectedAnnouncements.length} announcement(s) deleted successfully!`);
              setSelectedAnnouncements([]);
              fetchAnnouncements();
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete selected announcements: " + error.message);
            }
          }
        }
      ]
    );
  };

  const canManageAnnouncements = userRole === 'admin' || userRole === 'headteacher';
  const canCreateAnnouncement = canManageAnnouncements; // teachers cannot create
  const showDeleteSelectedButton = canManageAnnouncements && selectedAnnouncements.length > 0;

  if (loading || authLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={{ color: colors.text }}>Loading announcements...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}>
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

        {showDeleteSelectedButton && (
          <TouchableOpacity style={styles.deleteSelectedButton} onPress={handleDeleteSelected}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Delete Selected ({selectedAnnouncements.length})</Text>
          </TouchableOpacity>
        )}

        {announcements.length === 0 ? (
          <Text style={[styles.noAnnouncementsText, { color: colors.text }]}>No announcements available.</Text>
        ) : (
          announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onEdit={handleEdit}
              onDelete={handleDelete}
              showActions={canManageAnnouncements}
              isSelected={selectedAnnouncements.includes(announcement.id)}
              onSelect={canManageAnnouncements ? toggleSelectAnnouncement : undefined}
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
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>{editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}</Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '30' }]}
              placeholder="Title"
              placeholderTextColor={colors.text + '70'}
              value={title}
              onChangeText={setTitle}
            />
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '30' }]}
              placeholder="Content"
              placeholderTextColor={colors.text + '70'}
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
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 80,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  deleteSelectedButton: {
    backgroundColor: '#dc3545',
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
  noAnnouncementsText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
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
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
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