import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  ChevronDown,
  ChevronUp,
  Bug,
} from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorFallbackProps {
  error?: Error | null;
  errorInfo?: React.ErrorInfo | null;
  message?: string;
  messageAmharic?: string;
  onRetry?: () => void;
  onReset?: () => void;
  showHome?: boolean;
  showDetails?: boolean;
  language?: "en" | "am";
  className?: string;
  compact?: boolean;
}

export function ErrorFallback({
  error,
  errorInfo,
  message = "Something went wrong",
  messageAmharic = "አንድ ስህተት ተከስቷል",
  onRetry,
  onReset,
  showHome = true,
  showDetails = false,
  language = "en",
  className,
  compact = false,
}: ErrorFallbackProps) {
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const displayMessage = language === "am" ? messageAmharic : message;
  const errorMessage = error?.message || "";

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  if (compact) {
    return (
      <Alert variant="error" className={cn("w-full", className)}>
        <AlertTriangle className="h-5 w-5" />
        <AlertDescription>
          <div className="flex items-center gap-3">
            <span className="text-sm">{displayMessage}</span>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={handleRetry} className="gap-1">
                <RefreshCw className="h-3.5 w-3.5" />
                {language === "am" ? "እንደገና ሞክር" : "Retry"}
              </Button>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card variant="glass" className={cn("w-full max-w-lg mx-auto", className)}>
      <CardContent className="p-6 text-center space-y-5">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>

        {/* Error Message */}
        <div>
          <h3 className="text-lg font-bold">{displayMessage}</h3>
          {errorMessage && (
            <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto break-words">
              {errorMessage}
            </p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {language === "am"
              ? "እባክዎ እንደገና ይሞክሩ ወይም ወደ መነሻ ገጽ ይመለሱ።"
              : "Please try again or return to the home page."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {onRetry && (
            <Button
              variant="primary"
              onClick={handleRetry}
              leftIcon={<RefreshCw className="h-4 w-4" />}
            >
              {language === "am" ? "እንደገና ሞክር" : "Try Again"}
            </Button>
          )}
          {showHome && (
            <Link to="/">
              <Button variant="glass" leftIcon={<Home className="h-4 w-4" />}>
                {language === "am" ? "ወደ መነሻ ገጽ" : "Go Home"}
              </Button>
            </Link>
          )}
          {onReset && (
            <Button variant="outline" onClick={handleReset}>
              {language === "am" ? "ዳግም አስጀምር" : "Reset"}
            </Button>
          )}
        </div>

        {/* Error Details (Development Mode) */}
        {(showDetails || import.meta.env.DEV) && error && (
          <div className="text-left">
            <button
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mx-auto"
            >
              <Bug className="h-3.5 w-3.5" />
              {language === "am" ? "የስህተት ዝርዝሮች" : "Error Details"}
              {detailsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
            {detailsOpen && (
              <div className="mt-2 p-3 rounded-lg bg-woreda-darker border border-border/20 overflow-x-auto">
                <p className="text-xs text-red-400 font-mono mb-2">{error.message}</p>
                {error.stack && (
                  <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap break-all max-h-40 overflow-y-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {/* Support Link */}
        <p className="text-xs text-muted-foreground">
          {language === "am"
            ? "ችግሩ ከቀጠለ፡ "
            : "If the problem persists: "}
          <a href="mailto:support@dangila.gov.et" className="text-primary hover:underline">
            support@dangila.gov.et
          </a>
        </p>
      </CardContent>
    </Card>
  );
}

export default ErrorFallback;