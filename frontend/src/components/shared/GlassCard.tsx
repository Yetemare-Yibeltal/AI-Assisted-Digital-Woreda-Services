import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "hover" | "gradient" | "interactive" | "flat";
  loading?: boolean;
  noPadding?: boolean;
  accent?: "green" | "yellow" | "red" | "none";
  accentPosition?: "top" | "left" | "none";
  glow?: boolean;
  glassOpacity?: "light" | "medium" | "heavy";
  as?: "div" | "article" | "section";
}

const variantStyles: Record<NonNullable<GlassCardProps["variant"]>, string> = {
  default: "glass-card",
  hover: "glass-card-hover cursor-pointer",
  gradient: "glass-card gradient-border",
  interactive: "glass-card-interactive cursor-pointer",
  flat: "bg-woreda-card/50 border border-border/20 rounded-xl",
};

const accentStyles: Record<NonNullable<GlassCardProps["accent"]>, string> = {
  green: "border-ethiopia-green/30",
  yellow: "border-ethiopia-yellow/30",
  red: "border-ethiopia-red/30",
  none: "",
};

const accentBarStyles: Record<NonNullable<GlassCardProps["accent"]>, string> = {
  green: "from-ethiopia-green to-ethiopia-green/0",
  yellow: "from-ethiopia-yellow to-ethiopia-yellow/0",
  red: "from-ethiopia-red to-ethiopia-red/0",
  none: "",
};

const glassOpacityStyles: Record<NonNullable<GlassCardProps["glassOpacity"]>, string> = {
  light: "bg-woreda-glass/50 backdrop-blur-md",
  medium: "bg-woreda-card/80 backdrop-blur-xl",
  heavy: "bg-woreda-darker/90 backdrop-blur-2xl",
};

export function GlassCard({
  variant = "default",
  loading = false,
  noPadding = false,
  accent = "none",
  accentPosition = "top",
  glow = false,
  glassOpacity = "medium",
  as: Tag = "div",
  className,
  children,
  ...props
}: GlassCardProps) {
  if (loading) {
    return (
      <div className={cn("rounded-xl border border-border/20 p-6", glassOpacityStyles[glassOpacity], className)}>
        <Skeleton variant="text" className="w-3/4 mb-4" />
        <Skeleton variant="text" count={3} />
      </div>
    );
  }

  return (
    <Tag
      className={cn(
        "relative overflow-hidden transition-all duration-300",
        variantStyles[variant],
        accent !== "none" && accentStyles[accent],
        glassOpacityStyles[glassOpacity],
        glow && "hover:shadow-lg hover:shadow-primary/5",
        !noPadding && "p-6",
        className
      )}
      {...props}
    >
      {/* Accent bar */}
      {accent !== "none" && accentPosition === "top" && (
        <div
          className={cn(
            "absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r",
            accentBarStyles[accent]
          )}
        />
      )}
      {accent !== "none" && accentPosition === "left" && (
        <div
          className={cn(
            "absolute top-0 left-0 bottom-0 w-0.5 bg-gradient-to-b",
            accentBarStyles[accent]
          )}
        />
      )}

      {/* Glow orb */}
      {glow && (
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      )}

      {children}
    </Tag>
  );
}

interface GlassCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  titleAmharic?: string;
  description?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export function GlassCardHeader({
  title,
  titleAmharic,
  description,
  action,
  icon,
  trend,
  trendValue,
  className,
  children,
  ...props
}: GlassCardHeaderProps) {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)} {...props}>
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {title && <h3 className="text-lg font-bold truncate">{title}</h3>}
            {titleAmharic && (
              <span className="text-sm text-muted-foreground font-amharic truncate">{titleAmharic}</span>
            )}
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full",
                  trend === "up" && "bg-emerald-500/15 text-emerald-400",
                  trend === "down" && "bg-red-500/15 text-red-400",
                  trend === "neutral" && "bg-gray-500/15 text-gray-400"
                )}
              >
                {trend === "up" && <TrendingUp className="h-3 w-3" />}
                {trend === "down" && <TrendingDown className="h-3 w-3" />}
                {trendValue}
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0 ml-2">{action}</div>}
      {children}
    </div>
  );
}

interface GlassCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  border?: boolean;
}

export function GlassCardFooter({
  border = true,
  className,
  children,
  ...props
}: GlassCardFooterProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between pt-4 mt-4",
        border && "border-t border-border/30",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface GlassCardBadgeProps {
  text: string;
  variant?: "green" | "yellow" | "red" | "blue" | "default";
  className?: string;
}

export function GlassCardBadge({ text, variant = "default", className }: GlassCardBadgeProps) {
  const variantStyles: Record<string, string> = {
    green: "bg-ethiopia-green/15 text-ethiopia-green border-ethiopia-green/30",
    yellow: "bg-ethiopia-yellow/15 text-ethiopia-yellow border-ethiopia-yellow/30",
    red: "bg-ethiopia-red/15 text-ethiopia-red border-ethiopia-red/30",
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    default: "bg-primary/15 text-primary border-primary/30",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variantStyles[variant],
        className
      )}
    >
      {text}
    </span>
  );
}

interface GlassCardStatProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  className?: string;
}

export function GlassCardStat({
  label,
  value,
  icon,
  trend,
  trendLabel,
  className,
}: GlassCardStatProps) {
  return (
    <GlassCard variant="hover" className={cn("text-center", className)}>
      <div className="flex items-center justify-center mb-2">
        {icon && (
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-extrabold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
      {trend && trendLabel && (
        <div className="flex items-center justify-center gap-1 mt-2">
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          ) : trend === "down" ? (
            <TrendingDown className="h-3 w-3 text-red-400" />
          ) : null}
          <span
            className={cn(
              "text-xs font-medium",
              trend === "up" && "text-emerald-400",
              trend === "down" && "text-red-400"
            )}
          >
            {trendLabel}
          </span>
        </div>
      )}
    </GlassCard>
  );
}

export default GlassCard;