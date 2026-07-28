import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Label } from "@/components/ui/label";
import { AlertCircle, HelpCircle, Info } from "lucide-react";

interface FormFieldProps {
  label?: string;
  labelAmharic?: string;
  name: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
  language?: "en" | "am";
  tooltip?: string;
  showErrorIcon?: boolean;
  labelClassName?: string;
  errorClassName?: string;
}

export function FormField({
  label,
  labelAmharic,
  name,
  error,
  hint,
  required = false,
  optional = false,
  children,
  className,
  language = "en",
  tooltip,
  showErrorIcon = true,
  labelClassName,
  errorClassName,
}: FormFieldProps) {
  const fieldId = `field-${name}`;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;

  const displayLabel = language === "am" && labelAmharic ? labelAmharic : label;

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label */}
      {(displayLabel || tooltip) && (
        <div className="flex items-center gap-1.5">
          {displayLabel && (
            <Label
              htmlFor={fieldId}
              className={cn(
                "text-sm font-medium leading-none",
                "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
                "flex items-center gap-1",
                labelClassName
              )}
            >
              <span>{displayLabel}</span>
              {required && (
                <span className="text-red-400" aria-hidden="true">
                  *
                </span>
              )}
              {optional && (
                <span className="text-muted-foreground text-xs font-normal ml-1">
                  ({language === "am" ? "አማራጭ" : "optional"})
                </span>
              )}
            </Label>
          )}
          {tooltip && (
            <div className="relative group">
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-woreda-darker text-xs text-foreground rounded-lg border border-border/20 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {tooltip}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Field Content */}
      <div className="relative">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<any>, {
              id: fieldId,
              "aria-describedby": cn(
                error ? errorId : undefined,
                hint ? hintId : undefined
              ),
              "aria-invalid": !!error,
              ...(child.props as any),
            });
          }
          return child;
        })}
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          role="alert"
          className={cn("flex items-start gap-1.5 mt-1", errorClassName)}
        >
          {showErrorIcon && (
            <AlertCircle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
          )}
          <p className="text-xs text-red-400 leading-relaxed">{error}</p>
        </div>
      )}

      {/* Hint Text */}
      {!error && hint && (
        <div id={hintId} className="flex items-start gap-1.5 mt-1">
          <Info className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground">{hint}</p>
        </div>
      )}
    </div>
  );
}

export default FormField;