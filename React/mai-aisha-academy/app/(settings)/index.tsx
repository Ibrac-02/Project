import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function SettingsIndexScreen() {
  const navigate = (path: Parameters<typeof router.push>[0]) => router.push(path);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
      
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/profile')}>
            <View style={styles.itemLeft}>
              <Ionicons name="person-circle-outline" size={22} color="#1E90FF" />
              <Text style={styles.itemText}>Profile</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/change-password')}>
            <View style={styles.itemLeft}>
              <Ionicons name="key-outline" size={22} color="#1E90FF" />
              <Text style={styles.itemText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/delete-account')}>
            <View style={styles.itemLeft}>
              <Ionicons name="trash-outline" size={22} color="#dc3545" />
              <Text style={[styles.itemText, { color: '#dc3545' }]}>Delete Account</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/notifications')}>
            <View style={styles.itemLeft}>
              <Ionicons name="notifications-outline" size={22} color="#1E90FF" />
              <Text style={styles.itemText}>Notifications</Text>
            </View>
             <Ionicons name="chevron-forward-outline" size={18} color="#555" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/appearance')}>
            <View style={styles.itemLeft}>
              <Ionicons name="color-palette-outline" size={22} color="#1E90FF" />
              <Text style={styles.itemText}>Appearance</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#555" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <TouchableOpacity style={styles.item} onPress={() => navigate('/(settings)/about')}>
            <View style={styles.itemLeft}>
              <Ionicons name="information-circle-outline" size={22} color="#1E90FF" />
              <Text style={styles.itemText}>About App</Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={18} color="#555" />
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#f0f2f5',
    paddingVertical: 20,
  },
  container: {
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


