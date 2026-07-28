import React, { useEffect } from "react";
import { useFormContext, type FieldValues, type Path } from "react-hook-form";
import { cn } from "@/lib/shadcn-utils";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, X } from "lucide-react";
import { getFieldErrors, getErrorMessage, isValidationError } from "@/utils/error";
import type { AppError } from "@/utils/error";

interface FormValidationProps {
  error?: AppError | unknown;
  className?: string;
  language?: "en" | "am";
  onDismiss?: () => void;
  showFieldErrors?: boolean;
  showSummary?: boolean;
}

export function FormValidation({
  error,
  className,
  language = "en",
  onDismiss,
  showFieldErrors = true,
  showSummary = true,
}: FormValidationProps) {
  const { setError, clearErrors, formState } = useFormContext();

  useEffect(() => {
    if (!error) {
      clearErrors();
      return;
    }

    const fieldErrors = getFieldErrors(error);

    if (Object.keys(fieldErrors).length > 0) {
      // Map backend field errors to React Hook Form fields
      Object.entries(fieldErrors).forEach(([field, message]) => {
        // Try exact match first, then try nested paths
        const possiblePaths = [
          field,
          `applicantInfo.${field}`,
          `address.${field}`,
          field.replace("body.", "").replace("query.", "").replace("params.", ""),
        ];

        for (const path of possiblePaths) {
          try {
            setError(path as Path<FieldValues>, {
              type: "server",
              message,
            });
            break;
          } catch {
            // Path doesn't exist in form, try next
          }
        }
      });
    }
  }, [error, setError, clearErrors]);

  if (!error) return null;

  const message = getErrorMessage(error);
  const isValidation = isValidationError(error);
  const fieldErrors = getFieldErrors(error);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Summary Alert */}
      {showSummary && message && (
        <Alert
          variant={isValidation ? "warning" : "error"}
          dismissible={!!onDismiss}
          onDismiss={onDismiss}
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>
            {isValidation
              ? language === "am"
                ? "የማረጋገጫ ስህተት"
                : "Validation Error"
              : language === "am"
              ? "ስህተት"
              : "Error"}
          </AlertTitle>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      {/* Field-level errors */}
      {showFieldErrors && hasFieldErrors && (
        <div className="space-y-2">
          {Object.entries(fieldErrors).map(([field, msg]) => (
            <div
              key={field}
              className="flex items-start gap-2 p-2.5 rounded-lg bg-red-500/5 border border-red-500/15"
            >
              <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-red-400 capitalize">
                  {field
                    .replace(/([A-Z])/g, " $1")
                    .replace(/\./g, " › ")
                    .replace(/_/g, " ")
                    .trim()}
                </p>
                <p className="text-xs text-red-300 mt-0.5">{msg}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface UseFormValidationOptions {
  language?: "en" | "am";
  onSuccess?: (data: any) => void;
  onError?: (error: AppError) => void;
}

export function useFormValidation(options: UseFormValidationOptions = {}) {
  const { language = "en", onSuccess, onError } = options;
  const { setError, reset } = useFormContext();

  const handleSubmitSuccess = (data: any) => {
    onSuccess?.(data);
  };

  const handleSubmitError = (error: unknown) => {
    const fieldErrors = getFieldErrors(error);
    const message = getErrorMessage(
      error,
      language === "am" ? "አንድ ስህተት ተከስቷል" : "An error occurred"
    );

    // Set field errors
    Object.entries(fieldErrors).forEach(([field, msg]) => {
      const possiblePaths = [field, `applicantInfo.${field}`, `address.${field}`];
      for (const path of possiblePaths) {
        try {
          setError(path as Path<FieldValues>, { type: "server", message: msg });
          break;
        } catch {}
      }
    });

    // Set root error if no field errors
    if (Object.keys(fieldErrors).length === 0) {
      setError("root", { type: "server", message });
    }

    onError?.(error as AppError);
  };

  const clearAllErrors = () => {
    reset(undefined, { keepValues: true });
  };

  return {
    handleSubmitSuccess,
    handleSubmitError,
    clearAllErrors,
  };
}

export default FormValidation;