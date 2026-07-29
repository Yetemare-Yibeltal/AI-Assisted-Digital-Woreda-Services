import React from "react";
import { cn } from "@/lib/shadcn-utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular" | "card" | "table-row" | "form" | "avatar" | "button";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
  count?: number;
  className?: string;
}

export function Skeleton({
  variant = "text",
  width,
  height,
  animation = "pulse",
  count = 1,
  className,
  ...props
}: SkeletonProps) {
  const baseClasses = "bg-secondary/30 relative overflow-hidden";

  const animationClasses: Record<string, string> = {
    pulse: "animate-pulse",
    wave: cn(
      "before:absolute before:inset-0 before:-translate-x-full",
      "before:animate-[shimmer_2s_infinite]",
      "before:bg-gradient-to-r before:from-transparent before:via-white/5 before:to-transparent"
    ),
    none: "",
  };

  const variantClasses: Record<string, string> = {
    text: "rounded-md h-4 w-full",
    circular: "rounded-full",
    rectangular: "rounded-lg",
    card: "rounded-xl h-48 w-full",
    "table-row": "rounded-md h-12 w-full",
    form: "rounded-lg h-10 w-full",
    avatar: "rounded-full h-10 w-10",
    button: "rounded-lg h-10 w-24",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  if (count > 1) {
    return (
      <div className={cn("space-y-2", className)} {...props}>
        {Array.from({ length: count }).map((_, i) => (
          <Skeleton
            key={i}
            variant={variant}
            width={width}
            height={height}
            animation={animation}
            className={i === count - 1 && variant === "text" ? "w-3/4" : undefined}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], animationClasses[animation], className)}
      style={style}
      {...props}
    />
  );
}

export default Skeleton;