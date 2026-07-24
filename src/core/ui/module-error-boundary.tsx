"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@core/ui/button";
import { ErrorMessage } from "@core/ui/error-message";
import { Home } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { appLogger } from "../common/logger";

interface ModuleErrorBoundaryProps {
  children: ReactNode;
  /**
   * Translation key naming the guarded section, e.g. "identity.admins".
   * A key rather than a display string: the fallback resolves it through t(),
   * so the crash screen speaks the reader's language. An unregistered key
   * resolves to itself, which is why legacy display-string call sites still
   * render something sensible.
   */
  moduleName?: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ModuleErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ModuleErrorFallbackProps {
  moduleName?: string;
  error?: Error | null;
  onRetry: () => void;
}

/**
 * The rendered crash screen, split out of the class on purpose: a class
 * component cannot call useI18n, which is why every boundary in this app used
 * to announce itself in untranslated English regardless of the active language.
 */
export function ModuleErrorFallback({ moduleName, error, onRetry }: ModuleErrorFallbackProps) {
  const { t } = useI18n();
  const moduleLabel = moduleName ? t(moduleName) : t("errors.module.unnamed");

  const handleGoHome = (): void => {
    // A full document load, not a router push — the tree we are escaping is
    // the one that just threw, and a soft navigation would keep it mounted.
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
      <ErrorMessage
        message={t("errors.module.description", { module: moduleLabel })}
        onRetry={onRetry}
      />

      {process.env.NODE_ENV === "development" && error && (
        <details className="mt-2 w-full max-w-md">
          <summary className="cursor-pointer rounded-nx-sm text-sm font-medium text-nx-ink-2 focus-visible:outline-none focus-visible:shadow-nx-focus">
            {t("errors.boundary.details")}
          </summary>
          <pre className="mt-2 overflow-auto rounded-nx-sm bg-nx-raised p-3 text-xs text-nx-ink-2">
            {error.message}
          </pre>
        </details>
      )}

      <Button variant="ghost" size="sm" onClick={handleGoHome} className="mt-3">
        <Home className="me-2 h-4 w-4" aria-hidden="true" />
        {t("errors.boundary.home")}
      </Button>
    </div>
  );
}

/**
 * ModuleErrorBoundary
 *
 * A granular error boundary for individual modules.
 * Prevents a single module's error from crashing the entire app.
 *
 * @example
 * <ModuleErrorBoundary moduleName="identity.admins">
 *   <AdminsView />
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

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ModuleErrorFallback
          moduleName={this.props.moduleName}
          error={this.state.error}
          onRetry={this.handleRetry}
        />
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
 * export default withModuleErrorBoundary(AdminsView, "identity.admins");
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

  WithErrorBoundary.displayName = `WithModuleErrorBoundary(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithErrorBoundary;
}
