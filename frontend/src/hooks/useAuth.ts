import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import type { RootState, AppDispatch } from "@/store/store";
import {
  setCredentials,
  logout as logoutAction,
  setLoading,
} from "@/features/auth/authSlice";
import { storage } from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";
import api from "@/utils/api";
import type {
  LoginCredentials,
  AuthResponse,
  IAdmin,
} from "@/types/admin.types";
import type { ApiResponse } from "@/types/api.types";

export function useAuth() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      dispatch(setLoading(true));
      try {
        const response = await api.post<ApiResponse<AuthResponse>>(
          "/auth/login",
          credentials,
        );
        if (response.data.success && response.data.data) {
          const { accessToken, refreshToken, admin } = response.data.data;
          storage.setAccessToken(accessToken);
          storage.setRefreshToken(refreshToken || "");
          storage.setUser(admin);
          dispatch(
            setCredentials({
              accessToken,
              refreshToken: refreshToken || "",
              admin,
              expiresIn: 0,
            }),
          );
          toast({
            variant: "success",
            title: "Welcome back!",
            description: `Logged in as ${admin.fullName}`,
          });
          const from =
            (location.state as any)?.from?.pathname || "/admin/dashboard";
          navigate(from, { replace: true });
        }
      } catch (error: any) {
        dispatch(setLoading(false));
        throw error;
      }
    },
    [dispatch, navigate, location, toast],
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = storage.getRefreshToken();
      if (refreshToken) await api.post("/auth/logout", { refreshToken });
    } catch {}
    storage.clearAuth();
    dispatch(logoutAction());
    toast({
      title: "Logged out",
      description: "You have been logged out successfully.",
    });
    navigate("/admin/login", { replace: true });
  }, [dispatch, navigate, toast]);

  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<IAdmin>>("/auth/me");
      if (response.data.success && response.data.data) {
        dispatch(
          setCredentials({
            accessToken: storage.getAccessToken() || "",
            refreshToken: storage.getRefreshToken() || "",
            admin: response.data.data,
            expiresIn: 0,
          }),
        );
      }
    } catch {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === "super_admin") return true;
      return (user.permissions as any)?.[permission] === true;
    },
    [user],
  );

  const hasRole = useCallback(
    (roles: string[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user],
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
  };
}
