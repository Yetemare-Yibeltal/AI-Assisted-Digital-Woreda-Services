import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  variant?: "default" | "ethiopia" | "green" | "gold";
  text?: string;
  textAmharic?: string;
  overlay?: boolean;
  fullPage?: boolean;
  progress?: number;
  className?: string;
}

const sizeMap = {
  xs: "h-3 w-3",
  sm: "h-5 w-5",
  default: "h-8 w-8",
  lg: "h-12 w-12",
  xl: "h-16 w-16",
};

const variantMap = {
  default: "text-primary",
  ethiopia: "text-ethiopia-green",
  green: "text-[#009A44]",
  gold: "text-[#FEDD00]",
};

const ringVariantMap = {
  default: "border-primary/20 border-t-primary",
  ethiopia: "border-ethiopia-green/20 border-t-ethiopia-green",
  green: "border-[#009A44]/20 border-t-[#009A44]",
  gold: "border-[#FEDD00]/20 border-t-[#FEDD00]",
};

export function LoadingSpinner({
  size = "default",
  variant = "ethiopia",
  text,
  textAmharic,
  overlay = false,
  fullPage = false,
  progress,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn("flex flex-col items-center justify-center gap-3", className)}>
      {/* Animated gradient ring spinner */}
      <div className="relative">
        <div
          className={cn(
            "rounded-full border-2 animate-spin",
            ringVariantMap[variant],
            sizeMap[size]
          )}
        />
        {progress !== undefined && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-foreground">
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>

      {(text || textAmharic) && (
        <div className="text-center">
          {text && (
            <p className={cn("text-sm font-medium", variantMap[variant])}>
              {text}
            </p>
          )}
          {textAmharic && (
            <p className="text-xs text-muted-foreground font-amharic mt-0.5">
              {textAmharic}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="animate-in fade-in-0 zoom-in-95 duration-300">
          {content}
        </div>
      </div>
    );
  }

  if (overlay) {
    return (
      <div className="absolute inset-0 z-10 flex items-center justify-center bg-woreda-dark/60 backdrop-blur-sm rounded-xl">
        {content}
      </div>
    );
  }

  return content;
}

interface PageLoaderProps {
  message?: string;
  messageAmharic?: string;
}

export function PageLoader({
  message = "Loading Dangila Woreda Services...",
  messageAmharic = "የዳንግላ ወረዳ አገልግሎቶች በመጫን ላይ...",
}: PageLoaderProps) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full border-2 border-ethiopia-green/20 border-t-ethiopia-green animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-ethiopia-yellow/20 border-t-ethiopia-yellow animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
        <div className="absolute inset-4 rounded-full border-2 border-ethiopia-red/20 border-t-ethiopia-red animate-spin" style={{ animationDuration: "2s" }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-ethiopia-green animate-pulse" />
        </div>
      </div>

      <h2 className="text-xl font-bold animated-gradient-text mb-2">
        {message}
      </h2>
      <p className="text-sm text-muted-foreground font-amharic">
        {messageAmharic}
      </p>

      <div className="mt-8 flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-ethiopia-green animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonBlockProps {
  lines?: number;
  className?: string;
}

export function SkeletonBlock({ lines = 4, className }: SkeletonBlockProps) {
  return (
    <div className={cn("space-y-3 animate-pulse", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          className="h-4 bg-secondary/50 rounded-md"
          style={{ width: `${100 - (i * 15)}%` }}
        />
      ))}
    </div>
  );
}

export default LoadingSpinner;