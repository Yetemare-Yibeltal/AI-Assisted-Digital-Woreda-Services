import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { storage } from "@/utils/storage";
import { useToast } from "@/components/ui/use-toast";
import api from "@/utils/api";
import type { IAdmin, AuthResponse, LoginCredentials } from "@/types/admin.types";
import type { ApiResponse } from "@/types/api.types";

interface AuthContextType {
  user: IAdmin | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  hasPermission: () => false,
  hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<IAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const isAuthenticated = !!user && !!storage.getAccessToken();

  const fetchUser = useCallback(async (): Promise<IAdmin | null> => {
    try {
      const token = storage.getAccessToken();
      if (!token) return null;

      const response = await api.get<ApiResponse<IAdmin>>("/auth/me");
      if (response.data.success && response.data.data) {
        const userData = response.data.data;
        storage.setUser(userData);
        setUser(userData);
        return userData;
      }
      return null;
    } catch (error: any) {
      if (error?.status === 401) {
        const refreshToken = storage.getRefreshToken();
        if (refreshToken) {
          try {
            const refreshResponse = await api.post<ApiResponse<AuthResponse>>("/auth/refresh-token", {
              refreshToken,
            });
            if (refreshResponse.data.success) {
              const { accessToken, refreshToken: newRefreshToken } = refreshResponse.data.data;
              storage.setAccessToken(accessToken);
              if (newRefreshToken) storage.setRefreshToken(newRefreshToken);

              const userResponse = await api.get<ApiResponse<IAdmin>>("/auth/me");
              if (userResponse.data.success && userResponse.data.data) {
                storage.setUser(userResponse.data.data);
                setUser(userResponse.data.data);
                return userResponse.data.data;
              }
            }
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
          }
        }
        storage.clearAuth();
        setUser(null);
      }
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        await fetchUser();
      } catch {
        storage.clearAuth();
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    initAuth();
  }, [fetchUser]);

  useEffect(() => {
    const refreshInterval = setInterval(
      async () => {
        const token = storage.getAccessToken();
        if (!token) return;
        try {
          const payload = JSON.parse(atob(token.split(".")[1]));
          const expiryTime = payload.exp * 1000;
          const currentTime = Date.now();
          const timeUntilExpiry = expiryTime - currentTime;

          if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
            const refreshToken = storage.getRefreshToken();
            if (refreshToken) {
              const response = await api.post("/auth/refresh-token", { refreshToken });
              if (response.data.success) {
                storage.setAccessToken(response.data.data.accessToken);
                if (response.data.data.refreshToken) {
                  storage.setRefreshToken(response.data.data.refreshToken);
                }
              }
            }
          }
        } catch {
          // Token parse error, will be handled on next request
        }
      },
      60 * 1000
    );

    return () => clearInterval(refreshInterval);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", credentials);

      if (response.data.success) {
        const { accessToken, refreshToken, admin } = response.data.data;
        storage.setAccessToken(accessToken);
        storage.setRefreshToken(refreshToken);
        storage.setUser(admin);
        setUser(admin);

        toast({
          variant: "success",
          title: "Welcome back!",
          description: `Logged in as ${admin.fullName}`,
        });

        const from = (location.state as any)?.from?.pathname || "/admin/dashboard";
        navigate(from, { replace: true });
      }
    },
    [navigate, location, toast]
  );

  const logout = useCallback(async () => {
    try {
      const refreshToken = storage.getRefreshToken();
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Continue with local logout even if API call fails
    } finally {
      storage.clearAuth();
      setUser(null);
      toast({
        variant: "default",
        title: "Logged out",
        description: "You have been logged out successfully.",
      });
      navigate("/admin/login", { replace: true });
    }
  }, [navigate, toast]);

  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      if (user.role === "super_admin") return true;
      return (user.permissions as any)?.[permission] === true;
    },
    [user]
  );

  const hasRole = useCallback(
    (roles: string[]): boolean => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    refreshUser,
    hasPermission,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;