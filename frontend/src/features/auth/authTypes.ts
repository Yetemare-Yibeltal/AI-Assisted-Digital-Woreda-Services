import type { IAdmin } from "../admin/adminTypes";

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthResponse {
  admin: IAdmin;
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthState {
  user: IAdmin | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
