import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';

export function DashboardHeader({
  title,
  userName,
  unreadCount = 0,
  onPressNotifications,
  onPressProfile,
  onPressMenu,
}: {
  title: string;
  userName?: string | null;
  unreadCount?: number;
  onPressNotifications?: () => void;
  onPressProfile?: () => void;
  onPressMenu?: () => void;
}) {
  const initials = (userName || 'U')
    .split(' ')
    .map((n) => n.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Image source={require('../../assets/images/icon.png')} style={styles.headerLogo} />
        <View>
          <Text style={styles.schoolName}>MAI AISHA ACADEMY</Text>
          <Text style={styles.headerDashboardTitle}>{title}</Text>
        </View>
      </View>
      <View style={styles.headerRight}>
        <TouchableOpacity onPress={onPressNotifications} style={styles.notificationIconContainer}>
          <Ionicons name="notifications-outline" size={24} color="#fff" />
          {unreadCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressProfile} style={styles.profileIconContainer}>
          <View style={styles.profileIcon}>
            <Text style={styles.profileText}>{initials}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={onPressMenu} style={styles.settingsIconContainer}>
          <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function GreetingCard({ children }: { children: React.ReactNode }) {
  return <View style={styles.greetingCard}>{children}</View>;
}

export function SummaryRow({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const horizontalPadding = 20;
  const gutter = 12;
  const columns = width >= 700 ? 3 : 2;
  const usable = width - horizontalPadding * 2;
  const itemWidth = (usable - gutter * (columns - 1)) / columns;

  return (
    <View style={styles.summaryRow}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as any, {
              containerStyle: [{ width: itemWidth }].concat((child as any).props?.containerStyle || []),
            })
          : child
      )}
    </View>
  );
}

export function SummaryBox({ label, value, containerStyle }: { label: string; value: number | string; containerStyle?: any }) {
  return (
    <View style={[styles.summaryBox, containerStyle]}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

export function QuickActionCard({
  iconName,
  title,
  onPress,
  containerStyle,
}: {
  iconName: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  onPress: () => void;
  containerStyle?: any;
}) {
  return (
    <TouchableOpacity style={[styles.card, containerStyle]} onPress={onPress}>
      <Ionicons name={iconName} size={26} color="#1E90FF" />
      <Text style={styles.cardTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

export function QuickActionsGrid({ children }: { children: React.ReactNode }) {
  const { width } = useWindowDimensions();
  const horizontalPadding = 14;
  const gutter = 14;
  const columns = width >= 900 ? 4 : width >= 650 ? 3 : 2;
  const usable = width - horizontalPadding * 2;
  const itemWidth = (usable - gutter * (columns - 1)) / columns;

  return (
    <View style={styles.cardGroupContainer}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as any, {
              containerStyle: [{ width: itemWidth }].concat((child as any).props?.containerStyle || []),
            })
          : child
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1E90FF',
    paddingTop: 70,
    paddingHorizontal: 20,
    paddingBottom: 30,
    elevation: 3,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerLogo: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
    marginRight: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'whitesmoke',
  },
  schoolName: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerDashboardTitle: { color: '#fff', fontSize: 14, fontWeight: '600' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  notificationIconContainer: { position: 'relative', marginRight: 15 },
  notificationBadge: {
    position: 'absolute',
    right: -5,
    top: -5,
    backgroundColor: 'red',
    borderRadius: 7,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  profileIconContainer: { position: 'relative' },
  profileIcon: {
    width: 28,
    height: 28,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'whitesmoke',
  },
  profileText: { color: '#1E90FF', fontSize: 12, fontWeight: 'bold' },
  settingsIconContainer: { marginRight: 5 },

  greetingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 3,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  summaryBox: {
    backgroundColor: '#fff',
    marginHorizontal: 6,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
  },
  summaryValue: { fontSize: 18, fontWeight: 'bold', color: '#1E90FF' },
  summaryLabel: { marginTop: 4, fontSize: 13, color: '#333' },

  cardGroupContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    paddingHorizontal: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    marginHorizontal: 7,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
