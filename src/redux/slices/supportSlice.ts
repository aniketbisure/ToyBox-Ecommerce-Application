import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';

interface SupportTicket {
  _id: string;
  user: string;
  subject: string;
  message: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  response?: string;
  createdAt: string;
  updatedAt: string;
}

interface SupportState {
  tickets: SupportTicket[];
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: SupportState = {
  tickets: [],
  loading: false,
  error: null,
  success: false,
};

export const createSupportTicket = createAsyncThunk(
  'support/createTicket',
  async (ticketData: { subject: string; message: string; priority?: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/support', ticketData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create support ticket');
    }
  }
);

export const getMyTickets = createAsyncThunk(
  'support/getMyTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/support/my-tickets');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
    }
  }
);

const supportSlice = createSlice({
  name: 'support',
  initialState,
  reducers: {
    resetSupportState: (state) => {
      state.loading = false;
      state.error = null;
      state.success = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createSupportTicket.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createSupportTicket.fulfilled, (state, action: PayloadAction<SupportTicket>) => {
        state.loading = false;
        state.tickets.unshift(action.payload);
        state.success = true;
      })
      .addCase(createSupportTicket.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getMyTickets.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMyTickets.fulfilled, (state, action: PayloadAction<SupportTicket[]>) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(getMyTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetSupportState } = supportSlice.actions;
export default supportSlice.reducer;
