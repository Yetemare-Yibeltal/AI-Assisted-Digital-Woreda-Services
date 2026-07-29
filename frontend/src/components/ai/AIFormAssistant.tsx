import React, { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import { debounce } from "@/utils/performance";
import api from "@/utils/api";
import {
  Sparkles,
  Lightbulb,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface FormFieldInfo {
  fieldName: string;
  fieldLabel: string;
  fieldLabelAmharic: string;
  currentValue: string;
  serviceName: string;
  serviceNameAmharic: string;
}

interface AIFormAssistantProps {
  field: FormFieldInfo;
  language?: "en" | "am";
  className?: string;
  onApplySuggestion?: (suggestion: string) => void;
  position?: "bottom" | "right";
}

export function AIFormAssistant({
  field,
  language = "en",
  className,
  onApplySuggestion,
  position = "bottom",
}: AIFormAssistantProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [appliedIndex, setAppliedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async () => {
    if (!field.fieldName || !field.serviceName) return;
    
    setLoading(true);
    setError(null);
    setSuggestions([]);

    try {
      const response = await api.post<ApiResponse<{ suggestions: string[] }>>(
        "/ai/form/assist",
        {
          fieldName: field.fieldName,
          fieldLabel: field.fieldLabel,
          currentValue: field.currentValue,
          serviceName: field.serviceName,
          language,
        }
      );

      if (response.data?.success && response.data?.data) {
        setSuggestions(response.data.data.suggestions || []);
      } else {
        setError(
          language === "am"
            ? "ምንም አስተያየት አልተገኘም"
            : "No suggestions available"
        );
      }
    } catch (err) {
      const msg = getErrorMessage(
        err,
        language === "am"
          ? "አስተያየቶች መጫን አልተሳካም"
          : "Failed to load suggestions"
      );
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [field, language]);

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen && suggestions.length === 0 && !loading && !error) {
      fetchSuggestions();
    }
  };

  const handleApply = (suggestion: string, index: number) => {
    onApplySuggestion?.(suggestion);
    setAppliedIndex(index);
    toast({
      title: language === "am" ? "ተተግብሯል" : "Applied",
      description: language === "am"
        ? "አስተያየቱ በሜዳው ላይ ተተግብሯል"
        : "Suggestion applied to field",
    });
    setTimeout(() => setOpen(false), 1000);
  };

  const handleRetry = () => {
    fetchSuggestions();
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const displayLabel =
    language === "am" && field.fieldLabelAmharic
      ? field.fieldLabelAmharic
      : field.fieldLabel;

  return (
    <div ref={containerRef} className={cn("relative inline-block", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        className={cn(
          "transition-colors",
          open ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
        )}
        title={
          language === "am"
            ? "AI አስተያየት አግኝ"
            : "Get AI suggestion"
        }
      >
        <Sparkles className="h-4 w-4" />
      </Button>

      {open && (
        <Card
          className={cn(
            "absolute z-50 w-80 p-3 shadow-2xl border-primary/20",
            position === "bottom"
              ? "top-full mt-2 left-0"
              : "left-full ml-2 top-0"
          )}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Lightbulb className="h-3.5 w-3.5" />
              {language === "am" ? "AI አስተያየት" : "AI Suggestion"}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-0.5 rounded hover:bg-secondary/50 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-2">
            {language === "am"
              ? `ለ"${displayLabel}" መስክ`
              : `For the "${displayLabel}" field`}
          </p>

          {loading && (
            <div className="flex items-center justify-center py-4">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {error && (
            <div className="text-center py-2">
              <p className="text-xs text-red-400 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                {language === "am" ? "እንደገና ሞክር" : "Retry"}
              </Button>
            </div>
          )}

          {!loading && !error && suggestions.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2 p-2 rounded-lg text-xs transition-colors group",
                    appliedIndex === index
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-secondary/20 hover:bg-primary/10 cursor-pointer border border-transparent"
                  )}
                  onClick={() => handleApply(suggestion, index)}
                >
                  <div className="flex-1 leading-relaxed">{suggestion}</div>
                  {appliedIndex === index ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 shrink-0 mt-0.5 transition-opacity" />
                  )}
                </div>
              ))}
            </div>
          )}

          {!loading && !error && suggestions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              {language === "am"
                ? "ምንም አስተያየት የለም"
                : "No suggestions"}
            </p>
          )}
        </Card>
      )}
    </div>
  );
}

export default AIFormAssistant;