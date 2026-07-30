import { useDispatch, useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState, AppDispatch } from "./store";

// Use throughout the app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Selector shortcuts for common state slices
export const useAuthState = () => useAppSelector((state) => state.auth);
export const useServicesState = () => useAppSelector((state) => state.services);
export const useApplicationsState = () =>
  useAppSelector((state) => state.applications);
export const useAdminState = () => useAppSelector((state) => state.admin);
export const useAIState = () => useAppSelector((state) => state.ai);
