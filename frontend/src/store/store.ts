import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/features/auth/authSlice";
import servicesReducer from "@/features/services/servicesSlice";
import applicationsReducer from "@/features/applications/applicationsSlice";
import adminReducer from "@/features/admin/adminSlice";
import aiReducer from "@/features/ai/aiSlice";
import { servicesApi } from "@/features/services/servicesApi";
import { applicationsApi } from "@/features/applications/applicationsApi";
import { authApi } from "@/features/auth/authApi";
import { adminApi } from "@/features/admin/adminApi";
import { aiApi } from "@/features/ai/aiApi";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    services: servicesReducer,
    applications: applicationsReducer,
    admin: adminReducer,
    ai: aiReducer,
    [servicesApi.reducerPath]: servicesApi.reducer,
    [applicationsApi.reducerPath]: applicationsApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
    [aiApi.reducerPath]: aiApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      servicesApi.middleware,
      applicationsApi.middleware,
      authApi.middleware,
      adminApi.middleware,
      aiApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
