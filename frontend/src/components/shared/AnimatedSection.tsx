import React from "react";
import { cn } from "@/lib/shadcn-utils";

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  animation?: "fade-in" | "slide-up" | "slide-in-left" | "slide-in-right" | "scale-in" | "bounce-in";
  duration?: number;
  delay?: number;
  once?: boolean;
  as?: "div" | "section" | "article";
}

export function AnimatedSection({
  children,
  className,
  animation = "fade-in",
  duration = 0.6,
  delay = 0,
  once = true,
  as: Tag = "div",
}: AnimatedSectionProps) {
  const [isVisible, setIsVisible] = React.useState(!once);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!once) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [once]);

  const animations: Record<string, string> = {
    "fade-in": "animate-fade-in",
    "slide-up": "animate-slide-up",
    "slide-in-left": "slide-in-left",
    "slide-in-right": "slide-in-right",
    "scale-in": "scale-in",
    "bounce-in": "bounce-in",
  };

  return (
    <Tag
      ref={ref}
      className={cn(
        isVisible ? animations[animation] : "opacity-0",
        className
      )}
      style={{
        animationDuration: `${duration}s`,
        animationDelay: `${delay}s`,
        animationFillMode: "forwards",
      }}
    >
      {children}
    </Tag>
  );
}

export default AnimatedSection;