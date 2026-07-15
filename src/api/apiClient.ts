import axios from 'axios';

// Priority order for base URL:
// 1. Deployed production URL (set BACKEND_URL in your react-native-config .env)
// 2. Android emulator loopback (reaches host machine's localhost)
// 3. iOS simulator loopback
//
// For physical device testing, set BACKEND_URL=http://<your-machine-ip>:5000/api
// in a .env file using react-native-config, or replace the fallback below.
const getBaseURL = (): string => {
  // Always use production backend — works on physical devices, emulators, and production builds
  return 'https://toybox-ecommerce-application.onrender.com/api';
};

const baseURL = getBaseURL();

const apiClient = axios.create({
  baseURL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Dynamic imports are used inside interceptors to avoid circular dependencies
// with authSlice/store.

// Request Interceptor for Auth Token
apiClient.interceptors.request.use(
  async (config) => {
    // Dynamic import to avoid circular dependency
    const { store } = await import('../redux/store');
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
    // Dynamic import to avoid circular dependency
    const { store } = await import('../redux/store');
    const state = store.getState();
    const refreshToken = state.auth.refreshToken;

    if (error.response?.status === 401 && !originalRequest._retry && refreshToken) {
      originalRequest._retry = true;
      try {
        const { refreshTokenAction, logoutUser } = await import('../redux/slices/authSlice');
        const resultAction = await store.dispatch(refreshTokenAction(refreshToken) as any);
        if (refreshTokenAction.fulfilled.match(resultAction)) {
          originalRequest.headers.Authorization = `Bearer ${resultAction.payload.token}`;
          return apiClient(originalRequest);
        } else {
          // Token refresh fulfilled but returned an error payload
          store.dispatch(logoutUser() as any);
        }
      } catch (err) {
        const { logoutUser } = await import('../redux/slices/authSlice');
        store.dispatch(logoutUser() as any);
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
