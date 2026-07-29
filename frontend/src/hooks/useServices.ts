import { useState, useCallback } from "react";
import api from "@/utils/api";
import type { IService } from "@/types/service.types";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from "@/types/api.types";

export function useServices() {
  const [services, setServices] = useState<IService[]>([]);
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchServices = useCallback(
    async (params?: Record<string, string | number>) => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams(params as any).toString();
        const response = await api.get<PaginatedResponse<IService>>(
          `/public/services?${query}`,
        );
        if (response.data.success) {
          setServices(response.data.data);
          if (response.data.meta) setMeta(response.data.meta);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to fetch services");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchServiceBySlug = useCallback(async (slug: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<IService>>(
        `/public/services/slug/${slug}`,
      );
      if (response.data.success && response.data.data) {
        setSelectedService(response.data.data);
        return response.data.data;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch service");
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const searchServices = useCallback(async (query: string, limit = 20) => {
    const response = await api.get<ApiResponse<IService[]>>(
      `/public/services/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    if (response.data.success) setServices(response.data.data || []);
  }, []);

  return {
    services,
    selectedService,
    loading,
    error,
    meta,
    fetchServices,
    fetchServiceBySlug,
    searchServices,
    setSelectedService,
  };
}
