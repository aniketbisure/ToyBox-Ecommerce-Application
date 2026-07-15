import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { getProfile } from './authSlice';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CartState {
  items: CartItem[];
  savedItems: CartItem[];
  totalAmount: number;
  loading: boolean;
}

const initialState: CartState = {
  items: [],
  savedItems: [],
  totalAmount: 0,
  loading: false,
};

export const syncCart = createAsyncThunk(
  'cart/sync',
  async (cartItems: CartItem[], { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/users/cart', {
        cart: cartItems.map(item => ({ product: item.id, quantity: item.quantity }))
      });
      return response.data; // This will be the populated cart items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync cart');
    }
  }
);

export const syncSavedItems = createAsyncThunk(
  'cart/syncSaved',
  async (savedItems: CartItem[], { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/users/saved', {
        savedItems: savedItems.map(item => ({ product: item.id, quantity: item.quantity }))
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync saved items');
    }
  }
);

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(item => item.id === action.payload.id);
      const quantityToAdd = action.payload.quantity || 1;

      if (existingItem) {
        existingItem.quantity += quantityToAdd;
      } else {
        state.items.push({ ...action.payload, quantity: quantityToAdd });
      }
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const item = state.items.find(i => i.id === action.payload.id);
      if (item) {
        item.quantity = action.payload.quantity;
      }
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
    clearCart: (state) => {
      state.items = [];
      state.totalAmount = 0;
    },
    saveForLater: (state, action: PayloadAction<string>) => {
      const itemToSave = state.items.find(item => item.id === action.payload);
      if (itemToSave) {
        state.items = state.items.filter(item => item.id !== action.payload);
        const existingSaved = state.savedItems.find(item => item.id === action.payload);
        if (!existingSaved) {
          state.savedItems.push(itemToSave);
        }
        state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    },
    moveToCart: (state, action: PayloadAction<string>) => {
      const itemToMove = state.savedItems.find(item => item.id === action.payload);
      if (itemToMove) {
        state.savedItems = state.savedItems.filter(item => item.id !== action.payload);
        const existingCart = state.items.find(item => item.id === action.payload);
        if (existingCart) {
          existingCart.quantity += 1;
        } else {
          state.items.push({ ...itemToMove, quantity: 1 });
        }
        state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      }
    },
    removeFromSaved: (state, action: PayloadAction<string>) => {
      state.savedItems = state.savedItems.filter(item => item.id !== action.payload);
    },
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
      state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(syncCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.map((item: any) => ({
          ...item.product,
          id: item.product._id || item.product.id,
          quantity: item.quantity
        }));
        state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
      })
      .addCase(syncCart.rejected, (state) => {
        state.loading = false;
      })
      .addCase(syncSavedItems.fulfilled, (state, action) => {
        state.savedItems = action.payload.map((item: any) => ({
          ...item.product,
          id: item.product._id || item.product.id,
          quantity: item.quantity
        }));
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        if (action.payload.cart) {
          state.items = action.payload.cart.map((item: any) => ({
            ...item.product,
            id: item.product._id || item.product.id,
            quantity: item.quantity
          }));
          state.totalAmount = state.items.reduce((total, item) => total + item.price * item.quantity, 0);
        }
        if (action.payload.savedItems) {
          state.savedItems = action.payload.savedItems.map((item: any) => ({
            ...item.product,
            id: item.product._id || item.product.id,
            quantity: item.quantity
          }));
        }
      });
  }
});

export const {
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  saveForLater,
  moveToCart,
  removeFromSaved,
  setCart
} = cartSlice.actions;
export default cartSlice.reducer;
