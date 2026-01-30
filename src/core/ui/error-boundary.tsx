"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@core/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@core/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useI18n } from '@core/providers/i18n-provider';
import { handleError } from '@core/common/error-handler';
import { appLogger } from '@core/common/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
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
    const appError = handleError(error, 'ErrorBoundary');
    appLogger.error('ErrorBoundary caught an error:', { error, errorInfo, appError });
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
}

function ErrorFallback({ error }: ErrorFallbackProps) {
  const router = useRouter();
  const { t } = useI18n();

  const handleRetry = () => {
    // Use Next.js router for navigation instead of window.location.reload
    router.refresh();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="text-xl font-semibold">
            {t('errors.boundary.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            {t('errors.boundary.description')}
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm font-medium text-muted-foreground">
                {t('errors.boundary.details')}
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded-md text-xs overflow-auto">
                {error.message}
                {error.stack && `\n\n${error.stack}`}
              </pre>
            </details>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRetry} 
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('errors.boundary.retry')}
            </Button>
            <Button 
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              {t('errors.boundary.home')}
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
    const appError = handleError(error, 'useErrorHandler');
    appLogger.error('Error caught by useErrorHandler:', { error, errorInfo, appError });
    
    // Re-throw the error to trigger the error boundary
    throw error;
  };
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}
