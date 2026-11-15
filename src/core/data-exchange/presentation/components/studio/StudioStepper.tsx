"use client";

import React from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
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
}: StudioStepperProps) {
  const { t } = useI18n();
  const currentStepIdx = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="border-b border-nx-line bg-nx-surface px-6 py-3 shrink-0">
      <div className="mb-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {steps.map((s, idx) => {
          const isActive = s.id === currentStep;
          const isDone = idx < currentStepIdx;
          return (
            <div
              key={s.id}
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
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <span className="h-2 w-2 rounded-full bg-current shrink-0" />
              )}
              <span className="truncate">{s.label}</span>
            </div>
          );
        })}
      </div>

      <Progress value={progressPercent} className="h-1 bg-nx-line" />

      {errorBanner && (
        <Alert variant="destructive" className="mt-3 flex items-start justify-between">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <AlertDescription className="text-xs">{errorBanner}</AlertDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismissError}
            aria-label={t("dataExchange.actions.close")}
            className="h-5 w-5 p-0 text-nx-danger hover:bg-nx-danger/20 shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      )}

      {infoBanner && (
        <Alert variant="info" className="mt-3 flex items-start justify-between">
          <div className="flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 mt-0.5" />
            <AlertDescription className="text-xs">{infoBanner}</AlertDescription>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onDismissInfo}
            aria-label={t("dataExchange.actions.close")}
            className="h-5 w-5 p-0 text-nx-ink-2 hover:bg-nx-raised shrink-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </Alert>
      )}
    </div>
  );
}
