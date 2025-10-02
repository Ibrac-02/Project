import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Message } from '@/lib/messages';
import { useTheme } from '@/contexts/ThemeContext';

export function MessageCard({
  message,
  currentUserId,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  showActions = true,
  unreadCount = 0,
}: {
  message: Message;
  currentUserId: string;
  onEdit?: (message: Message) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showActions?: boolean;
  unreadCount?: number;
}) {
  const { colors } = useTheme();
  const isUnread = !message.isRead[currentUserId];
  const timeAgo = getTimeAgo(message.createdAt.toDate());
  const isFromCurrentUser = message.senderId === currentUserId;
  
  const handleLongPress = () => {
    if (onSelect) {
      onSelect(message.id);
    }
  };
  
  const handleQuickDelete = () => {
    if (onDelete && (isFromCurrentUser || showActions)) {
      Alert.alert(
        "Delete Message",
        "Delete this message?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: () => onDelete(message.id) }
        ]
      );
    }
  };
  
  return (
    <TouchableOpacity
      style={[
        styles.chatItem,
        { backgroundColor: colors.cardBackground },
        isSelected && { backgroundColor: colors.primaryBlue + '15', borderColor: colors.primaryBlue, borderWidth: 2 }
      ]}
      onPress={() => onSelect?.(message.id)}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      {/* Avatar */}
      <View style={[styles.avatar, getAvatarColor(message.senderRole)]}>
        <Text style={styles.avatarText}>
          {getInitials(message.senderName)}
        </Text>
        {/* Online indicator for active users */}
        <View style={styles.onlineIndicator} />
      </View>

      {/* Chat Content */}
      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={[styles.chatName, { color: colors.text }]} numberOfLines={1}>
            {message.senderName}
          </Text>
          <Text style={[styles.chatTime, { color: colors.text + '60' }]}>
            {timeAgo}
          </Text>
        </View>
        
        <View style={styles.messageRow}>
          {/* Message preview with status icons */}
          <View style={styles.messagePreviewContainer}>
            {isFromCurrentUser && (
              <Ionicons 
                name="checkmark-done" 
                size={16} 
                color={isUnread ? colors.text + '60' : '#4FC3F7'} 
                style={styles.statusIcon}
              />
            )}
            <Text 
              style={[
                styles.messagePreview, 
                { color: colors.text + '80' },
                isUnread && !isFromCurrentUser && { color: colors.text, fontWeight: '600' }
              ]} 
              numberOfLines={1}
            >
              {message.content}
            </Text>
          </View>
          
          {/* Unread count badge */}
          {unreadCount > 0 && !isFromCurrentUser && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Actions for message management */}
      {(showActions || isFromCurrentUser) && (
        <View style={styles.actionMenu}>
          {onDelete && (
            <TouchableOpacity onPress={handleQuickDelete} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={16} color="#dc3545" />
            </TouchableOpacity>
          )}
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(message)} style={styles.editButton}>
              <Ionicons name="pencil-outline" size={16} color={colors.primaryBlue} />
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

// Helper functions
function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'now';
  if (diffInMinutes < 60) return `${diffInMinutes}m`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  
  return date.toLocaleDateString();
}

function getAvatarColor(role: string) {
  switch (role) {
    case 'admin': return { backgroundColor: '#FF6B6B' };
    case 'headteacher': return { backgroundColor: '#4ECDC4' };
    case 'teacher': return { backgroundColor: '#45B7D1' };
    default: return { backgroundColor: '#96CEB4' };
  }
}

// Removed unused helper functions to fix lint warnings

const styles = StyleSheet.create({
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5E7',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: '#fff',
  },
  chatContent: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 17,
    fontWeight: '600',
    flex: 1,
  },
  chatTime: {
    fontSize: 13,
    marginLeft: 8,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    marginRight: 4,
  },
  messagePreview: {
    fontSize: 15,
    lineHeight: 20,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  actionMenu: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#dc354510',
  },
  editButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#1E90FF10',
  },
  // Legacy styles for compatibility
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  messageCardSelected: {
    backgroundColor: '#f8f9ff',
  },
  messageCardUnread: {
    backgroundColor: '#f8f9ff',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  senderAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  senderInitials: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  senderDetails: {
    flex: 1,
  },
  senderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  senderRole: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E90FF',
    marginLeft: 8,
  },
  messageContent: {
    marginBottom: 12,
  },
  messageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  unreadText: {
    color: '#1E90FF',
    fontWeight: '700',
  },
  typeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  typeBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  messageActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
});
