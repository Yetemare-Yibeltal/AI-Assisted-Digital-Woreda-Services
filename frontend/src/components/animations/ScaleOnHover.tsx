import React from "react";
import { cn } from "@/lib/shadcn-utils";

interface ScaleOnHoverProps {
  children: React.ReactNode;
  scale?: number;
  duration?: number;
  className?: string;
  as?: "div" | "span" | "button";
  disabled?: boolean;
  enableGlow?: boolean;
  glowColor?: string;
}

export function ScaleOnHover({
  children,
  scale = 1.05,
  duration = 0.3,
  className,
  as: Tag = "div",
  disabled = false,
  enableGlow = false,
  glowColor = "rgba(0, 154, 68, 0.3)",
}: ScaleOnHoverProps) {
  return (
    <Tag
      className={cn(
        "transition-transform",
        !disabled && "hover:scale-[--scale-amount]",
        enableGlow && !disabled && "hover:shadow-[--glow-color]",
        className
      )}
      style={{
        "--scale-amount": scale,
        "--glow-color": `0 0 20px ${glowColor}`,
        transitionDuration: `${duration}s`,
        transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
        cursor: disabled ? "default" : undefined,
      } as React.CSSProperties}
    >
      {children}
    </Tag>
  );
}

export default ScaleOnHover;