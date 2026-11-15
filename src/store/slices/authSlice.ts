import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from "@/types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: {
    id: "admin-default-id",
    name: "Alexander Vance",
    email: "admin@datascope.io",
    role: "ADMIN",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  },
  token: "demo-jwt-session-token",
  isAuthenticated: true,
  isLoading: false,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; token: string }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    switchRole: (state, action: PayloadAction<"ADMIN" | "DATA_ANALYST" | "VIEWER">) => {
      if (state.user) {
        state.user.role = action.payload;
        if (action.payload === "ADMIN") {
          state.user.name = "Alexander Vance (Admin)";
          state.user.email = "admin@datascope.io";
        } else if (action.payload === "DATA_ANALYST") {
          state.user.name = "Dr. Elena Rostova (Analyst)";
          state.user.email = "analyst@datascope.io";
        } else {
          state.user.name = "Marcus Thorne (Viewer)";
          state.user.email = "viewer@datascope.io";
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isLoading = false;
    },
  },
});

export const { setCredentials, switchRole, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;
