import React from "react";
import { cn } from "@/lib/shadcn-utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  labelAmharic?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  variant?: "default" | "success" | "warning" | "error" | "gradient";
  size?: "sm" | "default" | "lg";
  animated?: boolean;
  indeterminate?: boolean;
  className?: string;
  language?: "en" | "am";
  formatValue?: (value: number, max: number) => string;
}

const variantStyles: Record<NonNullable<ProgressBarProps["variant"]>, string> = {
  default: "bg-primary",
  success: "bg-emerald-400",
  warning: "bg-yellow-400",
  error: "bg-red-400",
  gradient: "bg-gradient-to-r from-[#009A44] via-[#FEDD00] to-[#EF3340]",
};

const sizeStyles: Record<NonNullable<ProgressBarProps["size"]>, { track: string; bar: string; text: string }> = {
  sm: { track: "h-1.5", bar: "h-1.5", text: "text-[10px]" },
  default: { track: "h-2.5", bar: "h-2.5", text: "text-xs" },
  lg: { track: "h-4", bar: "h-4", text: "text-sm" },
};

export function ProgressBar({
  value,
  max = 100,
  label,
  labelAmharic,
  showPercentage = false,
  showLabel = false,
  variant = "default",
  size = "default",
  animated = true,
  indeterminate = false,
  className,
  language = "en",
  formatValue,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;
  const displayLabel = language === "am" && labelAmharic ? labelAmharic : label;
  const sizeConfig = sizeStyles[size];
  const variantClass = variantStyles[variant];

  const ariaProps = indeterminate
    ? { "aria-valuenow": undefined, "aria-valuetext": "Loading..." }
    : {
        "aria-valuenow": percentage,
        "aria-valuemin": 0,
        "aria-valuemax": 100,
        "aria-valuetext": `${percentage}%`,
      };

  return (
    <div className={cn("space-y-1.5", className)}>
      {/* Label and percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between">
          {showLabel && displayLabel && (
            <span className={cn("font-medium text-foreground", sizeConfig.text)}>
              {displayLabel}
            </span>
          )}
          {showPercentage && (
            <span className={cn("tabular-nums text-muted-foreground ml-auto", sizeConfig.text)}>
              {formatValue ? formatValue(value, max) : `${percentage}%`}
            </span>
          )}
        </div>
      )}

      {/* Progress track */}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-secondary/30",
          sizeConfig.track
        )}
        role="progressbar"
        {...ariaProps}
      >
        <div
          className={cn(
            "rounded-full transition-all duration-500 ease-out",
            variantClass,
            sizeConfig.bar,
            animated && !indeterminate && "transition-all duration-500",
            indeterminate && "animate-progress-indeterminate w-1/3"
          )}
          style={
            indeterminate
              ? undefined
              : { width: `${percentage}%` }
          }
        />
      </div>
    </div>
  );
}

export default ProgressBar;