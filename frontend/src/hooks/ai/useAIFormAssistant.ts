import { useState, useCallback } from "react";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import type { ApiResponse } from "@/types/api.types";

interface FormAssistResult {
  suggestions: string[];
}

export function useAIFormAssistant() {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();

  const getSuggestions = useCallback(
    async (
      fieldName: string,
      fieldLabel: string,
      currentValue: string,
      serviceName: string,
    ) => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.post<ApiResponse<FormAssistResult>>(
          "/ai/form/assist",
          {
            fieldName,
            fieldLabel,
            currentValue,
            serviceName,
            language,
          },
        );
        if (response.data?.success && response.data?.data) {
          setSuggestions(response.data.data.suggestions || []);
          return response.data.data.suggestions;
        }
      } catch (err: any) {
        setError(getErrorMessage(err, "Failed to get suggestions"));
      } finally {
        setLoading(false);
      }
      return [];
    },
    [language],
  );

  const clearSuggestions = useCallback(() => setSuggestions([]), []);

  return { suggestions, loading, error, getSuggestions, clearSuggestions };
}

export default useAIFormAssistant;
