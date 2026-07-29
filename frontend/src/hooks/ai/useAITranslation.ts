import { useState, useCallback } from "react";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import type { ApiResponse } from "@/types/api.types";

interface TranslationResult {
  originalText: string;
  translatedText: string;
  sourceLanguage: "en" | "am";
  targetLanguage: "en" | "am";
  confidence: number;
}

export function useAITranslation() {
  const [translatedText, setTranslatedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const language = storage.getLanguage();

  const translate = useCallback(
    async (text: string, sourceLang: "en" | "am", targetLang: "en" | "am") => {
      if (!text.trim()) return "";

      setLoading(true);
      setError(null);

      try {
        const response = await api.post<ApiResponse<TranslationResult>>(
          "/ai/translations/translate",
          {
            text: text.trim(),
            sourceLanguage: sourceLang,
            targetLanguage: targetLang,
          },
        );

        if (response.data?.success && response.data?.data) {
          setTranslatedText(response.data.data.translatedText || "");
          return response.data.data.translatedText || "";
        }
      } catch (err: any) {
        const msg = getErrorMessage(err, "Translation failed");
        setError(msg);
      } finally {
        setLoading(false);
      }
      return "";
    },
    [],
  );

  const clearTranslation = useCallback(() => {
    setTranslatedText("");
    setError(null);
  }, []);

  return { translatedText, loading, error, translate, clearTranslation };
}

export default useAITranslation;
