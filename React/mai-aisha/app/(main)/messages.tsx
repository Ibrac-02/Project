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
  const [messageUnreadCounts, setMessageUnreadCounts] = useState<{[messageId: string]: number}>({});

  const fetchMessages = useCallback(async () => {
    if (authLoading || !user || !userRole) {
      return;
    }
    setLoading(true);
    try {
      const fetchedMessages = await getMessagesForUser(user.uid);
      
      // Load all users for recipient selection
      const users = await getAllUsers();
      setAllUsers(users.filter(u => u.uid !== user.uid)); // Exclude current user
      
      // Group messages by sender and get latest message from each
      const groupedBySender = new Map<string, Message[]>();
      fetchedMessages.forEach(message => {
        const senderId = message.senderId;
        if (!groupedBySender.has(senderId)) {
          groupedBySender.set(senderId, []);
        }
        groupedBySender.get(senderId)!.push(message);
      });
      
      // Get latest message from each sender and calculate unread counts
      const latestMessages: Message[] = [];
      const unreadCounts: {[messageId: string]: number} = {};
      
      groupedBySender.forEach((messages, senderId) => {
        // Sort messages by date and get the latest one
        const sortedMessages = messages.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
        const latestMessage = sortedMessages[0];
        latestMessages.push(latestMessage);
        
        // Count unread messages from this sender
        if (senderId !== user.uid) {
          const unreadFromSender = messages.filter(m => !m.isRead[user.uid]).length;
          unreadCounts[latestMessage.id] = unreadFromSender;
        }
      });
      
      // Sort latest messages by date (newest first)
      latestMessages.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
      setMessages(latestMessages);
      setMessageUnreadCounts(unreadCounts);
      
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
      "Delete Message",
      "Are you sure you want to delete this message? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete", style: "destructive", onPress: async () => {
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

  const handleDeleteSelected = async () => {
    if (selectedMessages.length === 0) {
      Alert.alert("No Messages Selected", "Please select messages to delete.");
      return;
    }

    Alert.alert(
      "Delete Messages",
      `Are you sure you want to delete ${selectedMessages.length} message(s)? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete All", style: "destructive", onPress: async () => {
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

  const handleDeleteAllMessages = async () => {
    Alert.alert(
      "Delete All Messages",
      "Are you sure you want to delete ALL your messages? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Delete All", style: "destructive", onPress: async () => {
            try {
              const userMessages = messages.filter(m => m.senderId === user?.uid || m.recipientIds.includes(user?.uid || ''));
              await Promise.all(userMessages.map(m => deleteMessage(m.id)));
              Alert.alert("Success", "All messages deleted successfully!");
              setSelectedMessages([]);
              fetchMessages();
            } catch (error: any) {
              Alert.alert("Error", "Failed to delete all messages: " + error.message);
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


  const canManageMessages = userRole === 'admin' || userRole === 'headteacher';
  const showDeleteSelectedButton = selectedMessages.length > 0;

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

        {/* Selection Mode Header */}
        {selectedMessages.length > 0 && (
          <View style={[styles.selectionHeader, { backgroundColor: colors.primaryBlue + '15', borderColor: colors.primaryBlue + '30' }]}>
            <Text style={[styles.selectionText, { color: colors.primaryBlue }]}>
              {selectedMessages.length} message(s) selected
            </Text>
            <TouchableOpacity onPress={() => setSelectedMessages([])} style={styles.clearSelection}>
              <Text style={[styles.clearSelectionText, { color: colors.primaryBlue }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="chatbubbles-outline" size={64} color={colors.text + '30'} />
            <Text style={[styles.noMessagesText, { color: colors.text }]}>No messages yet</Text>
            <Text style={[styles.emptySubtext, { color: colors.text + '60' }]}>Messages will appear here when you receive them</Text>
          </View>
        ) : (
          <View style={styles.messagesList}>
            {messages.map((message) => {
              const isOwnMessage = message.senderId === user?.uid;
              const canDelete = canManageMessages || isOwnMessage;
              
              return (
                <MessageCard
                  key={message.id}
                  message={message}
                  currentUserId={user?.uid || ''}
                  onEdit={canManageMessages ? handleEdit : undefined}
                  onDelete={canDelete ? handleDelete : undefined}
                  showActions={canDelete}
                  isSelected={selectedMessages.includes(message.id)}
                  onSelect={toggleSelectMessage}
                  unreadCount={messageUnreadCounts[message.id] || 0}
                />
              );
            })}
          </View>
        )}
      </ScrollView>
      
      {/* Message Management Buttons */}
      {showDeleteSelectedButton && (
        <TouchableOpacity 
          style={[styles.deleteSelectedFab, { backgroundColor: '#dc3545' }]} 
          onPress={handleDeleteSelected}
        >
          <Ionicons name="trash" size={20} color="#fff" />
          <Text style={styles.fabText}>{selectedMessages.length}</Text>
        </TouchableOpacity>
      )}
      
      {/* Floating Action Button for new message */}
      {canManageMessages && (
        <TouchableOpacity 
          style={[styles.fab, { backgroundColor: colors.primaryBlue }]} 
          onPress={() => {
            setEditingMessage(null);
            setTitle('');
            setContent('');
            setMessageType('announcement');
            setIsModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      )}
      
      {/* Delete All Messages Button */}
      {messages.length > 0 && (
        <TouchableOpacity 
          style={[styles.deleteAllFab, { backgroundColor: '#6c757d' }]} 
          onPress={handleDeleteAllMessages}
        >
          <Ionicons name="trash-outline" size={20} color="#fff" />
        </TouchableOpacity>
      )}

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
    flexGrow: 1,
  },
  messagesList: {
    flex: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 100, // Above bottom navigation
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  deleteSelectedFab: {
    position: 'absolute',
    bottom: 100,
    right: 90, // Next to main FAB
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#dc3545',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
  },
  deleteAllFab: {
    position: 'absolute',
    bottom: 170, // Above other FABs
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 10,
  },
  selectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  selectionText: {
    fontSize: 16,
    fontWeight: '600',
  },
  clearSelection: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  clearSelectionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  noMessagesText: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalContent: {
    borderRadius: 20,
    padding: 28,
    width: '92%',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 18,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 24,
  },
  picker: {
    height: 54,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
    gap: 16,
  },
  cancelButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  recipientsList: {
    maxHeight: 220,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
  },
  recipientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recipientInfo: {
    flex: 1,
  },
  recipientName: {
    fontSize: 17,
    fontWeight: '700',
  },
  recipientRole: {
    fontSize: 15,
    marginTop: 4,
    textTransform: 'capitalize',
    opacity: 0.7,
  },
});
