import React, { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import { debounce } from "@/utils/performance";
import api from "@/utils/api";
import {
  HelpCircle,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle2,
  Info,
  ExternalLink,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface FieldHelperData {
  fieldName: string;
  fieldLabel: string;
  fieldLabelAmharic: string;
  serviceName: string;
  serviceNameAmharic: string;
  description: string;
  descriptionAmharic: string;
  examples: string[];
  examplesAmharic: string[];
  commonMistakes: string[];
  commonMistakesAmharic: string[];
  validationRules: string[];
  validationRulesAmharic: string[];
  relatedLinks: Array<{ label: string; labelAmharic: string; url: string }>;
}

interface AIFormFieldHelperProps {
  fieldName: string;
  fieldLabel: string;
  fieldLabelAmharic?: string;
  serviceName: string;
  serviceNameAmharic?: string;
  language?: "en" | "am";
  className?: string;
  compact?: boolean;
}

export function AIFormFieldHelper({
  fieldName,
  fieldLabel,
  fieldLabelAmharic,
  serviceName,
  serviceNameAmharic,
  language = "en",
  className,
  compact = false,
}: AIFormFieldHelperProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<FieldHelperData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"examples" | "mistakes" | "rules">("examples");

  const fetchHelp = useCallback(async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      const response = await api.post<ApiResponse<FieldHelperData>>("/ai/form/help", {
        fieldName,
        fieldLabel,
        serviceName,
        language,
      });
      if (response.data?.success && response.data?.data) {
        setData(response.data.data);
      } else {
        setError(
          language === "am"
            ? "ለዚህ መስክ ምንም እርዳታ አልተገኘም"
            : "No help available for this field"
        );
      }
    } catch (err) {
      const msg = getErrorMessage(
        err,
        language === "am" ? "እርዳታ መጫን አልተሳካም" : "Failed to load help"
      );
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [fieldName, fieldLabel, serviceName, language]);

  const handleToggle = () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen && !data && !loading) {
      fetchHelp();
    }
  };

  const displayLabel =
    language === "am" && fieldLabelAmharic ? fieldLabelAmharic : fieldLabel;
  const displayService =
    language === "am" && serviceNameAmharic ? serviceNameAmharic : serviceName;

  return (
    <div className={cn("relative inline-block", className)}>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={handleToggle}
        className={cn(
          "transition-colors",
          open ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-primary"
        )}
        title={language === "am" ? "እርዳታ አግኝ" : "Get help"}
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {open && (
        <Card className="absolute z-50 w-80 sm:w-96 p-4 shadow-2xl border-primary/20 top-full mt-2 left-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              <Sparkles className="h-4 w-4" />
              {language === "am" ? "የመስክ እርዳታ" : "Field Help"}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-0.5 rounded hover:bg-secondary/50 text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="text-xs text-muted-foreground mb-3">
            <span className="font-medium text-foreground">{displayLabel}</span>
            {" — "}
            <span>{displayService}</span>
          </div>

          {loading && (
            <div className="flex items-center justify-center py-6">
              <LoadingSpinner size="sm" />
            </div>
          )}

          {error && (
            <div className="text-center py-4">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
              <p className="text-xs text-red-400 mb-2">{error}</p>
              <Button variant="outline" size="sm" onClick={fetchHelp}>
                {language === "am" ? "እንደገና ሞክር" : "Retry"}
              </Button>
            </div>
          )}

          {data && !loading && (
            <div className="space-y-3">
              {/* Description */}
              <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-xs leading-relaxed">
                  {language === "am" ? data.descriptionAmharic : data.description}
                </p>
              </div>

              {/* Tabs: Examples / Mistakes / Rules */}
              <div className="flex gap-1 border-b border-border/30 pb-2">
                {(["examples", "mistakes", "rules"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "text-xs px-2.5 py-1 rounded-md transition-colors",
                      activeTab === tab
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab === "examples"
                      ? language === "am" ? "ምሳሌዎች" : "Examples"
                      : tab === "mistakes"
                      ? language === "am" ? "ስህተቶች" : "Mistakes"
                      : language === "am" ? "ህጎች" : "Rules"}
                  </button>
                ))}
              </div>

              {/* Examples */}
              {activeTab === "examples" && data.examples.length > 0 && (
                <div className="space-y-1.5">
                  {(language === "am" ? data.examplesAmharic : data.examples).map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-secondary/20 text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 mt-0.5 shrink-0" />
                      <span>{ex}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Common Mistakes */}
              {activeTab === "mistakes" && data.commonMistakes.length > 0 && (
                <div className="space-y-1.5">
                  {(language === "am" ? data.commonMistakesAmharic : data.commonMistakes).map((m, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-xs">
                      <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Validation Rules */}
              {activeTab === "rules" && data.validationRules.length > 0 && (
                <div className="space-y-1.5">
                  {(language === "am" ? data.validationRulesAmharic : data.validationRules).map((r, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-blue-500/5 border border-blue-500/10 text-xs">
                      <Info className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Related Links */}
              {data.relatedLinks.length > 0 && (
                <div className="pt-2 border-t border-border/20">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    {language === "am" ? "ተዛማጅ አገናኞች" : "Related Links"}
                  </p>
                  {data.relatedLinks.map((link, i) => (
                    <a
                      key={i}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs text-primary hover:underline py-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {language === "am" ? link.labelAmharic : link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export default AIFormFieldHelper;