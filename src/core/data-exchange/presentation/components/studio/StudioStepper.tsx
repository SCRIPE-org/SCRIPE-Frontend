"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, RotateCcw, X } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { StudioStep } from "../../viewmodels/useDataExchangeStudioViewModel";

export interface StudioStepperProps {
  steps: { id: StudioStep; label: string }[];
  currentStep: StudioStep;
  progressPercent: number;
  errorBanner: string | null;
  infoBanner: string | null;
  onDismissError: () => void;
  onDismissInfo: () => void;
  onRetryError?: () => void;
}

/**
 * Visual stepper navigation and dismissible feedback banners for Data Exchange Studio.
 */
export function StudioStepper({
  steps,
  currentStep,
  progressPercent,
  errorBanner,
  infoBanner,
  onDismissError,
  onDismissInfo,
  onRetryError,
}: StudioStepperProps) {
  const { t } = useI18n();
  const currentStepIdx = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="border-b border-nx-line bg-nx-surface px-4 py-3 sm:px-6 shrink-0">
      <nav aria-label={t("dataExchange.steps.navLabel")}>
        <ol className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {steps.map((s, idx) => {
            const isActive = s.id === currentStep;
            const isDone = idx < currentStepIdx;
            const statusSr = isDone
              ? t("dataExchange.steps.completedSr")
              : isActive
                ? t("dataExchange.steps.currentSr")
                : t("dataExchange.steps.pendingSr");
            return (
              <li
                key={s.id}
                aria-current={isActive ? "step" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-nx-control border px-3 py-1.5 text-xs font-medium transition-colors",
                  isActive
                    ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
                    : isDone
                      ? "border-success/30 bg-success/10 text-success"
                      : "border-nx-line bg-nx-raised text-nx-ink-3"
                )}
              >
                {isDone ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <span className="h-2 w-2 rounded-full bg-current shrink-0" aria-hidden="true" />
                )}
                <span className="truncate">{s.label}</span>
                <span className="sr-only"> — {statusSr}</span>
              </li>
            );
          })}
        </ol>
      </nav>

      <Progress
        value={progressPercent}
        aria-label={t("dataExchange.steps.progressLabel")}
        className="h-1 bg-nx-line"
      />

      {errorBanner && (
        <Alert variant="destructive" className="mt-3 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <AlertDescription className="text-xs break-words">{errorBanner}</AlertDescription>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onRetryError && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onRetryError}
                className="h-6 px-2 text-[11px] border-destructive/35 text-nx-danger hover:bg-destructive/15"
              >
                <RotateCcw className="me-1 h-3 w-3" aria-hidden="true" />
                <span>{t("dataExchange.actions.retry")}</span>
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDismissError}
              aria-label={t("dataExchange.actions.dismissError")}
              className="h-6 w-6 p-0 text-nx-danger hover:bg-destructive/15 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </Alert>
      )}

      {infoBanner && (
        <Alert variant="info" className="mt-3 flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 min-w-0">
            <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
            <AlertDescription className="text-xs break-words">{infoBanner}</AlertDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismissInfo}
            aria-label={t("dataExchange.actions.dismissNotice")}
            className="h-6 w-6 p-0 text-nx-ink-2 hover:bg-nx-raised shrink-0"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </Alert>
      )}
    </div>
  );
}
