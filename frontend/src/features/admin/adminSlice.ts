import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { IAdmin } from "./adminTypes";

interface AdminState {
  admins: IAdmin[];
  selectedAdmin: IAdmin | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdminState = {
  admins: [],
  selectedAdmin: null,
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    setAdmins: (state, action: PayloadAction<IAdmin[]>) => {
      state.admins = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedAdmin: (state, action: PayloadAction<IAdmin | null>) => {
      state.selectedAdmin = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    addAdmin: (state, action: PayloadAction<IAdmin>) => {
      state.admins.unshift(action.payload);
    },
    updateAdmin: (state, action: PayloadAction<IAdmin>) => {
      const index = state.admins.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) state.admins[index] = action.payload;
      if (state.selectedAdmin?._id === action.payload._id) {
        state.selectedAdmin = action.payload;
      }
    },
    removeAdmin: (state, action: PayloadAction<string>) => {
      state.admins = state.admins.filter((a) => a._id !== action.payload);
      if (state.selectedAdmin?._id === action.payload) {
        state.selectedAdmin = null;
      }
    },
  },
});

export const {
  setAdmins,
  setSelectedAdmin,
  setLoading,
  setError,
  addAdmin,
  updateAdmin,
  removeAdmin,
} = adminSlice.actions;

export default adminSlice.reducer;
