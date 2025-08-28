import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DashboardStats {
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  todayRevenue: number;
  monthlyRevenue: number;
}

interface CustomerSegment {
  segment: number;
  count: number;
  percentage: number;
}

interface SalesForecast {
  date: string;
  forecast: number;
}

interface FraudAlert {
  user_id: number;
  reason: string;
  order_id?: number;
}

interface AnalyticsState {
  dashboardStats: DashboardStats | null;
  customerSegments: CustomerSegment[];
  salesForecast: SalesForecast[];
  fraudAlerts: FraudAlert[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnalyticsState = {
  dashboardStats: null,
  customerSegments: [],
  salesForecast: [],
  fraudAlerts: [],
  isLoading: false,
  error: null,
};

const analyticsSlice = createSlice({
  name: "analytics",
  initialState,
  reducers: {
    fetchAnalyticsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDashboardStatsSuccess: (
      state,
      action: PayloadAction<DashboardStats>
    ) => {
      state.dashboardStats = action.payload;
    },
    fetchCustomerSegmentsSuccess: (
      state,
      action: PayloadAction<CustomerSegment[]>
    ) => {
      state.customerSegments = action.payload;
    },
    fetchSalesForecastSuccess: (
      state,
      action: PayloadAction<SalesForecast[]>
    ) => {
      state.salesForecast = action.payload;
    },
    fetchFraudAlertsSuccess: (state, action: PayloadAction<FraudAlert[]>) => {
      state.fraudAlerts = action.payload;
    },
    fetchAnalyticsSuccess: (state) => {
      state.isLoading = false;
      state.error = null;
    },
    fetchAnalyticsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    clearAnalyticsError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchAnalyticsStart,
  fetchDashboardStatsSuccess,
  fetchCustomerSegmentsSuccess,
  fetchSalesForecastSuccess,
  fetchFraudAlertsSuccess,
  fetchAnalyticsSuccess,
  fetchAnalyticsFailure,
  clearAnalyticsError,
} = analyticsSlice.actions;

export default analyticsSlice.reducer;
