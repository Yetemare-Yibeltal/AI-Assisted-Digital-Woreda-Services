import axios, {
  AxiosInstance,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL } from "@/utils/constants";

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem("dangila_accessToken");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const language = localStorage.getItem("dangila_language") || "en";
    if (config.headers) {
      config.headers["Accept-Language"] = language;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem("dangila_refreshToken");
        if (refreshToken) {
          const { data } = await axios.post(
            `${API_BASE_URL}/auth/refresh-token`,
            { refreshToken },
          );
          if (data?.data?.accessToken) {
            localStorage.setItem("dangila_accessToken", data.data.accessToken);
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
            }
            return api(originalRequest);
          }
        }
      } catch {
        localStorage.removeItem("dangila_accessToken");
        localStorage.removeItem("dangila_refreshToken");
        localStorage.removeItem("dangila_user");
        if (window.location.pathname.startsWith("/admin")) {
          window.location.href = "/admin/login";
        }
      }
    }
    return Promise.reject({
      status: error.response?.status || 500,
      message:
        (error.response?.data as any)?.message ||
        error.message ||
        "Network error",
      originalError: error,
    });
  },
);

export default api;
