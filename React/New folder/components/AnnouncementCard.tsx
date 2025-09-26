import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Announcement } from '../lib/announcements';
import { useAuth } from '../lib/auth';

interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit?: (announcement: Announcement) => void;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ announcement, onEdit, onDelete, isSelected, onSelect }) => {
  const { user, userRole } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const isAuthor = user?.uid === announcement.createdByUserId;
  const isAdmin = userRole === 'admin';
  const isHeadteacher = userRole === 'headteacher';

  const canEdit = isAdmin || (isHeadteacher && (announcement.scope === 'school-wide' || announcement.scope === 'staff-only')) || (isAuthor && announcement.scope === 'class-' + user?.uid);
  const canDelete = isAdmin || isAuthor;

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  return (
    <View style={[styles.card, isSelected && styles.selectedCard]}>
      {onSelect && (
        <TouchableOpacity onPress={() => onSelect(announcement.id)} style={styles.checkboxContainer}>
          <Ionicons
            name={isSelected ? 'checkbox-outline' : 'square-outline'}
            size={24}
            color={isSelected ? '#1E90FF' : '#888'}
          />
        </TouchableOpacity>
      )}
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{announcement.title}</Text>
        <Text style={styles.content} numberOfLines={isExpanded ? undefined : 3}>
          {announcement.content}
        </Text>
        {announcement.content.length > 120 && ( // Arbitrary length for truncation
          <TouchableOpacity onPress={() => setIsExpanded(!isExpanded)}>
            <Text style={styles.readMoreButtonText}>
              {isExpanded ? 'Show Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
        <Text style={styles.meta}>Posted by: {announcement.createdByUserRole} on {formatDate(announcement.createdAt)}</Text>
        {announcement.expiresAt && (
          <Text style={styles.meta}>Expires: {formatDate(announcement.expiresAt)}</Text>
        )}
        {(canEdit || canDelete) && (
          <View style={styles.actions}>
            {canEdit && onEdit && (
              <TouchableOpacity onPress={() => onEdit(announcement)} style={styles.actionButton}>
                <Ionicons name="create-outline" size={20} color="#1E90FF" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
            )}
            {canDelete && onDelete && (
              <TouchableOpacity onPress={() => onDelete(announcement.id)} style={styles.actionButton}>
                <Ionicons name="trash-outline" size={20} color="#FF4500" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  selectedCard: {
    borderColor: '#1E90FF',
    borderWidth: 2,
  },
  checkboxContainer: {
    marginRight: 10,
    paddingTop: 5,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  content: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
  },
  readMoreButtonText: {
    color: '#1E90FF',
    marginTop: -5,
    marginBottom: 10,
  },
  meta: {
    fontSize: 12,
    color: '#888',
    marginBottom: 3,
  },
  actions: {
    flexDirection: 'row',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  actionButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#1E90FF',
  },
});
