import React, { Suspense, lazy, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Toaster } from "@/components/ui/toaster";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";

const ThreeBackground = lazy(() =>
  import("@/components/three/ThreeBackground").then((m) => ({ default: m.ThreeBackground }))
);

const AIChatBot = lazy(() =>
  import("@/components/ai/AIChatBot").then((m) => ({ default: m.AIChatBot }))
);

export function RootLayout() {
  const location = useLocation();
  const [showChat, setShowChat] = React.useState(false);
  const [language, setLanguage] = React.useState<"en" | "am">(() => {
    return (localStorage.getItem("language") as "en" | "am") || "en";
  });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        e.preventDefault();
        setShowChat((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
                  <LoadingSpinner
                    size="lg"
                    text="Loading page..."
                    textAmharic="ገጽ በመጫን ላይ..."
                  />
                </div>
              }
            >
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>

        <Footer language={language} />
      </div>

      <Suspense fallback={null}>
        <AIChatBot isOpen={showChat} onClose={() => setShowChat(false)} language={language} />
      </Suspense>

      <Toaster />

      <button
        onClick={() => setShowChat(!showChat)}
        className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:brightness-110 transition-all duration-300 flex items-center justify-center"
        aria-label="Toggle AI Chat"
        title="AI Assistant (Ctrl+/)"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
          />
        </svg>
      </button>
    </div>
  );
}

export default RootLayout;