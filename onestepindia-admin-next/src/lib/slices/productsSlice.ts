import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  brand: string;
  qty: number;
  is_pod: boolean;
  created_at: string;
  variations: any[];
  images: string[];
}

interface ProductsState {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
  filters: {
    searchQuery: string;
    selectedCategory: string;
  };
}

const initialState: ProductsState = {
  products: [],
  isLoading: false,
  error: null,
  selectedProduct: null,
  filters: {
    searchQuery: "",
    selectedCategory: "All",
  },
};

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    fetchProductsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProductsSuccess: (state, action: PayloadAction<Product[]>) => {
      state.isLoading = false;
      state.products = action.payload;
      state.error = null;
    },
    fetchProductsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addProductSuccess: (state, action: PayloadAction<Product>) => {
      state.products.unshift(action.payload);
    },
    updateProductSuccess: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProductSuccess: (state, action: PayloadAction<number>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    setSelectedProduct: (state, action: PayloadAction<Product | null>) => {
      state.selectedProduct = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.filters.selectedCategory = action.payload;
    },
    clearFilters: (state) => {
      state.filters.searchQuery = "";
      state.filters.selectedCategory = "All";
    },
  },
});

export const {
  fetchProductsStart,
  fetchProductsSuccess,
  fetchProductsFailure,
  addProductSuccess,
  updateProductSuccess,
  deleteProductSuccess,
  setSelectedProduct,
  setSearchQuery,
  setSelectedCategory,
  clearFilters,
} = productsSlice.actions;

export default productsSlice.reducer;
