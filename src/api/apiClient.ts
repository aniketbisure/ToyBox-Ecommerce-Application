import axios from 'axios';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android Emulator to reach computer's localhost
const baseURL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api'
  : 'http://localhost:5000/api';

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
        }
      } catch (err) {
        store.dispatch(logout());
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
