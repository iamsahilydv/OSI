import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";
import productsSlice from "./slices/productsSlice";
import ordersSlice from "./slices/ordersSlice";
import membersSlice from "./slices/membersSlice";
import analyticsSlice from "./slices/analyticsSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    products: productsSlice,
    orders: ordersSlice,
    members: membersSlice,
    analytics: analyticsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
