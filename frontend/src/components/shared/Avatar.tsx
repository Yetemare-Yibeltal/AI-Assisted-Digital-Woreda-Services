import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Avatar as AvatarPrimitive, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";

interface SharedAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  className?: string;
  online?: boolean;
  onClick?: () => void;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  default: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

export function SharedAvatar({
  src,
  alt = "User",
  fallback,
  size = "default",
  className,
  online,
  onClick,
}: SharedAvatarProps) {
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="relative inline-flex shrink-0">
      <AvatarPrimitive
        className={cn(sizeClasses[size], "ring-2 ring-border/20", onClick && "cursor-pointer hover:ring-primary/50 transition-all", className)}
        onClick={onClick}
      >
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className="bg-primary/10 text-primary font-bold">
          {fallback ? getInitials(fallback) : <User className="h-4 w-4" />}
        </AvatarFallback>
      </AvatarPrimitive>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full ring-2 ring-background",
            size === "xs" ? "h-1.5 w-1.5" : size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
            online ? "bg-emerald-400" : "bg-gray-500"
          )}
        />
      )}
    </div>
  );
}

export default SharedAvatar;