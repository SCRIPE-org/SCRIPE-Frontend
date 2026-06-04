"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { handleError } from "@core/common/error-handler";
import { appLogger } from "@core/common/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  /** Called when the user clicks Retry — use to reset query error state */
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Use centralized error handling
    const appError = handleError(error, "ErrorBoundary");
    appLogger.error("ErrorBoundary caught an error:", { error, errorInfo, appError });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.props.onReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  /** Called on retry — resets query error state */
  onReset?: () => void;
}

function ErrorFallback({ error, onReset }: ErrorFallbackProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleRetry = () => {
    // Reset query error state first, then refresh the route
    onReset?.();
    router.refresh();
  };

  const handleGoHome = () => {
    router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold">{t("errors.boundary.title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            {t("errors.boundary.description")}
          </p>

          {process.env.NODE_ENV === "development" && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                {t("errors.boundary.details")}
              </summary>
              <pre className="mt-2 overflow-auto rounded-md bg-muted p-3 text-xs">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}

          <div className="flex gap-2">
            <Button onClick={handleRetry} className="flex-1" variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("errors.boundary.retry")}
            </Button>
            <Button onClick={handleGoHome} className="flex-1">
              <Home className="mr-2 h-4 w-4" />
              {t("errors.boundary.home")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Hook for functional components to trigger error boundary
export function useErrorHandler() {
  return (error: Error, errorInfo?: ErrorInfo) => {
    // Use centralized error handling
    const appError = handleError(error, "useErrorHandler");
    appLogger.error("Error caught by useErrorHandler:", { error, errorInfo, appError });

    // Re-throw the error to trigger the error boundary
    throw error;
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, "children">
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

/**
 * QueryAwareErrorBoundary
 *
 * Wraps children in both `QueryErrorResetBoundary` (TanStack Query) and
 * `ErrorBoundary` (React class boundary). When the user clicks Retry:
 *  1. All failed queries are reset so they re-fetch on next render
 *  2. The React component error state is cleared
 *  3. Next.js router refreshes the route
 *
 * Use this instead of bare `<ErrorBoundary>` anywhere queries are rendered.
 */
export function QueryAwareErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => <ErrorBoundary onReset={reset}>{children}</ErrorBoundary>}
    </QueryErrorResetBoundary>
  );
}
