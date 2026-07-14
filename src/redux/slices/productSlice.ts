import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../api/apiClient';
import { getProfile } from './authSlice';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  listPrice?: number;
  salePrice?: number;
  category?: string;        // kept for backwards compat
  subCategory?: string;
  image: string;
  images?: string[];
  rating: number;
  numReviews?: number;
  reviews?: any[];
  stock?: number;
  brand?: string;
  manufacturer?: string;
  sku?: string;
  minimumAge?: number;
  ageRangeDescription?: string;
  smallPartsWarning?: boolean;
  safetyWarningText?: string;
  isDeleted?: boolean;
}

interface ProductState {
  products: Product[];
  filteredProducts: Product[];
  recentlyViewed: Product[];
  page: number;
  pages: number;
  total: number;
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = {
  products: [],
  filteredProducts: [],
  recentlyViewed: [],
  page: 1,
  pages: 1,
  total: 0,
  loading: false,
  error: null,
};

export const fetchProducts = createAsyncThunk(
  'products/fetchAll',
  async (params: any = {}, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/products${queryString ? `?${queryString}` : ''}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const addProduct = createAsyncThunk(
  'products/add',
  async (productData: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/products', productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, productData }: { id: string; productData: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/products/${id}`, productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/products/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const syncRecentlyViewed = createAsyncThunk(
  'products/syncHistory',
  async (history: Product[], { rejectWithValue }) => {
    try {
      const response = await apiClient.put('/users/history', {
        recentlyViewed: history.map(item => item.id || (item as any)._id)
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to sync history');
    }
  }
);

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilteredProducts: (state, action: PayloadAction<Product[]>) => {
      state.filteredProducts = action.payload;
    },
    addToRecentlyViewed: (state, action: PayloadAction<Product>) => {
      const newProd = action.payload;
      const newId = newProd.id || (newProd as any)._id;
      if (!newId) return;

      // Ensure the product object we store has the id field
      const productToStore = { ...newProd, id: newId };

      const existingIndex = state.recentlyViewed.findIndex(p => {
        const pId = p.id || (p as any)._id;
        return pId === newId;
      });

      if (existingIndex !== -1) {
        state.recentlyViewed.splice(existingIndex, 1);
      }
      state.recentlyViewed.unshift(productToStore);

      if (state.recentlyViewed.length > 10) {
        state.recentlyViewed.pop();
      }
    },
    // Real-time update actions
    onProductUpdated: (state, action: PayloadAction<Product>) => {
      const updatedProduct = { ...action.payload, id: action.payload.id || (action.payload as any)._id };
      const index = state.products.findIndex(p => p.id === updatedProduct.id);
      if (index !== -1) {
        state.products[index] = updatedProduct;
      }
      const filteredIndex = state.filteredProducts.findIndex(p => p.id === updatedProduct.id);
      if (filteredIndex !== -1) {
        state.filteredProducts[filteredIndex] = updatedProduct;
      }
    },
    onProductAdded: (state, action: PayloadAction<Product>) => {
      const newProduct = { ...action.payload, id: action.payload.id || (action.payload as any)._id };
      // Avoid duplicates
      if (!state.products.find(p => p.id === newProduct.id)) {
        state.products.unshift(newProduct);
        state.filteredProducts.unshift(newProduct);
      }
    },
    onProductDeleted: (state, action: PayloadAction<string>) => {
      const id = action.payload;
      state.products = state.products.filter(p => p.id !== id);
      state.filteredProducts = state.filteredProducts.filter(p => p.id !== id);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        const products = action.payload.products || action.payload; // Fallback for old API if needed
        const mappedProducts = Array.isArray(products)
          ? products.map((p: any) => ({
              ...p,
              id: p.id || p._id
            }))
          : [];

        // Sort products by category/subCategory
        const sortedProducts = [...mappedProducts].sort((a, b) => {
          const catA = (a.category || a.subCategory || '').toLowerCase();
          const catB = (b.category || b.subCategory || '').toLowerCase();
          return catA.localeCompare(catB);
        });

        state.products = sortedProducts;
        state.filteredProducts = sortedProducts;
        state.page = action.payload.page || 1;
        state.pages = action.payload.pages || 1;
        state.total = action.payload.total || mappedProducts.length;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addProduct.fulfilled, (state, action) => {
        const newProduct = { ...action.payload, id: action.payload.id || action.payload._id };
        state.products.push(newProduct);
        state.filteredProducts.push(newProduct);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const updatedProduct = { ...action.payload, id: action.payload.id || action.payload._id };
        const index = state.products.findIndex(p => p.id === updatedProduct.id);
        if (index !== -1) {
          state.products[index] = updatedProduct;
        }
        const filteredIndex = state.filteredProducts.findIndex(p => p.id === updatedProduct.id);
        if (filteredIndex !== -1) {
          state.filteredProducts[filteredIndex] = updatedProduct;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter(p => p.id !== action.payload);
        state.filteredProducts = state.filteredProducts.filter(p => p.id !== action.payload);
      })
      .addCase(syncRecentlyViewed.fulfilled, (state, action) => {
        state.recentlyViewed = action.payload.map((p: any) => ({
          ...p,
          id: p.id || p._id
        }));
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        if (action.payload.recentlyViewed) {
          state.recentlyViewed = action.payload.recentlyViewed.map((p: any) => ({
            ...p,
            id: p.id || p._id
          }));
        }
      });
  },
});

export const {
  setFilteredProducts,
  addToRecentlyViewed,
  onProductUpdated,
  onProductAdded,
  onProductDeleted
} = productSlice.actions;
export default productSlice.reducer;
