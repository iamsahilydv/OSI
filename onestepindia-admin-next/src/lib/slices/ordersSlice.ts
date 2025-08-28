import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  paymentMode: string;
  pymentStatus: boolean;
  delivered: boolean;
  created_at: string;
  user: {
    name: string;
    email: string;
  };
  orders: Array<{
    id: number;
    qty: number;
    price: number;
    product: {
      name: string;
    };
  }>;
}

interface OrdersState {
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  selectedOrder: Order | null;
  filters: {
    searchQuery: string;
    selectedStatus: string;
  };
}

const initialState: OrdersState = {
  orders: [],
  isLoading: false,
  error: null,
  selectedOrder: null,
  filters: {
    searchQuery: "",
    selectedStatus: "All",
  },
};

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    fetchOrdersStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchOrdersSuccess: (state, action: PayloadAction<Order[]>) => {
      state.isLoading = false;
      state.orders = action.payload;
      state.error = null;
    },
    fetchOrdersFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    updateOrderStatus: (
      state,
      action: PayloadAction<{ orderId: number; status: string }>
    ) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        if (action.payload.status === "delivered") {
          order.delivered = true;
        } else if (action.payload.status === "paid") {
          order.pymentStatus = true;
        }
      }
    },
    setSelectedOrder: (state, action: PayloadAction<Order | null>) => {
      state.selectedOrder = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    setSelectedStatus: (state, action: PayloadAction<string>) => {
      state.filters.selectedStatus = action.payload;
    },
    clearFilters: (state) => {
      state.filters.searchQuery = "";
      state.filters.selectedStatus = "All";
    },
  },
});

export const {
  fetchOrdersStart,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  updateOrderStatus,
  setSelectedOrder,
  setSearchQuery,
  setSelectedStatus,
  clearFilters,
} = ordersSlice.actions;

export default ordersSlice.reducer;
