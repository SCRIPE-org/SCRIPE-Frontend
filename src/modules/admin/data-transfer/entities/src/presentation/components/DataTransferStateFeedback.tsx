"use client";

import React from "react";
import { AlertTriangle, Building2, Layers, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";

/** Props for the non-destructive inline DataTransferErrorBanner component. */
export interface DataTransferErrorBannerProps {
  title: string;
  message: string;
  onRetry: () => void;
  testIdPrefix?: string;
}

/**
 * Non-destructive inline error banner keeping header, KPIs, and filters mounted on fetch failure.
 */
export function DataTransferErrorBanner({
  title,
  message,
  onRetry,
  testIdPrefix = "dx",
}: DataTransferErrorBannerProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <Alert variant="destructive" data-testid={`${testIdPrefix}-error-banner`}>
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span>{message}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          data-testid={`${testIdPrefix}-error-retry-btn`}
        >
          <RefreshCw className="h-3.5 w-3.5 me-1" aria-hidden="true" />
          {t("common.retry")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

/** Props for DataTransferEmptyState component. */
export interface DataTransferEmptyStateProps {
  isTenantRequired: boolean;
  errorMessage: string | null;
  hasActiveFilters: boolean;
  tenantTitle: string;
  tenantDescription: string;
  errorTitle: string;
  filteredTitle: string;
  filteredDescription: string;
  unfilteredTitle: string;
  unfilteredDescription: string;
  onRetry: () => void;
  onResetFilters?: () => void;
  testIdPrefix?: string;
}

/**
 * Unified empty state distinguishing tenant-required, error recovery, filtered, and unfiltered states.
 */
export function DataTransferEmptyState({
  isTenantRequired,
  errorMessage,
  hasActiveFilters,
  tenantTitle,
  tenantDescription,
  errorTitle,
  filteredTitle,
  filteredDescription,
  unfilteredTitle,
  unfilteredDescription,
  onRetry,
  onResetFilters,
  testIdPrefix = "dx",
}: DataTransferEmptyStateProps): React.ReactElement {
  const { t } = useI18n();

  if (isTenantRequired) {
    return (
      <EmptyState
        bare
        icon={Building2}
        title={tenantTitle}
        description={tenantDescription}
      />
    );
  }

  if (errorMessage) {
    return (
      <div data-testid={`${testIdPrefix}-error-empty-state`}>
        <EmptyState
          bare
          variant="error"
          icon={AlertTriangle}
          title={errorTitle}
          description={errorMessage}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              data-testid={`${testIdPrefix}-empty-retry-btn`}
            >
              <RefreshCw className="h-3.5 w-3.5 me-1" aria-hidden="true" />
              {t("common.retry")}
            </Button>
          }
        />
      </div>
    );
  }

  if (hasActiveFilters && onResetFilters) {
    return (
      <div data-testid={`${testIdPrefix}-filtered-empty-state`}>
        <EmptyState
          bare
          variant="filtered"
          icon={Layers}
          title={filteredTitle}
          description={filteredDescription}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              data-testid={`${testIdPrefix}-empty-reset-btn`}
            >
              {t("common.reset")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div data-testid={`${testIdPrefix}-unfiltered-empty-state`}>
      <EmptyState
        bare
        icon={Layers}
        title={unfilteredTitle}
        description={unfilteredDescription}
      />
    </div>
  );
}
