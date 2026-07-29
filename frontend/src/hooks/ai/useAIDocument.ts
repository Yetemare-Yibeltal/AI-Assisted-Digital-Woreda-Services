import { useState, useCallback } from "react";
import { getErrorMessage } from "@/utils/error";
import { readFileAsBase64 } from "@/utils/file";
import api from "@/utils/api";
import type { ApiResponse } from "@/types/api.types";

interface ScanResult {
  documentType: string;
  confidence: number;
  extractedText: string;
  isValid: boolean;
  warnings: string[];
}

interface VerificationResult {
  isVerified: boolean;
  confidence: number;
  notes: string;
  checks: Array<{ name: string; passed: boolean; message: string }>;
}

export function useAIDocument() {
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [verificationResult, setVerificationResult] =
    useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scanDocument = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const base64 = await readFileAsBase64(file);
      const response = await api.post<ApiResponse<ScanResult>>(
        "/ai/documents/scan",
        {
          file: base64,
          fileName: file.name,
          fileType: file.type,
        },
      );
      if (response.data?.success && response.data?.data) {
        setScanResult(response.data.data);
        return response.data.data;
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "Scan failed"));
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const verifyDocument = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    try {
      const base64 = await readFileAsBase64(file);
      const response = await api.post<ApiResponse<VerificationResult>>(
        "/ai/documents/verify",
        {
          file: base64,
          fileName: file.name,
          fileType: file.type,
        },
      );
      if (response.data?.success && response.data?.data) {
        setVerificationResult(response.data.data);
        return response.data.data;
      }
    } catch (err: any) {
      setError(getErrorMessage(err, "Verification failed"));
    } finally {
      setLoading(false);
    }
    return null;
  }, []);

  const clearResults = useCallback(() => {
    setScanResult(null);
    setVerificationResult(null);
    setError(null);
  }, []);

  return {
    scanResult,
    verificationResult,
    loading,
    error,
    scanDocument,
    verifyDocument,
    clearResults,
  };
}

export default useAIDocument;
