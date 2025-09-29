import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Message } from '@/lib/messages';

export function MessageCard({
  message,
  currentUserId,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  showActions = true,
}: {
  message: Message;
  currentUserId: string;
  onEdit?: (message: Message) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showActions?: boolean;
}) {
  const isUnread = !message.isRead[currentUserId];
  const timeAgo = getTimeAgo(message.createdAt.toDate());
  
  return (
    <TouchableOpacity
      style={[
        styles.messageCard,
        isSelected && styles.messageCardSelected,
        isUnread && styles.messageCardUnread
      ]}
      onPress={() => onSelect?.(message.id)}
      activeOpacity={0.8}
    >
      {/* Sender Info */}
      <View style={styles.messageHeader}>
        <View style={styles.senderInfo}>
          <View style={[styles.senderAvatar, getAvatarColor(message.senderRole)]}>
            <Text style={styles.senderInitials}>
              {getInitials(message.senderName)}
            </Text>
          </View>
          <View style={styles.senderDetails}>
            <View style={styles.senderRow}>
              <Text style={[styles.senderName, isUnread && styles.unreadText]}>
                {message.senderName}
              </Text>
              <Text style={styles.messageTime}>{timeAgo}</Text>
            </View>
            <Text style={styles.senderRole}>{formatRole(message.senderRole)}</Text>
          </View>
        </View>
        
        {isUnread && <View style={styles.unreadDot} />}
      </View>

      {/* Message Content */}
      <View style={styles.messageContent}>
        <Text style={[styles.messageTitle, isUnread && styles.unreadText]} numberOfLines={1}>
          {message.title}
        </Text>
        <Text style={styles.messagePreview} numberOfLines={2}>
          {message.content}
        </Text>
      </View>

      {/* Message Type Badge */}
      <View style={[styles.typeBadge, getTypeBadgeColor(message.messageType)]}>
        <Text style={styles.typeBadgeText}>{formatMessageType(message.messageType)}</Text>
      </View>

      {/* Actions */}
      {showActions && (
        <View style={styles.messageActions}>
          {onEdit && (
            <TouchableOpacity onPress={() => onEdit(message)} style={styles.actionButton}>
              <Ionicons name="pencil-outline" size={18} color="#1E90FF" />
            </TouchableOpacity>
          )}
          {onDelete && (
            <TouchableOpacity onPress={() => onDelete(message.id)} style={styles.actionButton}>
              <Ionicons name="trash-outline" size={18} color="#FF3B30" />
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

function getTypeBadgeColor(type: string) {
  switch (type) {
    case 'announcement': return { backgroundColor: '#1E90FF' };
    case 'personal': return { backgroundColor: '#28a745' };
    case 'class': return { backgroundColor: '#ffc107' };
    case 'staff': return { backgroundColor: '#6f42c1' };
    default: return { backgroundColor: '#6c757d' };
  }
}

function formatRole(role: string): string {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'headteacher': return 'Head Teacher';
    case 'teacher': return 'Teacher';
    default: return role;
  }
}

function formatMessageType(type: string): string {
  switch (type) {
    case 'announcement': return 'All';
    case 'personal': return 'Personal';
    case 'class': return 'Class';
    case 'staff': return 'Staff';
    default: return type;
  }
}

const styles = StyleSheet.create({
  messageCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  messageCardSelected: {
    borderWidth: 1,
    borderColor: '#1E90FF',
    backgroundColor: '#f8f9ff',
  },
  messageCardUnread: {
    backgroundColor: '#f8f9ff',
    borderLeftColor: '#1E90FF',
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
  messagePreview: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
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
