import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  Languages,
  Globe,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  X,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface LanguageDetectionResult {
  detectedLanguage: "en" | "am";
  confidence: number;
  alternativeLanguages: Array<{ language: string; confidence: number }>;
  textSample: string;
}

interface AILanguageDetectorProps {
  language?: "en" | "am";
  className?: string;
  onLanguageDetected?: (result: LanguageDetectionResult) => void;
  initialText?: string;
}

export function AILanguageDetector({
  language = "en",
  className,
  onLanguageDetected,
  initialText = "",
}: AILanguageDetectorProps) {
  const { toast } = useToast();
  const [text, setText] = useState(initialText);
  const [result, setResult] = useState<LanguageDetectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState(false);

  const handleDetect = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length < 3) {
      setError(
        language === "am"
          ? "እባክዎ ቢያንስ 3 ቁምፊዎችን ያስገቡ"
          : "Please enter at least 3 characters"
      );
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setDetecting(true);

    try {
      const response = await api.post<ApiResponse<LanguageDetectionResult>>(
        "/ai/language/detect",
        { text: trimmed }
      );

      if (response.data?.success && response.data?.data) {
        const detectionResult = response.data.data;
        setResult(detectionResult);
        onLanguageDetected?.(detectionResult);
      } else {
        setError(
          language === "am"
            ? "ቋንቋ መለየት አልተሳካም"
            : "Could not detect language"
        );
      }
    } catch (err) {
      const msg = getErrorMessage(
        err,
        language === "am" ? "ቋንቋ መለየት አልተሳካም" : "Language detection failed"
      );
      setError(msg);
      toast({ variant: "error", title: language === "am" ? "ስህተት" : "Error", description: msg });
    } finally {
      setLoading(false);
      setDetecting(false);
    }
  }, [text, language, toast, onLanguageDetected]);

  const handleClear = () => {
    setText("");
    setResult(null);
    setError(null);
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Globe className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {language === "am" ? "ቋንቋ መለያ" : "Language Detector"}
              </CardTitle>
              <CardDescription className="text-xs">
                {language === "am"
                  ? "AI የጽሁፍ ቋንቋ በራስ-ሰር ይለያል (አማርኛ/እንግሊዘኛ)"
                  : "AI automatically detects text language (Amharic/English)"}
              </CardDescription>
            </div>
          </div>
          {text && (
            <Button variant="ghost" size="icon-sm" onClick={handleClear}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Input */}
        <div>
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={
              language === "am"
                ? "ለመለየት ጽሁፍ ያስገቡ..."
                : "Enter text to detect language..."
            }
            rows={3}
            className="resize-none"
            maxLength={2000}
            disabled={loading}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-muted-foreground">
              {text.length}/2000
            </span>
            <Button
              variant="primary"
              size="sm"
              onClick={handleDetect}
              disabled={!text.trim() || loading}
              loading={loading}
              leftIcon={loading ? undefined : <Sparkles className="h-4 w-4" />}
            >
              {loading
                ? language === "am" ? "በመለየት ላይ..." : "Detecting..."
                : language === "am" ? "ለይ" : "Detect"}
            </Button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <Alert variant="warning" dismissible onDismiss={() => setError(null)}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
            <Alert variant={result.confidence >= 70 ? "success" : "warning"}>
              <div className="flex items-start gap-3">
                {result.confidence >= 70 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold text-sm">
                    {language === "am"
                      ? `የተለየ ቋንቋ: ${result.detectedLanguage === "en" ? "እንግሊዘኛ" : "አማርኛ"}`
                      : `Detected: ${result.detectedLanguage === "en" ? "English" : "Amharic"}`}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge
                      variant="secondary"
                      size="sm"
                      className={cn("text-xs", getConfidenceColor(result.confidence))}
                    >
                      {result.confidence}% {language === "am" ? "እምነት" : "confidence"}
                    </Badge>
                  </div>
                </div>
              </div>
            </Alert>

            {/* Confidence bar */}
            <Progress
              value={result.confidence}
              className="h-1.5"
              indicatorColor={
                result.confidence >= 80
                  ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                  : result.confidence >= 50
                  ? "bg-gradient-to-r from-yellow-500 to-yellow-400"
                  : "bg-gradient-to-r from-red-500 to-red-400"
              }
            />

            {/* Alternatives */}
            {result.alternativeLanguages.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">
                  {language === "am" ? "ሌሎች አማራጮች:" : "Alternatives:"}
                </span>
                {result.alternativeLanguages.map((alt, i) => (
                  <Badge key={i} variant="secondary" size="sm" className="text-[10px]">
                    {alt.language === "en" ? "English" : "አማርኛ"} ({alt.confidence}%)
                  </Badge>
                ))}
              </div>
            )}

            {/* Text Sample */}
            <div className="p-3 rounded-lg bg-secondary/10 border border-border/20">
              <p className="text-xs text-muted-foreground mb-1">
                {language === "am" ? "የተተነተነ ጽሁፍ:" : "Analyzed text:"}
              </p>
              <p className="text-sm line-clamp-2">
                {result.textSample || text}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AILanguageDetector;