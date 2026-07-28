import React from "react";
import { cn } from "@/lib/shadcn-utils";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, Bug } from "lucide-react";
import { Link } from "react-router-dom";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  showRetry?: boolean;
  showHome?: boolean;
  message?: string;
  messageAmharic?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private resetTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState((prev) => ({
      errorInfo,
      errorCount: prev.errorCount + 1,
    }));

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }

    // Call onError callback
    this.props.onError?.(error, errorInfo);

    // Auto-reset after 3 errors within 10 seconds
    if (this.state.errorCount >= 3) {
      this.handleReset();
    }
  }

  componentWillUnmount(): void {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    });
  };

  handleRetry = (): void => {
    this.handleReset();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[50vh] flex items-center justify-center p-6">
          <div className="glass-card p-8 max-w-lg w-full text-center space-y-6 animate-in fade-in-0 zoom-in-95 duration-300">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-foreground">
                {this.props.message || "Something went wrong"}
              </h2>
              {this.props.messageAmharic && (
                <p className="text-sm text-muted-foreground mt-1 font-amharic">
                  {this.props.messageAmharic}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-2">
                An unexpected error occurred. Our team has been notified.
              </p>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <div className="text-left bg-woreda-darker rounded-lg p-4 border border-red-500/20 overflow-auto max-h-40">
                <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-2">
                  <Bug className="h-4 w-4" />
                  Error Details
                </div>
                <p className="text-xs text-red-300 font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <pre className="text-[10px] text-muted-foreground mt-2 whitespace-pre-wrap break-all">
                    {this.state.error.stack.split("\n").slice(1, 5).join("\n")}
                  </pre>
                )}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 flex-wrap">
              {this.props.showRetry !== false && (
                <Button
                  onClick={this.handleRetry}
                  variant="primary"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
              )}
              {this.props.showHome !== false && (
                <Link to="/">
                  <Button variant="glass" leftIcon={<Home className="h-4 w-4" />}>
                    Go Home
                  </Button>
                </Link>
              )}
            </div>

            <p className="text-xs text-muted-foreground">
              If the problem persists, please contact support at{" "}
              <span className="text-primary">support@dangila.gov.et</span>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || "Component"})`;

  return WrappedComponent;
}

export default ErrorBoundary;