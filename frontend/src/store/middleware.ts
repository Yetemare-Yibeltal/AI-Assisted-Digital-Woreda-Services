import { Middleware } from "@reduxjs/toolkit";
import { storage } from "@/utils/storage";

export const authMiddleware: Middleware = () => (next) => (action: any) => {
  if (action.type === "auth/loginSuccess") {
    storage.setAccessToken(action.payload.accessToken);
    storage.setRefreshToken(action.payload.refreshToken);
    storage.setUser(action.payload.admin);
  }
  if (action.type === "auth/logout") {
    storage.clearAuth();
  }
  return next(action);
};

export const loggerMiddleware: Middleware = () => (next) => (action: any) => {
  if (import.meta.env.DEV) {
    console.log(`[Redux] ${action.type}`, action.payload || "");
  }
  return next(action);
};
