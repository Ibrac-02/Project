import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MessageCard } from '@/components/MessageCard';
import { Message, createMessage, deleteMessage, getMessagesForUser, updateMessage, markMessageAsRead } from '@/lib/messages';
import { useAuth, getAllUsers } from '@/lib/auth';
import { Picker } from '@react-native-picker/picker';
import { useTheme } from '@/contexts/ThemeContext';

export default function MessagesScreen() {
  const { user, role: userRole, loading: authLoading, userName } = useAuth();
  const { colors } = useTheme();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState<'announcement' | 'personal' | 'class' | 'staff'>('announcement');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);

  const fetchMessages = useCallback(async () => {
    if (authLoading || !user || !userRole) {
      return;
    }
    setLoading(true);
    try {
      const fetchedMessages = await getMessagesForUser(user.uid);
      setMessages(fetchedMessages);
      
      // Load all users for recipient selection
      const users = await getAllUsers();
      setAllUsers(users.filter(u => u.uid !== user.uid)); // Exclude current user
    } catch (error: any) {
      console.error("Error fetching messages:", error);
      Alert.alert("Error", "Failed to fetch messages: " + error.message);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user, userRole]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleCreateOrUpdateMessage = async () => {
    if (!user || !userRole || !title || !content) {
      Alert.alert("Error", "Please fill all required fields.");
      return;
    }

    // Check if personal message has recipients selected
    if (messageType === 'personal' && selectedRecipients.length === 0) {
      Alert.alert("Error", "Please select at least one recipient for direct messages.");
      return;
    }

    try {
      // Get all users to determine recipients
      const allUsers = await getAllUsers();
      let recipientIds: string[] = [];

      switch (messageType) {
        case 'announcement':
          recipientIds = allUsers.map(u => u.uid);
          break;
        case 'staff':
          recipientIds = allUsers.filter(u => u.role && ['admin', 'headteacher', 'teacher'].includes(u.role)).map(u => u.uid);
          break;
        case 'class':
          recipientIds = allUsers.filter(u => u.role === 'teacher').map(u => u.uid);
          break;
        case 'personal':
          // Use selected recipients for direct messages
          recipientIds = selectedRecipients;
          break;
      }

      const messageData = {
        title: title.trim(),
        content: content.trim(),
        senderId: user.uid,
        senderName: userName || 'Unknown',
        senderRole: userRole,
        recipientIds,
        isRead: {},
        messageType,
      };

      if (editingMessage) {
        await updateMessage(editingMessage.id, messageData);
        Alert.alert("Success", "Message updated successfully!");
      } else {
        await createMessage(messageData);
        Alert.alert("Success", "Message sent successfully!");
      }
      
      setIsModalVisible(false);
      setTitle('');
      setContent('');
      setEditingMessage(null);
      setSelectedRecipients([]);
      setMessageType('announcement');
      fetchMessages();
    } catch (error: any) {
      Alert.alert("Error", "Failed to send message: " + error.message);
    }
  };

  const handleEdit = (message: Message) => {
    setEditingMessage(message);
    setTitle(message.title);
    setContent(message.content);
    setMessageType(message.messageType);
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    Alert.alert(
      "Confirm Delete",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            try {
              await deleteMessage(id);
              Alert.alert("Success", "Message deleted successfully!");
              fetchMessages();
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete message: " + error.message);
            }
          }
        }
      ]
    );
  };

  const toggleSelectMessage = async (id: string) => {
    // Mark as read when selected
    if (user) {
      await markMessageAsRead(id, user.uid);
    }
    
    setSelectedMessages((prevSelected) =>
      prevSelected.includes(id) ? prevSelected.filter((mid) => mid !== id) : [...prevSelected, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) {
      Alert.alert("No Messages Selected", "Please select messages to delete.");
      return;
    }

    Alert.alert(
      "Confirm Deletion",
      `Are you sure you want to delete ${selectedMessages.length} selected message(s)?`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", onPress: async () => {
            try {
              await Promise.all(selectedMessages.map(id => deleteMessage(id)));
              Alert.alert("Success", `${selectedMessages.length} message(s) deleted successfully!`);
              setSelectedMessages([]);
              fetchMessages();
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete selected messages: " + error.message);
            }
          }
        }
      ]
    );
  };

  const canManageMessages = userRole === 'admin' || userRole === 'headteacher';
  const showDeleteSelectedButton = selectedMessages.length > 0;

  // Add sample messages for testing (remove this in production)
  const addSampleMessages = async () => {
    if (!user || !userName) return;
    
    try {
      const allUsers = await getAllUsers();
      const recipientIds = allUsers.map(u => u.uid);
      
      const sampleMessages = [
        {
          title: "Welcome to Mai Aisha Academy",
          content: "Welcome to our new messaging system! You can now receive important updates and announcements here.",
          senderId: user.uid,
          senderName: userName || 'Admin',
          senderRole: userRole || 'admin',
          recipientIds,
          isRead: {},
          messageType: 'announcement' as const,
        },
        {
          title: "System Update",
          content: "The school management system has been updated with new features including improved messaging and student management.",
          senderId: user.uid,
          senderName: userName || 'Admin',
          senderRole: userRole || 'admin',
          recipientIds,
          isRead: {},
          messageType: 'announcement' as const,
        }
      ];

      for (const msg of sampleMessages) {
        await createMessage(msg);
      }
      
      Alert.alert("Success", "Sample messages added!");
      fetchMessages();
    } catch (error: any) {
      Alert.alert("Error", "Failed to add sample messages: " + error.message);
    }
  };

  if (loading || authLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primaryBlue} />
        <Text style={{ color: colors.text }}>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]}>
        {canManageMessages && (
          <>
            <TouchableOpacity style={styles.createButton} onPress={() => {
              setEditingMessage(null);
              setTitle('');
              setContent('');
              setMessageType('announcement');
              setIsModalVisible(true);
            }}>
              <Ionicons name="add-circle-outline" size={24} color="#fff" />
              <Text style={styles.createButtonText}>Send New Message</Text>
            </TouchableOpacity>
            
            {messages.length === 0 && (
              <TouchableOpacity style={[styles.createButton, { backgroundColor: '#28a745' }]} onPress={addSampleMessages}>
                <Ionicons name="bulb-outline" size={24} color="#fff" />
                <Text style={styles.createButtonText}>Add Sample Messages</Text>
              </TouchableOpacity>
            )}
          </>
        )}

        {showDeleteSelectedButton && (
          <TouchableOpacity style={styles.deleteSelectedButton} onPress={handleDeleteSelected}>
            <Ionicons name="trash-outline" size={24} color="#fff" />
            <Text style={styles.createButtonText}>Delete Selected ({selectedMessages.length})</Text>
          </TouchableOpacity>
        )}

        {messages.length === 0 ? (
          <Text style={[styles.noMessagesText, { color: colors.text }]}>No messages available.</Text>
        ) : (
          messages.map((message) => (
            <MessageCard
              key={message.id}
              message={message}
              currentUserId={user?.uid || ''}
              onEdit={canManageMessages ? handleEdit : undefined}
              onDelete={canManageMessages ? handleDelete : undefined}
              showActions={canManageMessages}
              isSelected={selectedMessages.includes(message.id)}
              onSelect={toggleSelectMessage}
            />
          ))
        )}
      </ScrollView>

      {/* Create/Edit Message Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.cardBackground }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {editingMessage ? 'Edit Message' : 'Send New Message'}
            </Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '30' }]}
              placeholder="Message Title"
              placeholderTextColor={colors.text + '70'}
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: colors.text + '30' }]}
              placeholder="Message Content"
              placeholderTextColor={colors.text + '70'}
              multiline
              value={content}
              onChangeText={setContent}
            />

            <Text style={[styles.label, { color: colors.text }]}>Message Type</Text>
            <View style={[styles.pickerContainer, { backgroundColor: colors.background }]}>
              <Picker
                selectedValue={messageType}
                onValueChange={(itemValue) => {
                  setMessageType(itemValue);
                  if (itemValue !== 'personal') {
                    setSelectedRecipients([]); // Clear recipients for broadcast messages
                  }
                }}
                style={styles.picker}
              >
                <Picker.Item label="Announcement (Everyone)" value="announcement" />
                <Picker.Item label="Staff Only" value="staff" />
                <Picker.Item label="Teachers Only" value="class" />
                <Picker.Item label="Direct Message" value="personal" />
              </Picker>
            </View>

            {messageType === 'personal' && (
              <>
                <Text style={[styles.label, { color: colors.text }]}>Select Recipients</Text>
                <ScrollView style={styles.recipientsList} showsVerticalScrollIndicator={false}>
                  {allUsers.map((user) => (
                    <TouchableOpacity
                      key={user.uid}
                      style={[
                        styles.recipientItem,
                        { backgroundColor: colors.background },
                        selectedRecipients.includes(user.uid) && { backgroundColor: colors.primaryBlue + '20' }
                      ]}
                      onPress={() => {
                        setSelectedRecipients(prev => 
                          prev.includes(user.uid) 
                            ? prev.filter(id => id !== user.uid)
                            : [...prev, user.uid]
                        );
                      }}
                    >
                      <View style={styles.recipientInfo}>
                        <Text style={[styles.recipientName, { color: colors.text }]}>
                          {user.name || user.email}
                        </Text>
                        <Text style={[styles.recipientRole, { color: colors.text + '70' }]}>
                          {user.role}
                        </Text>
                      </View>
                      {selectedRecipients.includes(user.uid) && (
                        <Ionicons name="checkmark-circle" size={20} color={colors.primaryBlue} />
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => {
                setIsModalVisible(false);
                setTitle('');
                setContent('');
                setSelectedRecipients([]);
                setMessageType('announcement');
                setEditingMessage(null);
              }}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleCreateOrUpdateMessage}>
                <Text style={styles.buttonText}>{editingMessage ? 'Update' : 'Send'}</Text>
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
    padding: 16,
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
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  deleteSelectedButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  noMessagesText: {
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
    maxHeight: '80%',
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
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 20,
  },
  picker: {
    height: 50,
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
    fontWeight: '600',
  },
  recipientsList: {
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: '600',
  },
  recipientRole: {
    fontSize: 14,
    marginTop: 2,
    textTransform: 'capitalize',
  },
});
