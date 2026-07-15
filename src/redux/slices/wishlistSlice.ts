import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { getProfile } from './authSlice';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
}

interface WishlistState {
  items: Product[];
  loading: boolean;
}

const initialState: WishlistState = {
  items: [],
  loading: false,
};

export const syncWishlist = createAsyncThunk(
  'wishlist/sync',
  async (wishlistItems: Product[], { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/users/wishlist', {
        wishlist: wishlistItems.map(item => item.id)
      });
      return response.data; // This will be the populated wishlist products
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync wishlist');
    }
  }
);

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    toggleWishlist: (state, action: PayloadAction<Product>) => {
      const index = state.items.findIndex(item => item.id === action.payload.id);
      if (index >= 0) {
        state.items.splice(index, 1);
      } else {
        state.items.push(action.payload);
      }
    },
    setWishlist: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
    },
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncWishlist.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map((p: any) => ({ ...p, id: p._id || p.id }));
      })
      .addCase(syncWishlist.rejected, (state) => {
        state.loading = false;
        // Optimization: The next time getProfile is called, it will fix the state.
        // For a true rollback, we would need to pass the 'pre-toggle' state
        // through the thunk's meta.
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        if (action.payload.wishlist) {
          state.items = action.payload.wishlist.map((p: any) => ({ ...p, id: p._id || p.id }));
        }
      });
  }
});

export const { toggleWishlist, removeFromWishlist, setWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
