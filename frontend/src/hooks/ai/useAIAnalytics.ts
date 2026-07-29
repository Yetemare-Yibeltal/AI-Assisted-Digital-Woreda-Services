import { useState, useCallback } from "react";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import type { ApiResponse } from "@/types/api.types";

interface AIUsageData {
  totalRequests: number;
  requestsToday: number;
  requestsThisWeek: number;
  byFeature: Record<string, number>;
  averageResponseTime: number;
  successRate: number;
}

export function useAIAnalytics() {
  const [data, setData] = useState<AIUsageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<ApiResponse<AIUsageData>>(
        "/ai/analytics/usage",
      );
      if (response.data?.success && response.data?.data) {
        setData(response.data.data);
        return response.data.data;
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to fetch analytics"));
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  return { data, loading, error, fetchAnalytics };
}

export default useAIAnalytics;
