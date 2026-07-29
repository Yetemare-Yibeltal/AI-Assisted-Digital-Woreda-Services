import React, { useState, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage, getFieldErrors } from "@/utils/error";
import { debounce } from "@/utils/performance";
import api from "@/utils/api";
import {
  ShieldCheck,
  ShieldX,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface ValidationIssue {
  field: string;
  fieldLabel: string;
  fieldLabelAmharic: string;
  message: string;
  messageAmharic: string;
  severity: "error" | "warning" | "info";
  suggestion: string;
  suggestionAmharic: string;
}

interface ValidationResult {
  isValid: boolean;
  issues: ValidationIssue[];
  summary: string;
  summaryAmharic: string;
}

interface AIFormValidatorProps {
  formData: Record<string, string>;
  serviceName: string;
  serviceNameAmharic?: string;
  onApplyFix?: (field: string, value: string) => void;
  onValidationComplete?: (result: ValidationResult) => void;
  language?: "en" | "am";
  className?: string;
  autoValidate?: boolean;
  debounceMs?: number;
}

export function AIFormValidator({
  formData,
  serviceName,
  serviceNameAmharic,
  onApplyFix,
  onValidationComplete,
  language = "en",
  className,
  autoValidate = false,
  debounceMs = 1500,
}: AIFormValidatorProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ValidationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dismissedIssues, setDismissedIssues] = useState<Set<number>>(new Set());
  const [appliedFixes, setAppliedFixes] = useState<Set<number>>(new Set());
  const lastFormDataRef = useRef<string>("");

  const validate = useCallback(async () => {
    // Don't validate if form is empty
    const hasValues = Object.values(formData).some((v) => v && v.trim().length > 0);
    if (!hasValues) return;

    // Don't re-validate if data hasn't changed
    const dataStr = JSON.stringify(formData);
    if (dataStr === lastFormDataRef.current && result) return;
    lastFormDataRef.current = dataStr;

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ApiResponse<ValidationResult>>("/ai/form/validate", {
        formData,
        serviceName,
        language,
      });

      if (response.data?.success && response.data?.data) {
        const validationResult = response.data.data;
        setResult(validationResult);
        setDismissedIssues(new Set());
        setAppliedFixes(new Set());
        onValidationComplete?.(validationResult);

        if (validationResult.issues.length > 0) {
          setExpanded(true);
          if (!autoValidate) {
            const errorCount = validationResult.issues.filter((i) => i.severity === "error").length;
            const warningCount = validationResult.issues.filter((i) => i.severity === "warning").length;
            if (errorCount > 0 || warningCount > 0) {
              toast({
                variant: errorCount > 0 ? "error" : "warning",
                title: language === "am" ? "የማረጋገጫ ጉዳዮች" : "Validation Issues",
                description: language === "am"
                  ? `${errorCount} ስህተቶች, ${warningCount} ማስጠንቀቂያዎች`
                  : `${errorCount} errors, ${warningCount} warnings`,
              });
            }
          }
        }
      }
    } catch (err) {
      const msg = getErrorMessage(
        err,
        language === "am" ? "ማረጋገጥ አልተሳካም" : "Validation failed"
      );
      setError(msg);
      if (!autoValidate) {
        toast({ variant: "error", title: language === "am" ? "ስህተት" : "Error", description: msg });
      }
    } finally {
      setLoading(false);
    }
  }, [formData, serviceName, language, autoValidate, toast, onValidationComplete, result]);

  // Debounced auto-validate
  const debouncedValidate = useCallback(
    debounce(() => {
      validate();
    }, debounceMs),
    [validate, debounceMs]
  );

  useEffect(() => {
    if (autoValidate) {
      debouncedValidate();
    }
  }, [autoValidate, debouncedValidate]);

  const handleApplyFix = (issue: ValidationIssue, index: number) => {
    onApplyFix?.(issue.field, issue.suggestion);
    setAppliedFixes((prev) => new Set([...prev, index]));
    toast({
      title: language === "am" ? "ተስተካክሏል" : "Fixed",
      description: language === "am"
        ? `"${issue.fieldLabelAmharic || issue.fieldLabel}" ተስተካክሏል`
        : `"${issue.fieldLabel}" has been fixed`,
    });
  };

  const handleDismiss = (index: number) => {
    setDismissedIssues((prev) => new Set([...prev, index]));
  };

  const activeIssues = result?.issues.filter(
    (_, i) => !dismissedIssues.has(i)
  ) || [];

  const errorCount = activeIssues.filter((i) => i.severity === "error").length;
  const warningCount = activeIssues.filter((i) => i.severity === "warning").length;
  const infoCount = activeIssues.filter((i) => i.severity === "info").length;
  const totalIssues = activeIssues.length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "error": return "text-red-400 bg-red-500/10 border-red-500/20";
      case "warning": return "text-yellow-400 bg-yellow-500/10 border-yellow-500/20";
      case "info": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      default: return "text-muted-foreground bg-secondary/20";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "error": return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "warning": return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case "info": return <AlertCircle className="h-4 w-4 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              result?.isValid
                ? "bg-emerald-500/10"
                : totalIssues > 0
                ? "bg-yellow-500/10"
                : "bg-primary/10"
            )}>
              {result?.isValid ? (
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
              ) : totalIssues > 0 ? (
                <ShieldX className="h-4 w-4 text-yellow-400" />
              ) : (
                <Sparkles className="h-4 w-4 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold">
                {language === "am" ? "AI ማረጋገጫ" : "AI Validator"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {result?.isValid
                  ? language === "am" ? "ሁሉም መስኮች ትክክል ናቸው" : "All fields look good"
                  : totalIssues > 0
                  ? language === "am"
                    ? `${totalIssues} ጉዳዮች ተገኝተዋል`
                    : `${totalIssues} issues found`
                  : language === "am"
                  ? "ለማረጋገጥ ዝግጁ"
                  : "Ready to validate"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!loading && (
              <Button
                variant="glass"
                size="sm"
                onClick={validate}
                className="gap-1.5"
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              >
                {language === "am" ? "አረጋግጥ" : "Validate"}
              </Button>
            )}
            {loading && (
              <LoadingSpinner size="sm" />
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-secondary/30 text-muted-foreground"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Status badges */}
        {result && (
          <div className="flex items-center gap-2 mt-2">
            {errorCount > 0 && (
              <Badge variant="danger" size="sm" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {errorCount} {language === "am" ? "ስህተቶች" : "errors"}
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="warning" size="sm" className="gap-1">
                <AlertCircle className="h-3 w-3" />
                {warningCount} {language === "am" ? "ማስጠንቀቂያዎች" : "warnings"}
              </Badge>
            )}
            {infoCount > 0 && (
              <Badge variant="info" size="sm" className="gap-1">
                {infoCount} {language === "am" ? "መረጃ" : "info"}
              </Badge>
            )}
            {result.isValid && totalIssues === 0 && (
              <Badge variant="success" size="sm" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {language === "am" ? "ትክክል ነው" : "Valid"}
              </Badge>
            )}
          </div>
        )}

        {/* Summary */}
        {result && expanded && result.summary && (
          <div className={cn(
            "mt-3 p-3 rounded-lg text-xs",
            result.isValid
              ? "bg-emerald-500/5 border border-emerald-500/20"
              : "bg-yellow-500/5 border border-yellow-500/20"
          )}>
            <p className="leading-relaxed">
              {language === "am" ? result.summaryAmharic : result.summary}
            </p>
          </div>
        )}

        {/* Issues List */}
        {expanded && activeIssues.length > 0 && (
          <div className="mt-3 space-y-1.5 max-h-64 overflow-y-auto">
            {activeIssues.map((issue, index) => {
              const originalIndex = result!.issues.indexOf(issue);
              const isApplied = appliedFixes.has(originalIndex);
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-2.5 p-2.5 rounded-lg text-xs transition-all",
                    isApplied
                      ? "bg-emerald-500/5 border border-emerald-500/20"
                      : getSeverityColor(issue.severity)
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {isApplied ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      getSeverityIcon(issue.severity)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="font-medium">
                        {language === "am" ? issue.fieldLabelAmharic : issue.fieldLabel}
                      </span>
                      <Badge variant="secondary" size="sm" className="text-[10px]">
                        {issue.severity}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground">
                      {language === "am" ? issue.messageAmharic : issue.message}
                    </p>
                    {issue.suggestion && !isApplied && (
                      <div className="flex items-center gap-2 mt-1.5">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleApplyFix(issue, originalIndex)}
                          className="gap-1 text-[10px] h-7"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          {language === "am" ? "አስተካክል" : "Fix"}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDismiss(originalIndex)}
                          className="gap-1 text-[10px] h-7"
                        >
                          <X className="h-3 w-3" />
                          {language === "am" ? "ተው" : "Dismiss"}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="mt-3 flex items-center gap-2 text-xs text-red-400">
            <AlertCircle className="h-3.5 w-3.5" />
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={validate} className="text-xs h-7">
              <RefreshCw className="h-3 w-3 mr-1" />
              {language === "am" ? "እንደገና" : "Retry"}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}

export default AIFormValidator;