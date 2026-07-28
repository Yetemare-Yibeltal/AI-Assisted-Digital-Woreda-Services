import React, { Suspense, useState, useEffect } from "react";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

interface ThreeLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  timeout?: number;
}

export function ThreeLoader({
  children,
  fallback,
  timeout = 10000,
}: ThreeLoaderProps) {
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimedOut(true);
    }, timeout);
    return () => clearTimeout(timer);
  }, [timeout]);

  if (timedOut) {
    return (
      <div className="three-error">
        <p>3D scene is taking too long to load. Continuing without it.</p>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        fallback || (
          <div className="three-loading">
            <div className="three-loading-spinner" />
            <LoadingSpinner size="sm" text="Preparing 3D scene..." />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

export default ThreeLoader;