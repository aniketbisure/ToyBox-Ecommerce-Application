import { Platform } from 'react-native';
// import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Note: This is a boilerplate service.
 * To fully enable, you must install @react-native-firebase/app and @react-native-firebase/messaging
 * and configure native Android/iOS projects with your firebase credentials.
 */

export const requestUserPermission = async () => {
  console.log('Push notification permission requested (Mock)');
  // const authStatus = await messaging().requestPermission();
  // const enabled =
  //   authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
  //   authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  // if (enabled) {
  //   console.log('Authorization status:', authStatus);
  //   getFcmToken();
  // }
};

export const getFcmToken = async () => {
  let fcmToken = await AsyncStorage.getItem('fcmToken');
  if (!fcmToken) {
    try {
      // const fcmToken = await messaging().getToken();
      // if (fcmToken) {
      //   await AsyncStorage.setItem('fcmToken', fcmToken);
      // }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  }
};

export const notificationListener = () => {
  // messaging().onNotificationOpenedApp(remoteMessage => {
  //   console.log('Notification caused app to open from background:', remoteMessage.notification);
  // });

  // messaging().getInitialNotification().then(remoteMessage => {
  //   if (remoteMessage) {
  //     console.log('Notification caused app to open from quit state:', remoteMessage.notification);
  //   }
  // });

  // messaging().onMessage(async remoteMessage => {
  //   console.log('Foreground message received:', remoteMessage);
  // });
};
