import { useState, useCallback } from "react";
import api from "@/utils/api";
import type {
  IApplication,
  ApplicationStatus,
} from "@/types/application.types";
import type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
} from "@/types/api.types";

export function useApplications() {
  const [applications, setApplications] = useState<IApplication[]>([]);
  const [selectedApp, setSelectedApp] = useState<IApplication | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);

  const fetchApplications = useCallback(
    async (params?: Record<string, string | number>) => {
      setLoading(true);
      setError(null);
      try {
        const query = new URLSearchParams(params as any).toString();
        const response = await api.get<PaginatedResponse<IApplication>>(
          `/applications?${query}`,
        );
        if (response.data.success) {
          setApplications(response.data.data);
          if (response.data.meta) setMeta(response.data.meta);
        }
      } catch (err: any) {
        setError(err?.message || "Failed to fetch applications");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const fetchApplicationById = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const response = await api.get<ApiResponse<IApplication>>(
        `/applications/${id}`,
      );
      if (response.data.success && response.data.data) {
        setSelectedApp(response.data.data);
        return response.data.data;
      }
    } catch (err: any) {
      setError(err?.message || "Failed to fetch application");
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const updateStatus = useCallback(
    async (
      id: string,
      status: ApplicationStatus,
      notes: string,
      rejectionReason?: string,
    ) => {
      const response = await api.patch(`/applications/${id}/status`, {
        status,
        notes,
        rejectionReason,
      });
      if (response.data.success) {
        setSelectedApp(response.data.data);
        setApplications((prev) =>
          prev.map((a) => (a._id === id ? response.data.data : a)),
        );
      }
      return response.data;
    },
    [],
  );

  return {
    applications,
    selectedApp,
    loading,
    error,
    meta,
    fetchApplications,
    fetchApplicationById,
    updateStatus,
  };
}
