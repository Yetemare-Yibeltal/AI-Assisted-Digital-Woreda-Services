import React, { useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useToast } from "@/components/ui/use-toast";
import { storage } from "@/utils/storage";
import { getErrorMessage } from "@/utils/error";
import api from "@/utils/api";
import {
  Sparkles,
  Wand2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import type { ApiResponse } from "@/types/api.types";

interface AutoFillField {
  fieldName: string;
  fieldLabel: string;
  fieldLabelAmharic: string;
  currentValue: string;
  suggestedValue: string;
  confidence: number;
  icon?: string;
}

interface AutoFillResult {
  fields: AutoFillField[];
  totalFields: number;
  filledFields: number;
}

interface AIFormAutoFillProps {
  formContext: {
    serviceName: string;
    serviceNameAmharic: string;
    applicantName?: string;
    applicantPhone?: string;
    applicantId?: string;
    address?: {
      region?: string;
      zone?: string;
      woreda?: string;
      kebele?: string;
    };
  };
  onApplyAll?: (values: Record<string, string>) => void;
  onApplyField?: (fieldName: string, value: string) => void;
  language?: "en" | "am";
  className?: string;
}

const fieldIcons: Record<string, React.ReactNode> = {
  fullName: <User className="h-4 w-4" />,
  fullNameAmharic: <User className="h-4 w-4" />,
  phoneNumber: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  dateOfBirth: <Calendar className="h-4 w-4" />,
  region: <MapPin className="h-4 w-4" />,
  zone: <MapPin className="h-4 w-4" />,
  woreda: <MapPin className="h-4 w-4" />,
  kebele: <MapPin className="h-4 w-4" />,
  default: <FileText className="h-4 w-4" />,
};

export function AIFormAutoFill({
  formContext,
  onApplyAll,
  onApplyField,
  language = "en",
  className,
}: AIFormAutoFillProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AutoFillResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [appliedFields, setAppliedFields] = useState<Record<string, boolean>>({});
  const [appliedAll, setAppliedAll] = useState(false);

  const handleAutoFill = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAppliedFields({});
    setAppliedAll(false);

    try {
      const response = await api.post<ApiResponse<AutoFillResult>>(
        "/ai/form/autofill",
        {
          serviceName: formContext.serviceName,
          language,
          applicantInfo: {
            name: formContext.applicantName,
            phone: formContext.applicantPhone,
            id: formContext.applicantId,
            address: formContext.address,
          },
        }
      );

      if (response.data?.success && response.data?.data) {
        const data = response.data.data;
        setResult(data);
        if (data.fields.length > 0) {
          setExpanded(true);
        }
        toast({
          variant: "success",
          title: language === "am" ? "አውቶ ሙላት ዝግጁ ነው" : "Auto-fill Ready",
          description: language === "am"
            ? `${data.fields.length} መስኮች ሊሞሉ ይችላሉ`
            : `${data.fields.length} fields can be auto-filled`,
        });
      } else {
        setError(
          language === "am"
            ? "ምንም መሙላት የሚችሉ መስኮች አልተገኙም"
            : "No fields available for auto-fill"
        );
      }
    } catch (err) {
      const msg = getErrorMessage(
        err,
        language === "am" ? "አውቶ ሙላት አልተሳካም" : "Auto-fill failed"
      );
      setError(msg);
      toast({ variant: "error", title: language === "am" ? "ስህተት" : "Error", description: msg });
    } finally {
      setLoading(false);
    }
  }, [formContext, language, toast]);

  const handleApplyField = (field: AutoFillField) => {
    onApplyField?.(field.fieldName, field.suggestedValue);
    setAppliedFields((prev) => ({ ...prev, [field.fieldName]: true }));
  };

  const handleApplyAll = () => {
    if (!result) return;
    const values: Record<string, string> = {};
    result.fields.forEach((field) => {
      values[field.fieldName] = field.suggestedValue;
      setAppliedFields((prev) => ({ ...prev, [field.fieldName]: true }));
    });
    onApplyAll?.(values);
    setAppliedAll(true);
    toast({
      variant: "success",
      title: language === "am" ? "ሁሉም ተሞልተዋል" : "All Fields Filled",
      description: language === "am"
        ? `${result.fields.length} መስኮች በራስ-ሰር ተሞልተዋል`
        : `${result.fields.length} fields auto-filled`,
    });
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "text-emerald-400 bg-emerald-500/10";
    if (score >= 50) return "text-yellow-400 bg-yellow-500/10";
    return "text-red-400 bg-red-500/10";
  };

  return (
    <Card variant="glass" className={cn("w-full", className)}>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-ethiopia-yellow/10 flex items-center justify-center">
              <Wand2 className="h-4 w-4 text-ethiopia-yellow" />
            </div>
            <div>
              <p className="text-sm font-bold">
                {language === "am" ? "AI አውቶ ሙላት" : "AI Auto-Fill"}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {language === "am"
                  ? "AI ቅጹን እንዲሞላ ያድርጉ"
                  : "Let AI fill the form for you"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {result && result.fields.length > 0 && !appliedAll && (
              <Button variant="primary" size="sm" onClick={handleApplyAll} className="gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {language === "am" ? "ሁሉንም ሙላ" : "Fill All"}
              </Button>
            )}
            {!loading && !result && (
              <Button
                variant="glass"
                size="sm"
                onClick={handleAutoFill}
                className="gap-1.5"
                leftIcon={<Sparkles className="h-3.5 w-3.5" />}
              >
                {language === "am" ? "አስጀምር" : "Auto-Fill"}
              </Button>
            )}
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded hover:bg-secondary/30 text-muted-foreground"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="mt-3 flex items-center justify-center py-4">
            <LoadingSpinner size="sm" text={language === "am" ? "በመተንተን ላይ..." : "Analyzing form..."} />
          </div>
        )}

        {/* Error */}
        {error && (
          <Alert variant="warning" className="mt-3" dismissible onDismiss={() => setError(null)}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Results */}
        {expanded && result && result.fields.length > 0 && (
          <div className="mt-3 space-y-2 animate-in slide-in-from-top-2 fade-in-0 duration-200">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <CheckCircle2 className="h-3 w-3" />
              <span>
                {language === "am"
                  ? `${result.fields.length} መስኮች ለመሙላት ዝግጁ ናቸው`
                  : `${result.fields.length} fields ready to fill`}
              </span>
            </div>

            {result.fields.map((field, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center justify-between gap-3 p-2.5 rounded-lg transition-all duration-200",
                  appliedFields[field.fieldName] || appliedAll
                    ? "bg-emerald-500/5 border border-emerald-500/20"
                    : "bg-secondary/20 border border-transparent hover:bg-primary/5 hover:border-primary/20"
                )}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-muted-foreground">
                    {fieldIcons[field.fieldName] || fieldIcons.default}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium truncate">
                      {language === "am" ? field.fieldLabelAmharic : field.fieldLabel}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {field.currentValue || (
                        <span className="italic">
                          {language === "am" ? "ባዶ" : "empty"}
                        </span>
                      )}
                      {" → "}
                      <span className="text-primary font-medium">{field.suggestedValue}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="secondary"
                    size="sm"
                    className={cn("text-[10px]", getConfidenceColor(field.confidence))}
                  >
                    {field.confidence}%
                  </Badge>
                  {!appliedFields[field.fieldName] && !appliedAll && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleApplyField(field)}
                      className="text-primary hover:text-primary/80"
                      title={language === "am" ? "ተግብር" : "Apply"}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                  {appliedFields[field.fieldName] && (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

export default AIFormAutoFill;