import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  type LucideIcon,
} from "lucide-react";

interface StatsCardProps {
  title: string;
  titleAmharic?: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  trendLabel?: string;
  loading?: boolean;
  color?: "green" | "yellow" | "red" | "blue" | "purple" | "default";
  onClick?: () => void;
  className?: string;
  language?: "en" | "am";
  subtitle?: string;
}

const colorConfig: Record<
  NonNullable<StatsCardProps["color"]>,
  { bg: string; text: string; border: string; glow: string }
> = {
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/10",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    glow: "shadow-yellow-500/10",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    glow: "shadow-red-500/10",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/10",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/10",
  },
  default: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    glow: "shadow-primary/10",
  },
};

export function StatsCard({
  title,
  titleAmharic,
  value,
  icon: Icon,
  trend,
  trendValue,
  trendLabel,
  loading = false,
  color = "default",
  onClick,
  className,
  language = "en",
  subtitle,
}: StatsCardProps) {
  const colors = colorConfig[color];

  if (loading) {
    return (
      <Card variant="glass" className={cn("overflow-hidden", className)}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className="space-y-3 flex-1">
              <Skeleton variant="text" className="w-20 h-3" />
              <Skeleton variant="text" className="w-28 h-7" />
              <Skeleton variant="text" className="w-16 h-3" />
            </div>
            <Skeleton variant="circular" width={44} height={44} />
          </div>
        </CardContent>
      </Card>
    );
  }

  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColor =
    trend === "up" ? "text-emerald-400" : trend === "down" ? "text-red-400" : "text-gray-400";
  const trendBg =
    trend === "up"
      ? "bg-emerald-500/10"
      : trend === "down"
      ? "bg-red-500/10"
      : "bg-gray-500/10";

  const displayTitle = language === "am" && titleAmharic ? titleAmharic : title;

  return (
    <Card
      variant="glass"
      className={cn(
        "overflow-hidden transition-all duration-300 hover:shadow-lg",
        colors.glow,
        colors.border,
        onClick && "cursor-pointer hover:border-primary/30",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          {/* Left Content */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1 truncate">
              {displayTitle}
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums">
                {typeof value === "number" ? value.toLocaleString() : value}
              </span>
              {subtitle && (
                <span className="text-xs text-muted-foreground">{subtitle}</span>
              )}
            </div>

            {/* Trend Indicator */}
            {trend && trendValue && (
              <div className="flex items-center gap-1.5 mt-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full",
                    trendBg,
                    trendColor
                  )}
                >
                  <TrendIcon className="h-3 w-3" />
                  {trendValue}
                </span>
                {trendLabel && (
                  <span className="text-xs text-muted-foreground">{trendLabel}</span>
                )}
              </div>
            )}
          </div>

          {/* Right Icon */}
          {Icon && (
            <div
              className={cn(
                "flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center",
                colors.bg,
                colors.text
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
          )}
        </div>

        {/* Color accent bar at bottom */}
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r",
            color === "green" && "from-emerald-500 to-emerald-500/0",
            color === "yellow" && "from-yellow-500 to-yellow-500/0",
            color === "red" && "from-red-500 to-red-500/0",
            color === "blue" && "from-blue-500 to-blue-500/0",
            color === "purple" && "from-purple-500 to-purple-500/0",
            color === "default" && "from-primary to-primary/0"
          )}
        />
      </CardContent>
    </Card>
  );
}

export default StatsCard;