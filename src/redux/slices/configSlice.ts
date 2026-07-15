import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

interface Banner {
  id: string;
  _id?: string;
  image: string;
  title: string;
  subtitle: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  link?: string;
}

interface ConfigState {
  banners: Banner[];
  categories: string[];
  ageRanges: any[];
  razorpayKeyId?: string;
  settings: {
    notificationsEnabled: boolean;
    darkMode: boolean;
  };
  loading: boolean;
}

const initialState: ConfigState = {
  banners: [],
  categories: [],
  ageRanges: [],
  settings: {
    notificationsEnabled: true,
    darkMode: false,
  },
  loading: false,
};

export const fetchAppConfig = createAsyncThunk(
  'config/fetchConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/config');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch config');
    }
  }
);

const configSlice = createSlice({
  name: 'config',
  initialState,
  reducers: {
    toggleNotifications: (state) => {
      state.settings.notificationsEnabled = !state.settings.notificationsEnabled;
    },
    toggleDarkMode: (state) => {
      state.settings.darkMode = !state.settings.darkMode;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppConfig.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAppConfig.fulfilled, (state, action) => {
        state.loading = false;
        // Map banners and handle potential missing isActive field (default to true)
        const mappedBanners = (action.payload.banners || []).map((b: any) => ({
          ...b,
          id: b.id || b._id,
          isActive: b.isActive !== undefined ? b.isActive : true
        }));

        state.banners = mappedBanners.filter((b: any) => b.isActive);
        state.categories = action.payload.categories || [];
        state.ageRanges = action.payload.ageRanges || [];
        state.razorpayKeyId = action.payload.razorpayKeyId;
      })
      .addCase(fetchAppConfig.rejected, (state) => {
        state.loading = false;
      });
  },
});

export const { toggleNotifications, toggleDarkMode } = configSlice.actions;
export default configSlice.reducer;
