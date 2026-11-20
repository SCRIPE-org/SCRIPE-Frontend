"use client";

import React from "react";
import { Activity, AlertTriangle, Building2, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { useI18n } from "@core/providers/i18n-provider";

export interface JobsErrorBannerProps {
  message: string;
  onRetry: () => void;
}

/**
 * Dismissible/recoverable inline error banner displayed above Jobs telemetry on fetch failure.
 */
export function JobsErrorBanner({
  message,
  onRetry,
}: JobsErrorBannerProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <Alert variant="destructive" data-testid="jobs-error-banner">
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
      <AlertTitle>{t("adminDataTransferJobs.error.title")}</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span>{message}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRetry}
          data-testid="jobs-error-retry-btn"
        >
          <RefreshCw className="h-3.5 w-3.5 me-1" aria-hidden="true" />
          {t("common.retry")}
        </Button>
      </AlertDescription>
    </Alert>
  );
}

export interface JobsEmptyStateProps {
  isTenantRequired: boolean;
  errorMessage: string | null;
  hasActiveFilters: boolean;
  onRetry: () => void;
  onResetFilters: () => void;
}

/**
 * Distinguishes tenant-required, API error recovery, active-filter, and initial empty states.
 */
export function JobsEmptyState({
  isTenantRequired,
  errorMessage,
  hasActiveFilters,
  onRetry,
  onResetFilters,
}: JobsEmptyStateProps): React.ReactElement {
  const { t } = useI18n();

  if (isTenantRequired) {
    return (
      <EmptyState
        bare
        icon={Building2}
        title={t("adminDataTransferJobs.tenantRequired.title")}
        description={t("adminDataTransferJobs.tenantRequired.switchHint")}
      />
    );
  }

  if (errorMessage) {
    return (
      <div data-testid="jobs-error-empty-state">
        <EmptyState
          bare
          variant="error"
          icon={AlertTriangle}
          title={t("adminDataTransferJobs.error.title")}
          description={errorMessage}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRetry}
              data-testid="jobs-empty-retry-btn"
            >
              <RefreshCw className="h-3.5 w-3.5 me-1" aria-hidden="true" />
              {t("common.retry")}
            </Button>
          }
        />
      </div>
    );
  }

  if (hasActiveFilters) {
    return (
      <div data-testid="jobs-filtered-empty-state">
        <EmptyState
          bare
          variant="filtered"
          icon={Activity}
          title={t("adminDataTransferJobs.empty.title")}
          description={t("adminDataTransferJobs.empty.description")}
          action={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilters}
              data-testid="jobs-empty-reset-btn"
            >
              {t("common.reset")}
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div data-testid="jobs-unfiltered-empty-state">
      <EmptyState
        bare
        variant="empty"
        icon={Activity}
        title={t("adminDataTransferJobs.empty.unfilteredTitle")}
        description={t("adminDataTransferJobs.empty.unfilteredDescription")}
      />
    </div>
  );
}
