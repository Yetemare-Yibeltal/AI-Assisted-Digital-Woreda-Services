import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/shadcn-utils";

interface FadeInProps {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  duration?: number;
  delay?: number;
  distance?: number;
  className?: string;
  once?: boolean;
  as?: "div" | "span" | "section" | "article" | "li";
  threshold?: number;
  rootMargin?: string;
}

export function FadeIn({
  children,
  direction = "up",
  duration = 0.6,
  delay = 0,
  distance = 24,
  className,
  once = true,
  as: Tag = "div",
  threshold = 0.1,
  rootMargin = "0px 0px -50px 0px",
}: FadeInProps) {
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
      { threshold, rootMargin }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  const directionMap: Record<string, string> = {
    up: `translateY(${distance}px)`,
    down: `translateY(-${distance}px)`,
    left: `translateX(${distance}px)`,
    right: `translateX(-${distance}px)`,
    none: "none",
  };

  return (
    <Tag
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "none" : directionMap[direction],
        transition: `opacity ${duration}s ease-out ${delay}s, transform ${duration}s ease-out ${delay}s`,
      }}
    >
      {children}
    </Tag>
  );
}

export default FadeIn;