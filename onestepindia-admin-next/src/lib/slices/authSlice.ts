import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: AdminUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Get initial state from localStorage if available
const getInitialState = (): AuthState => {
  if (typeof window !== "undefined") {
    const savedAuth = localStorage.getItem("adminAuth");
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        return {
          user: parsed.user,
          token: parsed.token,
          isAuthenticated: !!parsed.token,
          isLoading: false,
          error: null,
        };
      } catch (error) {
        console.error("Error parsing saved auth:", error);
      }
    }
  }

  return {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: AdminUser; token: string }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.error = null;

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "adminAuth",
          JSON.stringify({
            user: action.payload.user,
            token: action.payload.token,
          })
        );
      }
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;

      // Clear from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("adminAuth");
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
