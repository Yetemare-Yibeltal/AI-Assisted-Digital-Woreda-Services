import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Lightbulb,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  Users,
  Clock,
  Coins,
  FileText,
} from "lucide-react";

interface AIInsightCardProps {
  title: string;
  titleAmharic?: string;
  description: string;
  descriptionAmharic?: string;
  value?: string | number;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: "chart" | "users" | "clock" | "coins" | "file" | "alert" | "success" | "lightbulb";
  color?: "green" | "yellow" | "red" | "blue" | "purple" | "default";
  onClick?: () => void;
  actionLabel?: string;
  actionLabelAmharic?: string;
  loading?: boolean;
  className?: string;
  language?: "en" | "am";
}

const iconMap = {
  chart: BarChart3,
  users: Users,
  clock: Clock,
  coins: Coins,
  file: FileText,
  alert: AlertCircle,
  success: CheckCircle2,
  lightbulb: Lightbulb,
};

const colorConfig = {
  green: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/5",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    glow: "shadow-yellow-500/5",
  },
  red: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    glow: "shadow-red-500/5",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    glow: "shadow-blue-500/5",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/5",
  },
  default: {
    bg: "bg-primary/10",
    text: "text-primary",
    border: "border-primary/20",
    glow: "shadow-primary/5",
  },
};

export function AIInsightCard({
  title,
  titleAmharic,
  description,
  descriptionAmharic,
  value,
  trend,
  trendValue,
  icon = "lightbulb",
  color = "default",
  onClick,
  actionLabel,
  actionLabelAmharic,
  loading = false,
  className,
  language = "en",
}: AIInsightCardProps) {
  const colors = colorConfig[color];
  const Icon = iconMap[icon] || Lightbulb;
  const TrendIcon = trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;

  const trendColor =
    trend === "up"
      ? "text-emerald-400 bg-emerald-500/10"
      : trend === "down"
      ? "text-red-400 bg-red-500/10"
      : "text-gray-400 bg-gray-500/10";

  const displayTitle =
    language === "am" && titleAmharic ? titleAmharic : title;
  const displayDescription =
    language === "am" && descriptionAmharic ? descriptionAmharic : description;
  const displayAction =
    actionLabel
      ? language === "am" && actionLabelAmharic
        ? actionLabelAmharic
        : actionLabel
      : undefined;

  return (
    <Card
      variant="glass"
      className={cn(
        "overflow-hidden transition-all duration-300",
        onClick && "cursor-pointer hover:border-primary/30",
        colors.glow,
        className
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div
            className={cn(
              "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center",
              colors.bg,
              colors.text
            )}
          >
            <Icon className="h-5 w-5" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h4 className="text-sm font-bold truncate">{displayTitle}</h4>
              {trend && trendValue && (
                <Badge
                  variant="secondary"
                  size="sm"
                  className={cn("shrink-0 gap-0.5", trendColor)}
                >
                  <TrendIcon className="h-3 w-3" />
                  {trendValue}
                </Badge>
              )}
            </div>

            {value !== undefined && (
              <p className="text-2xl font-extrabold tracking-tight mb-1 tabular-nums">
                {typeof value === "number" ? value.toLocaleString() : value}
              </p>
            )}

            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
              {displayDescription}
            </p>

            {displayAction && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs gap-1 text-primary hover:text-primary/80 -ml-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                  }}
                >
                  {displayAction}
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default AIInsightCard;