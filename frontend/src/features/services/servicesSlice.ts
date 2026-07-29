import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { IService } from "./servicesTypes";

interface ServicesState {
  items: IService[];
  selectedService: IService | null;
  loading: boolean;
  error: string | null;
  categories: string[];
  popularServices: IService[];
}

const initialState: ServicesState = {
  items: [],
  selectedService: null,
  loading: false,
  error: null,
  categories: [],
  popularServices: [],
};

const servicesSlice = createSlice({
  name: "services",
  initialState,
  reducers: {
    setServices: (state, action: PayloadAction<IService[]>) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedService: (state, action: PayloadAction<IService | null>) => {
      state.selectedService = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    setPopularServices: (state, action: PayloadAction<IService[]>) => {
      state.popularServices = action.payload;
    },
    addService: (state, action: PayloadAction<IService>) => {
      state.items.unshift(action.payload);
    },
    updateService: (state, action: PayloadAction<IService>) => {
      const index = state.items.findIndex((s) => s._id === action.payload._id);
      if (index !== -1) state.items[index] = action.payload;
      if (state.selectedService?._id === action.payload._id) {
        state.selectedService = action.payload;
      }
    },
    removeService: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((s) => s._id !== action.payload);
      if (state.selectedService?._id === action.payload) {
        state.selectedService = null;
      }
    },
  },
});

export const {
  setServices,
  setSelectedService,
  setLoading,
  setError,
  setCategories,
  setPopularServices,
  addService,
  updateService,
  removeService,
} = servicesSlice.actions;

export default servicesSlice.reducer;
