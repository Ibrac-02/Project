import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { smoothNavigate } from '@/utils/navigation';
import AnimatedBackButton from '@/components/AnimatedBackButton';
import { useAuth } from '@/lib/auth';

export default function SettingsIndexScreen() {
  const navigate = (path: string) => smoothNavigate(path);
  const { colors } = useTheme();
  const { userProfile } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Modern Header */}
      <View style={[styles.header, { backgroundColor: colors.primaryBlue }]}>
        <AnimatedBackButton useRoleBasedNavigation={true} />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Manage your account & preferences</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* User Overview Card */}
        <View style={[styles.overviewCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, { backgroundColor: colors.primaryBlue + '20' }]}>
              <Ionicons name="person" size={32} color={colors.primaryBlue} />
            </View>
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: colors.text }]}>{userProfile?.name || 'User'}</Text>
              <Text style={[styles.userEmail, { color: colors.text }]}>{userProfile?.email || 'username@example.com'}</Text>
              <Text style={[styles.userRole, { color: colors.primaryBlue }]}>
                {userProfile?.role?.toUpperCase() || 'USER'}
              </Text>
            </View>
          </View>
        </View>



        {/* Account Settings Card */}
        <View style={[styles.settingsCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Settings</Text>
          
          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => navigate('/(settings)/profile')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: colors.primaryBlue + '20' }]}>
                <Ionicons name="person-outline" size={20} color={colors.primaryBlue} />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Profile</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text }]}>Edit personal information</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => navigate('/(settings)/change-password')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#F59E0B' + '20' }]}>
                <Ionicons name="key-outline" size={20} color="#F59E0B" />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Security</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text }]}>Change password & security</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => navigate('/(settings)/notifications')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#8B5CF6' + '20' }]}>
                <Ionicons name="notifications-outline" size={20} color="#8B5CF6" />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Notifications</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text }]}>Manage notification preferences</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.settingItem, { borderBottomColor: colors.border }]} onPress={() => navigate('/(settings)/appearance')}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: '#10B981' + '20' }]}>
                <Ionicons name="color-palette-outline" size={20} color="#10B981" />
              </View>
              <View>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Appearance</Text>
                <Text style={[styles.settingSubtitle, { color: colors.text }]}>Theme & display settings</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>
        </View>

        {/* Danger Zone Card */}
        <View style={[styles.dangerCard, { backgroundColor: colors.cardBackground, borderColor: colors.danger + '30' }]}>
          <Text style={[styles.dangerTitle, { color: colors.danger }]}>Danger Zone</Text>
          
          <TouchableOpacity 
            style={[styles.dangerButton, { borderColor: colors.danger + '30' }]} 
            onPress={() => navigate('/(settings)/delete-account')}
          >
            <Ionicons name="trash-outline" size={20} color={colors.danger} />
            <Text style={[styles.dangerButtonText, { color: colors.danger }]}>Delete Account</Text>
          </TouchableOpacity>
        </View>

        {/* About Card */}
        <View style={[styles.aboutCard, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.aboutItem} onPress={() => navigate('/(settings)/about')}>
            <View style={styles.aboutLeft}>
              <Ionicons name="information-circle-outline" size={24} color={colors.primaryBlue} />
              <Text style={[styles.aboutText, { color: colors.text }]}>About Mai Aisha Academy</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color={colors.icon} />
          </TouchableOpacity>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 50,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  
  // User Overview Card
  overviewCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 4,
  },
  userRole: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  // Statistics Grid
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  statSubtext: {
    fontSize: 12,
    opacity: 0.7,
  },

  // Chart Card
  chartCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  chartSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressRing: {
    position: 'relative',
  },
  progressBackground: {
    borderWidth: 4,
    opacity: 0.2,
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  chartText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  chartPercentage: {
    fontSize: 16,
    fontWeight: '700',
  },
  storageDetails: {
    gap: 8,
  },
  storageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storageIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  storageLabel: {
    flex: 1,
    fontSize: 14,
  },
  storageValue: {
    fontSize: 14,
    fontWeight: '600',
  },

  // Document Management Card
  documentCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 12,
  },
  documentActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    gap: 8,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
  },

  // Settings Card
  settingsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    // border color is applied via inline style using theme
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    opacity: 0.7,
  },

  // Danger Zone Card
  dangerCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 8,
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },

  // About Card
  aboutCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  aboutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aboutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  aboutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
});
