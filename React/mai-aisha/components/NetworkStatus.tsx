import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { offlineManager } from '@/lib/offline';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState(0);

  useEffect(() => {
    // Check initial status
    const checkStatus = async () => {
      const online = await offlineManager.isConnected();
      setIsOnline(online);
      
      const pending = await offlineManager.getPendingActions();
      setPendingActions(pending.length);
    };
    
    checkStatus();

    // Listen for network changes
    const unsubscribe = offlineManager.addNetworkListener((online) => {
      setIsOnline(online);
      if (online) {
        // When back online, check pending actions
        setTimeout(async () => {
          const pending = await offlineManager.getPendingActions();
          setPendingActions(pending.length);
        }, 1000);
      }
    });

    return unsubscribe;
  }, []);

  if (isOnline && pendingActions === 0) {
    return null; // Don't show anything when online and no pending actions
  }

  return (
    <View style={[styles.container, isOnline ? styles.syncing : styles.offline]}>
      <Ionicons 
        name={isOnline ? "sync" : "cloud-offline"} 
        size={16} 
        color="#fff" 
        style={styles.icon}
      />
      <Text style={styles.text}>
        {isOnline 
          ? pendingActions > 0 
            ? `Syncing ${pendingActions} changes...`
            : 'Online'
          : 'Offline Mode'
        }
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1000,
  },
  offline: {
    backgroundColor: '#ef4444',
  },
  syncing: {
    backgroundColor: '#f59e0b',
  },
  icon: {
    marginRight: 6,
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
