import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

export class UpdateService {
  static async checkForUpdates(): Promise<void> {
    if (__DEV__) {
      console.log('Skipping update check in development mode');
      return;
    }

    try {
      console.log('Checking for updates...');
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        console.log('Update available, downloading...');
        Alert.alert(
          'Update Available',
          'A new version is available. The app will update and restart.',
          [
            {
              text: 'Update Now',
              onPress: async () => {
                try {
                  await Updates.fetchUpdateAsync();
                  await Updates.reloadAsync();
                } catch (error) {
                  console.error('Error updating app:', error);
                  Alert.alert('Update Failed', 'Failed to update the app. Please try again later.');
                }
              }
            },
            {
              text: 'Later',
              style: 'cancel'
            }
          ]
        );
      } else {
        console.log('No updates available');
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  }

  static async forceReload(): Promise<void> {
    if (__DEV__) {
      console.log('Cannot reload in development mode');
      return;
    }

    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading app:', error);
    }
  }

  static getUpdateInfo() {
    if (__DEV__) {
      return {
        isEmbeddedLaunch: true,
        updateId: 'development',
        channel: 'development',
        runtimeVersion: 'development'
      };
    }

    return {
      isEmbeddedLaunch: Updates.isEmbeddedLaunch,
      updateId: Updates.updateId,
      channel: Updates.channel,
      runtimeVersion: Updates.runtimeVersion
    };
  }
}
