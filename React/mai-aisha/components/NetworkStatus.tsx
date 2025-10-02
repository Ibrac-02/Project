import React, { useState, useEffect } from 'react';
import { Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { offlineManager } from '@/lib/offline';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingActions, setPendingActions] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [lastStatus, setLastStatus] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];

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
      // Only show notification if status actually changed
      if (online !== lastStatus) {
        setIsOnline(online);
        setLastStatus(online);
        setShowNotification(true);
        
        // Fade in animation
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
        
        // Auto-hide notification after 3 seconds with fade out
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowNotification(false);
          });
        }, 3000);
        
        if (online) {
          // When back online, check pending actions
          setTimeout(async () => {
            const pending = await offlineManager.getPendingActions();
            setPendingActions(pending.length);
          }, 1000);
        }
      }
    });

    return unsubscribe;
  }, [lastStatus, fadeAnim]);

  // Only show notification when there's a status change or pending actions
  if (!showNotification && (isOnline && pendingActions === 0)) {
    return null;
  }

  return (
    <Animated.View style={[
      styles.container, 
      isOnline ? styles.syncing : styles.offline,
      { opacity: fadeAnim }
    ]}>
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
            : 'Back Online'
          : 'Offline Mode'
        }
      </Text>
    </Animated.View>
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
