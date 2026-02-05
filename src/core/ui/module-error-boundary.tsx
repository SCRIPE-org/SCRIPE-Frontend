"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { appLogger } from "../common/logger";

interface ModuleErrorBoundaryProps {
      children: ReactNode;
      moduleName?: string;
      fallback?: ReactNode;
      onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ModuleErrorBoundaryState {
      hasError: boolean;
      error: Error | null;
}

/**
 * ModuleErrorBoundary
 * 
 * A granular error boundary for individual modules.
 * Prevents a single module's error from crashing the entire app.
 * 
 * @example
 * <ModuleErrorBoundary moduleName="Products">
 *   <ProductView />
 * </ModuleErrorBoundary>
 */
export class ModuleErrorBoundary extends Component<
      ModuleErrorBoundaryProps,
      ModuleErrorBoundaryState
> {
      constructor(props: ModuleErrorBoundaryProps) {
            super(props);
            this.state = { hasError: false, error: null };
      }

      static getDerivedStateFromError(error: Error): ModuleErrorBoundaryState {
            return { hasError: true, error };
      }

      componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
            // Log to console in development
            appLogger.error(`[${this.props.moduleName || "Module"}] Error:`, error);
            appLogger.error("Error Info:", errorInfo);

            // Call optional error handler (e.g., for Sentry)
            this.props.onError?.(error, errorInfo);
      }

      handleRetry = (): void => {
            this.setState({ hasError: false, error: null });
      };

      handleGoHome = (): void => {
            window.location.href = "/";
      };

      render(): ReactNode {
            if (this.state.hasError) {
                  // Custom fallback if provided
                  if (this.props.fallback) {
                        return this.props.fallback;
                  }

                  // Default error UI
                  return (
                        <div className="flex items-center justify-center min-h-[400px] p-4">
                              <Card className="w-full max-w-md">
                                    <CardHeader className="text-center">
                                          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                                                <AlertTriangle className="w-6 h-6 text-destructive" />
                                          </div>
                                          <CardTitle className="text-lg">
                                                {this.props.moduleName
                                                      ? `${this.props.moduleName} Error`
                                                      : "Something went wrong"}
                                          </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                          <p className="text-sm text-muted-foreground text-center">
                                                An error occurred while loading this section.
                                                {process.env.NODE_ENV === "development" && this.state.error && (
                                                      <span className="block mt-2 font-mono text-xs text-destructive">
                                                            {this.state.error.message}
                                                      </span>
                                                )}
                                          </p>
                                          <div className="flex gap-2 justify-center">
                                                <Button
                                                      variant="outline"
                                                      size="sm"
                                                      onClick={this.handleRetry}
                                                      className="gap-2"
                                                >
                                                      <RefreshCw className="w-4 h-4" />
                                                      Retry
                                                </Button>
                                                <Button
                                                      variant="default"
                                                      size="sm"
                                                      onClick={this.handleGoHome}
                                                      className="gap-2"
                                                >
                                                      <Home className="w-4 h-4" />
                                                      Go Home
                                                </Button>
                                          </div>
                                    </CardContent>
                              </Card>
                        </div>
                  );
            }

            return this.props.children;
      }
}

/**
 * withModuleErrorBoundary HOC
 * 
 * Wraps a component with ModuleErrorBoundary.
 * 
 * @example
 * export default withModuleErrorBoundary(ProductView, "Products");
 */
export function withModuleErrorBoundary<P extends object>(
      WrappedComponent: React.ComponentType<P>,
      moduleName: string
): React.FC<P> {
      const WithErrorBoundary: React.FC<P> = (props) => (
            <ModuleErrorBoundary moduleName={moduleName}>
                  <WrappedComponent {...props} />
            </ModuleErrorBoundary>
      );

      WithErrorBoundary.displayName = `WithModuleErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || "Component"
            })`;

      return WithErrorBoundary;
}
