import { useState, useCallback } from "react";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import type { ApiResponse } from "@/types/api.types";

interface RecommendationResult {
  serviceName: string;
  serviceNameAmharic: string;
  serviceSlug: string;
  category: string;
  confidenceScore: number;
  reasoning: string;
  totalFee: number;
  processingTime: string;
}

export function useAIRecommendation() {
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();

  const getRecommendations = useCallback(
    async (query: string, maxResults: number = 5) => {
      if (!query.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<
          ApiResponse<{ recommendations: RecommendationResult[] }>
        >("/ai/recommendations", { query: query.trim(), language, maxResults });

        if (response.data?.success && response.data?.data) {
          setResults(response.data.data.recommendations || []);
          return response.data.data.recommendations;
        }
      } catch (err: any) {
        const msg = getErrorMessage(err, "Failed to get recommendations");
        setError(msg);
      } finally {
        setLoading(false);
      }
      return [];
    },
    [language],
  );

  const getPopularRecommendations = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get("/ai/recommendations/popular");
      if (response.data?.success && response.data?.data) {
        setResults(response.data.data.recommendations || []);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "Failed to load popular"));
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    getRecommendations,
    getPopularRecommendations,
    clearResults,
  };
}

export default useAIRecommendation;
