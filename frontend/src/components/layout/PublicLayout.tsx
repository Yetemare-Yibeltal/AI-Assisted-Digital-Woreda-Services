import React, { Suspense, lazy, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Container } from "./Container";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { storage } from "@/utils/storage";

const ThreeBackground = lazy(() =>
  import("@/components/three/ThreeBackground").then((m) => ({ default: m.ThreeBackground }))
);

interface PublicLayoutProps {
  children?: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const location = useLocation();
  const [language, setLanguage] = React.useState<"en" | "am">(storage.getLanguage());

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  return (
    <div className="relative min-h-screen bg-woreda-dark">
      <Suspense fallback={null}>
        <ThreeBackground />
      </Suspense>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar language={language} onLanguageChange={setLanguage} />

        <main className="flex-1">
          <ErrorBoundary>
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[60vh]">
                  <LoadingSpinner size="lg" text="Loading..." textAmharic="በመጫን ላይ..." />
                </div>
              }
            >
              {children || <Outlet />}
            </Suspense>
          </ErrorBoundary>
        </main>

        <Footer language={language} />
      </div>

      <Toaster />
    </div>
  );
}

export default PublicLayout;