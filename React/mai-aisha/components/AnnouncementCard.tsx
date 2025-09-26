import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Announcement } from '@/lib/announcements';

export function AnnouncementCard({
  announcement,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  showActions = true,
}: {
  announcement: Announcement;
  onEdit: (a: Announcement) => void;
  onDelete: (id: string) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  showActions?: boolean;
}) {
  return (
    <TouchableOpacity
      style={[styles.card, isSelected && styles.cardSelected]}
      onPress={() => onSelect?.(announcement.id)}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        <Text style={styles.title}>{announcement.title}</Text>
        {announcement.content ? (
          <Text style={styles.contentText}>{announcement.content}</Text>
        ) : null}
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>Scope: {announcement.scope}</Text>
          <Text style={styles.metaText}>
            {new Date(announcement.createdAt.toMillis()).toLocaleString()}
          </Text>
        </View>
      </View>
      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={() => onEdit(announcement)} style={styles.iconBtn}>
            <Ionicons name="pencil-outline" size={20} color="#1E90FF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDelete(announcement.id)} style={styles.iconBtn}>
            <Ionicons name="trash-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardSelected: {
    borderWidth: 1,
    borderColor: '#1E90FF',
  },
  content: { flex: 1, paddingRight: 8 },
  title: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 4 },
  contentText: { fontSize: 14, color: '#555' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
  metaText: { fontSize: 12, color: '#777' },
  actions: { flexDirection: 'row' },
  iconBtn: { marginLeft: 8, padding: 6 },
});
