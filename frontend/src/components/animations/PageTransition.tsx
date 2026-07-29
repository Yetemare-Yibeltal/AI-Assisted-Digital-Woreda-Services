import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/shadcn-utils";

interface PageTransitionProps {
  children: React.ReactNode;
  animation?: "fade" | "slide-up" | "slide-left" | "slide-right" | "scale" | "none";
  duration?: number;
  className?: string;
}

export function PageTransition({
  children,
  animation = "fade",
  duration = 0.35,
  className,
}: PageTransitionProps) {
  const location = useLocation();
  const [isEntering, setIsEntering] = useState(true);
  const [displayChildren, setDisplayChildren] = useState(children);
  const [prevChildren, setPrevChildren] = useState(children);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (children === displayChildren) return;
    setIsEntering(false);
    setPrevChildren(displayChildren);

    timeoutRef.current = setTimeout(() => {
      setDisplayChildren(children);
      setIsEntering(true);
    }, duration * 1000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [children, displayChildren, duration]);

  useEffect(() => {
    setIsEntering(true);
  }, [location.pathname]);

  const animationClasses: Record<string, { enter: string; exit: string }> = {
    fade: {
      enter: "opacity-100",
      exit: "opacity-0",
    },
    "slide-up": {
      enter: "opacity-100 translate-y-0",
      exit: "opacity-0 translate-y-4",
    },
    "slide-left": {
      enter: "opacity-100 translate-x-0",
      exit: "opacity-0 -translate-x-4",
    },
    "slide-right": {
      enter: "opacity-100 translate-x-0",
      exit: "opacity-0 translate-x-4",
    },
    scale: {
      enter: "opacity-100 scale-100",
      exit: "opacity-0 scale-95",
    },
    none: {
      enter: "",
      exit: "",
    },
  };

  const classes = animationClasses[animation] || animationClasses.fade;

  return (
    <div className={cn("relative", className)}>
      {/* Previous content (exiting) */}
      {prevChildren !== displayChildren && (
        <div
          className={cn(
            "w-full",
            classes.exit,
            "transition-all"
          )}
          style={{
            transitionDuration: `${duration}s`,
            transitionTimingFunction: "ease-out",
          }}
        >
          {prevChildren}
        </div>
      )}

      {/* Current content (entering) */}
      <div
        className={cn(
          "w-full",
          isEntering ? classes.enter : classes.exit,
          "transition-all",
          prevChildren !== displayChildren ? "absolute inset-0" : ""
        )}
        style={{
          transitionDuration: `${duration}s`,
          transitionTimingFunction: "ease-out",
        }}
      >
        {displayChildren}
      </div>
    </div>
  );
}

export default PageTransition;