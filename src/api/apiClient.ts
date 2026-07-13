import axios from 'axios';
import { Platform } from 'react-native';

// Priority order for base URL:
// 1. Deployed production URL (set BACKEND_URL in your react-native-config .env)
// 2. Android emulator loopback (reaches host machine's localhost)
// 3. iOS simulator loopback
//
// For physical device testing, set BACKEND_URL=http://<your-machine-ip>:5000/api
// in a .env file using react-native-config, or replace the fallback below.
const getBaseURL = (): string => {
  // If you use react-native-config, uncomment:
  // import Config from 'react-native-config';
  // if (Config.BACKEND_URL) return Config.BACKEND_URL;

  if (__DEV__) {
    return Platform.OS === 'android'
      ? 'http://10.0.2.2:5000/api'   // Android emulator → host machine
      : 'http://localhost:5000/api';  // iOS simulator → host machine
  }

  // Production — replace with your actual deployed backend URL
  return 'https://toybox-backend.onrender.com/api';
};

const baseURL = getBaseURL();
console.log('🌐 API Base URL:', baseURL);

const apiClient = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

import { store } from '../redux/store';
import { logout, refreshTokenAction } from '../redux/slices/authSlice';

// Request Interceptor for Auth Token
apiClient.interceptors.request.use(
  async (config) => {
    const state = store.getState();
    const token = state.auth.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Token Refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const state = store.getState();
    const refreshToken = state.auth.refreshToken;

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      try {
        const resultAction = await store.dispatch(refreshTokenAction(refreshToken));
        if (refreshTokenAction.fulfilled.match(resultAction)) {
          originalRequest.headers.Authorization = `Bearer ${resultAction.payload.token}`;
          return apiClient(originalRequest);
        } else {
          // Token refresh fulfilled but returned an error payload
          store.dispatch(logout());
        }
      } catch (err) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
