import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MessageCard } from '@/components/MessageCard';
import { Message, createMessage, deleteMessage, getMessagesForUser, updateMessage, markMessageAsRead, getUnreadMessageCount } from '@/lib/messages';
import { useAuth, getAllUsers } from '@/lib/auth';
import { Picker } from '@react-native-picker/picker';

export default function MessagesScreen() {
  const { user, role: userRole, loading: authLoading, userName } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMessage, setEditingMessage] = useState<Message | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [messageType, setMessageType] = useState<'announcement' | 'personal' | 'class' | 'staff'>('announcement');
  const [selectedMessages, setSelectedMessages] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchMessages = useCallback(async () => {
    if (authLoading || !user || !userRole) {
      return;
    }
    setLoading(true);
    try {
      const fetchedMessages = await getMessagesForUser(user.uid);
      setMessages(fetchedMessages);
      
      // Get unread count
      const count = await getUnreadMessageCount(user.uid);
      setUnreadCount(count);
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

    // Role guard: only admin/headteacher can create messages
    if (!(userRole === 'admin' || userRole === 'headteacher')) {
      Alert.alert("Permission Denied", "Only administrators or headteachers can send messages.");
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
          // For now, send to all - in real app, you'd have recipient selection
          recipientIds = allUsers.map(u => u.uid);
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
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1E90FF" />
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
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
          <Text style={styles.noMessagesText}>No messages available.</Text>
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
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingMessage ? 'Edit Message' : 'Send New Message'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Message Title"
              value={title}
              onChangeText={setTitle}
            />
            
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Message Content"
              multiline
              value={content}
              onChangeText={setContent}
            />

            <Text style={styles.label}>Message Type</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={messageType}
                onValueChange={(itemValue) => setMessageType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Announcement (Everyone)" value="announcement" />
                <Picker.Item label="Staff Only" value="staff" />
                <Picker.Item label="Teachers Only" value="class" />
                <Picker.Item label="Personal" value="personal" />
              </Picker>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
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
    backgroundColor: '#f0f2f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  unreadBadge: {
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
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
    fontWeight: 'bold',
  },
});
