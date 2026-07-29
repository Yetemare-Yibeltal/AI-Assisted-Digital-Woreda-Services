import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { IApplication } from "./applicationsTypes";

interface ApplicationsState {
  items: IApplication[];
  selectedApplication: IApplication | null;
  loading: boolean;
  error: string | null;
  stats: {
    total: number;
    today: number;
    thisWeek: number;
    byStatus: Record<string, number>;
  } | null;
}

const initialState: ApplicationsState = {
  items: [],
  selectedApplication: null,
  loading: false,
  error: null,
  stats: null,
};

const applicationsSlice = createSlice({
  name: "applications",
  initialState,
  reducers: {
    setApplications: (state, action: PayloadAction<IApplication[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedApplication: (
      state,
      action: PayloadAction<IApplication | null>,
    ) => {
      state.selectedApplication = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setStats: (state, action: PayloadAction<ApplicationsState["stats"]>) => {
      state.stats = action.payload;
    },
    addApplication: (state, action: PayloadAction<IApplication>) => {
      state.items.unshift(action.payload);
    },
    updateApplication: (state, action: PayloadAction<IApplication>) => {
      const index = state.items.findIndex((a) => a._id === action.payload._id);
      if (index !== -1) state.items[index] = action.payload;
      if (state.selectedApplication?._id === action.payload._id) {
        state.selectedApplication = action.payload;
      }
    },
    removeApplication: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((a) => a._id !== action.payload);
      if (state.selectedApplication?._id === action.payload) {
        state.selectedApplication = null;
      }
    },
  },
});

export const {
  setApplications,
  setSelectedApplication,
  setLoading,
  setError,
  setStats,
  addApplication,
  updateApplication,
  removeApplication,
} = applicationsSlice.actions;

export default applicationsSlice.reducer;
