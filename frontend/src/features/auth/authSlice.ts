import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { IAdmin, AuthResponse } from "./authTypes";

interface AuthState {
  user: IAdmin | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem("dangila_accessToken"),
  refreshToken: localStorage.getItem("dangila_refreshToken"),
  isAuthenticated: !!localStorage.getItem("dangila_accessToken"),
  isLoading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthResponse>) => {
      const { accessToken, refreshToken, admin } = action.payload;
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.user = admin;
      state.isAuthenticated = true;
      state.isLoading = false;
      localStorage.setItem("dangila_accessToken", accessToken);
      if (refreshToken)
        localStorage.setItem("dangila_refreshToken", refreshToken);
    },
    setUser: (state, action: PayloadAction<IAdmin>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      localStorage.removeItem("dangila_accessToken");
      localStorage.removeItem("dangila_refreshToken");
      localStorage.removeItem("dangila_user");
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, setUser, logout, setLoading } =
  authSlice.actions;
export default authSlice.reducer;
