import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/shadcn-utils";

interface CounterProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  formatter?: (value: number) => string;
  className?: string;
  prefix?: string;
  suffix?: string;
  enableScrollTrigger?: boolean;
  once?: boolean;
}

export function Counter({
  from = 0,
  to,
  duration = 2,
  delay = 0,
  formatter,
  className,
  prefix = "",
  suffix = "",
  enableScrollTrigger = true,
  once = true,
}: CounterProps) {
  const [count, setCount] = useState(from);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (hasAnimated && once) return;
    if (!enableScrollTrigger) {
      startAnimation();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          startAnimation();
          if (once) observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, from, duration, hasAnimated, once, enableScrollTrigger]);

  const startAnimation = () => {
    const startTime = Date.now() + delay * 1000;
    const range = to - from;

    const animate = () => {
      const now = Date.now();
      if (now < startTime) {
        frameRef.current = requestAnimationFrame(animate);
        return;
      }

      const elapsed = (now - startTime) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      const current = Math.round(from + range * eased);
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(to);
        setHasAnimated(true);
      }
    };

    frameRef.current = requestAnimationFrame(animate);
  };

  const displayValue = formatter ? formatter(count) : count.toLocaleString();

  return (
    <span ref={ref} className={cn("tabular-nums", className)}>
      {prefix}{displayValue}{suffix}
    </span>
  );
}

export default Counter;