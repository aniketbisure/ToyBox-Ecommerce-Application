import { Platform } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

export const requestUserPermission = async () => {
  console.log('Push notification permission requested (Mock)');
  // Real implementation would uncomment messaging() imports
  getFcmToken();
};

export const getFcmToken = async () => {
  try {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
        // mock token for now if library not linked
        fcmToken = 'mock_fcm_token_' + Math.random().toString(36).substring(7);
        await AsyncStorage.setItem('fcmToken', fcmToken);
    }

    // Send token to backend
    if (fcmToken) {
       await apiClient.put('/users/profile', { fcmToken });
       console.log('FCM Token synced with backend:', fcmToken);
    }
  } catch (error) {
    console.log('Error getting FCM token:', error);
  }
};

export const notificationListener = () => {
  // logic to handle incoming messages
};
