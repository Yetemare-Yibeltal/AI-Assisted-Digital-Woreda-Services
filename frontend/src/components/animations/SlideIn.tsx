import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/shadcn-utils";

interface SlideInProps {
  children: React.ReactNode;
  from?: "left" | "right" | "top" | "bottom";
  duration?: number;
  delay?: number;
  distance?: number | string;
  className?: string;
  once?: boolean;
  as?: "div" | "span" | "section" | "article" | "li";
  threshold?: number;
  easing?: string;
}

export function SlideIn({
  children,
  from = "left",
  duration = 0.5,
  delay = 0,
  distance = "100%",
  className,
  once = true,
  as: Tag = "div",
  threshold = 0.1,
  easing = "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
}: SlideInProps) {
  const [isVisible, setIsVisible] = useState(!once);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!once) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once, threshold]);

  const directionMap: Record<string, string> = {
    left: `translateX(-${typeof distance === "number" ? distance + "px" : distance})`,
    right: `translateX(${typeof distance === "number" ? distance + "px" : distance})`,
    top: `translateY(-${typeof distance === "number" ? distance + "px" : distance})`,
    bottom: `translateY(${typeof distance === "number" ? distance + "px" : distance})`,
  };

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0, 0)" : directionMap[from],
        transition: `opacity ${duration}s ${easing} ${delay}s, transform ${duration}s ${easing} ${delay}s`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}

export default SlideIn;