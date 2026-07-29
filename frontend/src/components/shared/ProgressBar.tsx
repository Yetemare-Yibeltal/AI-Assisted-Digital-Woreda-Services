import React from "react";
import { cn } from "@/lib/shadcn-utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  labelAmharic?: string;
  showPercentage?: boolean;
  showLabel?: boolean;
  size?: "xs" | "sm" | "default" | "lg";
  color?: "green" | "yellow" | "red" | "blue" | "purple" | "default";
  animated?: boolean;
  striped?: boolean;
  className?: string;
  language?: "en" | "am";
}

const sizeClasses = {
  xs: "h-1",
  sm: "h-1.5",
  default: "h-2.5",
  lg: "h-4",
};

const colorClasses = {
  green: "bg-gradient-to-r from-emerald-500 to-emerald-400",
  yellow: "bg-gradient-to-r from-yellow-500 to-yellow-400",
  red: "bg-gradient-to-r from-red-500 to-red-400",
  blue: "bg-gradient-to-r from-blue-500 to-blue-400",
  purple: "bg-gradient-to-r from-purple-500 to-purple-400",
  default: "bg-gradient-to-r from-primary to-primary/80",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  labelAmharic,
  showPercentage = true,
  showLabel = false,
  size = "default",
  color = "default",
  animated = true,
  striped = false,
  className,
  language = "en",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max(0, Math.round((value / max) * 100)), 100);
  const displayLabel = language === "am" && labelAmharic ? labelAmharic : label;

  return (
    <div className={cn("space-y-1.5 w-full", className)}>
      {/* Label & Percentage */}
      {(showLabel || showPercentage) && (
        <div className="flex items-center justify-between text-xs">
          {showLabel && displayLabel && (
            <span className="text-muted-foreground font-medium">{displayLabel}</span>
          )}
          {showPercentage && (
            <span className="text-muted-foreground tabular-nums ml-auto">
              {percentage}%
            </span>
          )}
        </div>
      )}

      {/* Bar */}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-secondary/40",
          sizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={displayLabel || `Progress ${percentage}%`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            colorClasses[color],
            animated && "animate-pulse",
            striped && "bg-stripes"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;