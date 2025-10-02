import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import { UserProfile, SchoolClass } from './types';

// Storage keys
const STORAGE_KEYS = {
  STUDENTS: 'offline_students',
  TEACHERS: 'offline_teachers',
  HEADTEACHERS: 'offline_headteachers',
  CLASSES: 'offline_classes',
  PENDING_ACTIONS: 'offline_pending_actions',
  LAST_SYNC: 'offline_last_sync',
  IS_OFFLINE: 'offline_mode',
};

// Types for offline actions
export interface PendingAction {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'students' | 'teachers' | 'headteachers' | 'classes';
  data: any;
  timestamp: number;
}

export interface OfflineData {
  students: UserProfile[];
  teachers: UserProfile[];
  headteachers: UserProfile[];
  classes: SchoolClass[];
}

class OfflineManager {
  private isOnline: boolean = true;
  private listeners: ((isOnline: boolean) => void)[] = [];
  private initialized: boolean = false;

  // Initialize network listener (lazy initialization)
  private initNetworkListener() {
    if (this.initialized || Platform.OS === 'web') {
      return;
    }
    
    this.initialized = true;
    
    try {
      NetInfo.addEventListener(state => {
        const wasOffline = !this.isOnline;
        this.isOnline = state.isConnected ?? false;
        
        // Store offline status (only on native platforms)
        if (Platform.OS !== 'web') {
          AsyncStorage.setItem(STORAGE_KEYS.IS_OFFLINE, JSON.stringify(!this.isOnline)).catch(console.error);
        }
        
        // Notify listeners
        this.listeners.forEach(listener => listener(this.isOnline));
        
        // If we just came back online, sync pending actions
        if (wasOffline && this.isOnline) {
          this.syncPendingActions();
        }
      });
    } catch (error) {
      console.warn('Failed to initialize network listener:', error);
    }
  }

  // Add network status listener
  addNetworkListener(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Check if currently online
  async isConnected(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return navigator?.onLine ?? true;
    }
    
    this.initNetworkListener(); // Initialize on first use
    
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.warn('Failed to fetch network state:', error);
      return true; // Assume online on error
    }
  }

  // Store data offline
  async storeOfflineData(key: keyof typeof STORAGE_KEYS, data: any): Promise<void> {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
      } catch (error) {
        console.error('Error storing offline data on web:', error);
      }
      return;
    }
    
    try {
      await AsyncStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
    } catch (error) {
      console.error('Error storing offline data:', error);
    }
  }

  // Get offline data
  async getOfflineData<T>(key: keyof typeof STORAGE_KEYS): Promise<T | null> {
    if (Platform.OS === 'web') {
      try {
        const data = localStorage.getItem(STORAGE_KEYS[key]);
        return data ? JSON.parse(data) : null;
      } catch (error) {
        console.error('Error getting offline data on web:', error);
        return null;
      }
    }
    
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS[key]);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting offline data:', error);
      return null;
    }
  }

  // Store students offline
  async storeStudents(students: UserProfile[]): Promise<void> {
    await this.storeOfflineData('STUDENTS', students);
  }

  // Get offline students
  async getOfflineStudents(): Promise<UserProfile[]> {
    return (await this.getOfflineData<UserProfile[]>('STUDENTS')) || [];
  }

  // Store teachers offline
  async storeTeachers(teachers: UserProfile[]): Promise<void> {
    await this.storeOfflineData('TEACHERS', teachers);
  }

  // Get offline teachers
  async getOfflineTeachers(): Promise<UserProfile[]> {
    return (await this.getOfflineData<UserProfile[]>('TEACHERS')) || [];
  }

  // Store headteachers offline
  async storeHeadteachers(headteachers: UserProfile[]): Promise<void> {
    await this.storeOfflineData('HEADTEACHERS', headteachers);
  }

  // Get offline headteachers
  async getOfflineHeadteachers(): Promise<UserProfile[]> {
    return (await this.getOfflineData<UserProfile[]>('HEADTEACHERS')) || [];
  }

  // Store classes offline
  async storeClasses(classes: SchoolClass[]): Promise<void> {
    await this.storeOfflineData('CLASSES', classes);
  }

  // Get offline classes
  async getOfflineClasses(): Promise<SchoolClass[]> {
    return (await this.getOfflineData<SchoolClass[]>('CLASSES')) || [];
  }

  // Add pending action for sync when online
  async addPendingAction(action: Omit<PendingAction, 'id' | 'timestamp'>): Promise<void> {
    const pendingActions = await this.getPendingActions();
    const newAction: PendingAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    
    pendingActions.push(newAction);
    await this.storeOfflineData('PENDING_ACTIONS', pendingActions);
  }

  // Get pending actions
  async getPendingActions(): Promise<PendingAction[]> {
    return (await this.getOfflineData<PendingAction[]>('PENDING_ACTIONS')) || [];
  }

  // Clear pending actions
  async clearPendingActions(): Promise<void> {
    await this.storeOfflineData('PENDING_ACTIONS', []);
  }

  // Sync pending actions when online
  async syncPendingActions(): Promise<void> {
    if (!this.isOnline) return;

    const pendingActions = await this.getPendingActions();
    if (pendingActions.length === 0) return;

    console.log(`Syncing ${pendingActions.length} pending actions...`);

    // Here you would implement the actual sync logic
    // For now, we'll just clear them after a delay
    setTimeout(async () => {
      await this.clearPendingActions();
      await this.updateLastSync();
      console.log('Sync completed');
    }, 2000);
  }

  // Update last sync timestamp
  async updateLastSync(): Promise<void> {
    await this.storeOfflineData('LAST_SYNC', Date.now());
  }

  // Get last sync timestamp
  async getLastSync(): Promise<number | null> {
    return await this.getOfflineData<number>('LAST_SYNC');
  }

  // Clear all offline data
  async clearOfflineData(): Promise<void> {
    const keys = Object.values(STORAGE_KEYS);
    
    if (Platform.OS === 'web') {
      keys.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing offline data on web:', error);
        }
      });
      return;
    }
    
    await Promise.all(keys.map(key => AsyncStorage.removeItem(key).catch(console.error)));
  }

  // Get offline status
  getNetworkStatus(): boolean {
    return this.isOnline;
  }
}

// Export singleton instance
export const offlineManager = new OfflineManager();

// Utility functions for offline-first operations
export const withOfflineSupport = async <T>(
  onlineOperation: () => Promise<T>,
  offlineOperation: () => Promise<T>,
  cacheOperation?: (data: T) => Promise<void>
): Promise<T> => {
  const isOnline = await offlineManager.isConnected();
  
  if (isOnline) {
    try {
      const result = await onlineOperation();
      // Cache the result for offline use
      if (cacheOperation) {
        await cacheOperation(result);
      }
      return result;
    } catch (error) {
      console.warn('Online operation failed, falling back to offline:', error);
      return await offlineOperation();
    }
  } else {
    return await offlineOperation();
  }
};
