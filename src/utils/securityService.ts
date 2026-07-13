// In a real Enterprise app: import * as Keychain from 'react-native-keychain';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Enterprise Ready: Secure Storage Service
 * On production, this should use Keychain (iOS) and Keystore (Android)
 * currently falling back to AsyncStorage but structured for easy replacement.
 */
export const saveTokens = async (accessToken: string, refreshToken: string) => {
  try {
    await Promise.all([
      AsyncStorage.setItem('userToken', accessToken),
      AsyncStorage.setItem('refreshToken', refreshToken)
    ]);
  } catch (error) {
    console.error('Security Service Error:', error);
  }
};

export const getRefreshToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem('refreshToken');
  } catch (error) {
    return null;
  }
};

export const clearTokens = async () => {
  await Promise.all([
    AsyncStorage.removeItem('userToken'),
    AsyncStorage.removeItem('refreshToken')
  ]);
};
