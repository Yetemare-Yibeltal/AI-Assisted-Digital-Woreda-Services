import React, { useState } from "react";
import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";
import { Container } from "@/components/layout/Container";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientText } from "@/components/shared/GradientText";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Copy,
  CheckCircle2,
} from "lucide-react";
import { storage } from "@/utils/storage";

export default function ErrorPage() {
  const error = useRouteError();
  const language = storage.getLanguage();
  const [copied, setCopied] = useState(false);

  const errorMessage =
    isRouteErrorResponse(error)
      ? `${error.status} ${error.statusText}`
      : error instanceof Error
      ? error.message
      : language === "am"
      ? "አንድ ያልተጠበቀ ስህተት ተከስቷል"
      : "An unexpected error occurred";

  const errorStack = error instanceof Error ? error.stack : null;

  const handleCopy = async () => {
    if (errorStack) {
      await navigator.clipboard.writeText(errorStack);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReload = () => {
    window.location.reload();
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <Container maxWidth="md" padding="default" className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center w-full">
        {/* Error Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertTriangle className="h-12 w-12 text-red-400" />
        </div>

        {/* Error Title */}
        <GradientText as="h1" variant="fire" className="text-4xl sm:text-5xl font-black mb-4">
          {language === "am" ? "ስህተት" : "Error"}
        </GradientText>

        {/* Error Message */}
        <h2 className="text-xl sm:text-2xl font-bold mb-3">
          {language === "am" ? "የሆነ ችግር ተከስቷል" : "Something went wrong"}
        </h2>

        <p className="text-muted-foreground text-base max-w-md mx-auto mb-8">
          {language === "am"
            ? "አፕሊኬሽኑ አንድ ያልተጠበቀ ስህተት አጋጥሞታል። እባክዎ እንደገና ይሞክሩ ወይም ወደ መነሻ ገጽ ይመለሱ።"
            : "The application encountered an unexpected error. Please try again or return to the home page."}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-4 flex-wrap mb-8">
          <Button
            variant="primary"
            size="lg"
            onClick={handleReload}
            leftIcon={<RefreshCw className="h-5 w-5" />}
          >
            {language === "am" ? "እንደገና ሞክር" : "Try Again"}
          </Button>
          <Link to="/">
            <Button variant="glass" size="lg" leftIcon={<Home className="h-5 w-5" />}>
              {language === "am" ? "ወደ መነሻ ገጽ" : "Go Home"}
            </Button>
          </Link>
        </div>

        {/* Error Details (Development Mode) */}
        {import.meta.env.DEV && errorStack && (
          <Card variant="glass" className="text-left max-w-lg mx-auto mt-6">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium">
                  <Bug className="h-4 w-4" />
                  {language === "am" ? "የስህተት ዝርዝሮች" : "Error Details"}
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={handleCopy}
                  title={language === "am" ? "ቅዳ" : "Copy"}
                >
                  {copied ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <Alert variant="error">
                <AlertDescription className="font-mono text-xs break-all">
                  {errorMessage}
                </AlertDescription>
              </Alert>

              <details className="text-xs text-muted-foreground">
                <summary className="cursor-pointer hover:text-foreground transition-colors">
                  {language === "am" ? "የስህተት ተከታታይ" : "Stack Trace"}
                </summary>
                <pre className="mt-2 p-3 rounded-lg bg-woreda-darker border border-border/20 overflow-x-auto whitespace-pre-wrap break-all text-[10px] leading-relaxed">
                  {errorStack}
                </pre>
              </details>
            </div>
          </Card>
        )}

        {/* Support Link */}
        <div className="mt-10 pt-6 border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            {language === "am"
              ? "ችግሩ ከቀጠለ፣ እባክዎ ድጋፍ ያግኙ፡ "
              : "If the problem persists, please contact support: "}
            <a href="mailto:support@dangila.gov.et" className="text-primary hover:underline">
              support@dangila.gov.et
            </a>
          </p>
        </div>
      </div>
    </Container>
  );
}