import React, { Suspense, lazy } from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { store } from "@/store/store";
import { queryClient } from "@/lib/query-client";
import { AuthProvider } from "./AuthProvider";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";

const AIProvider = lazy(() =>
  import("@/components/ai/AIChatBot").then((m) => ({
    default: () => null,
  }))
);

interface AppProviderProps {
  children: React.ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return (
    <ErrorBoundary
      message="The application encountered an error"
      messageAmharic="አፕሊኬሽኑ ስህተት አጋጥሞታል።"
    >
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <AuthProvider>
              <ThemeProvider>
                <ToastProvider>
                  <Suspense
                    fallback={
                      <div className="flex items-center justify-center min-h-screen bg-woreda-dark">
                        <LoadingSpinner
                          size="lg"
                          text="Loading Dangila Woreda Services..."
                          textAmharic="የዳንግላ ወረዳ አገልግሎቶች በመጫን ላይ..."
                          variant="ethiopia"
                        />
                      </div>
                    }
                  >
                    {children}
                  </Suspense>
                  <Toaster />
                </ToastProvider>
              </ThemeProvider>
            </AuthProvider>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default AppProvider;