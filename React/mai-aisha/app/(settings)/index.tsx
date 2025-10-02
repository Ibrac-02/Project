import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { smoothNavigate } from '@/utils/navigation';
import AnimatedBackButton from '@/components/AnimatedBackButton';

export default function SettingsIndexScreen() {
  const navigate = (path: Parameters<typeof router.push>[0]) => smoothNavigate(path as string);
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header with Back Button */}
      <View style={styles.header}>
        <AnimatedBackButton useRoleBasedNavigation={true} />
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContainer, { backgroundColor: colors.background }]}>
        <View style={styles.contentContainer}>
      
        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/profile')}>
            <View style={styles.itemLeft}>
              <Ionicons name="person-circle-outline" size={22} color={colors.primaryBlue} />
              <Text style={[styles.itemText, { color: colors.text }]}>Profile</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/change-password')}>
            <View style={styles.itemLeft}>
              <Ionicons name="key-outline" size={22} color={colors.primaryBlue} />
              <Text style={[styles.itemText, { color: colors.text }]}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/delete-account')}>
            <View style={styles.itemLeft}>
              <Ionicons name="trash-outline" size={22} color={colors.danger} />
              <Text style={[styles.itemText, { color: colors.danger }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Preferences</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/notifications')}>
            <View style={styles.itemLeft}>
              <Ionicons name="notifications-outline" size={22} color={colors.primaryBlue} />
              <Text style={[styles.itemText, { color: colors.text }]}>Notifications</Text>
            </View>
             <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/appearance')}>
            <View style={styles.itemLeft}>
              <Ionicons name="color-palette-outline" size={22} color={colors.primaryBlue} />
              <Text style={[styles.itemText, { color: colors.text }]}>Appearance</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/about')}>
            <View style={styles.itemLeft}>
              <Ionicons name="information-circle-outline" size={22} color={colors.primaryBlue} />
              <Text style={[styles.itemText, { color: colors.text }]}>About App</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF',
    paddingHorizontal: 13,
    paddingVertical: 30,
    paddingTop: 50, // Add extra padding for status bar
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'left',
    marginRight: 40, // Balance the back button
  },
  headerRight: {
    width: 40, // Same width as back button for centering
  },
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    paddingVertical: 20,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
 
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#555',
    marginBottom: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  itemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
});
