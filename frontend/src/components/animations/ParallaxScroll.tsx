import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/shadcn-utils";

interface ParallaxScrollProps {
  children: React.ReactNode;
  speed?: number;
  direction?: "up" | "down";
  className?: string;
  disabled?: boolean;
  offset?: number;
}

export function ParallaxScroll({
  children,
  speed = 0.5,
  direction = "up",
  className,
  disabled = false,
  offset = 0,
}: ParallaxScrollProps) {
  const [scrollY, setScrollY] = useState(0);
  const [elementTop, setElementTop] = useState(0);
  const [windowHeight, setWindowHeight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const ticking = useRef(false);

  const updatePosition = useCallback(() => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    setElementTop(rect.top + window.scrollY);
    setWindowHeight(window.innerHeight);
  }, [disabled]);

  useEffect(() => {
    setWindowHeight(window.innerHeight);
    updatePosition();

    const handleScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
      updatePosition();
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    updatePosition();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [updatePosition]);

  // Recalculate when children change
  useEffect(() => {
    updatePosition();
  }, [children, updatePosition]);

  if (disabled) {
    return <div className={className}>{children}</div>;
  }

  const rawValue = (scrollY + windowHeight - elementTop) * speed;
  const translateY = direction === "up" ? -rawValue + offset : rawValue + offset;

  return (
    <div
      ref={ref}
      className={cn("will-change-transform", className)}
      style={{
        transform: `translate3d(0, ${translateY}px, 0)`,
      }}
    >
      {children}
    </div>
  );
}

export default ParallaxScroll;