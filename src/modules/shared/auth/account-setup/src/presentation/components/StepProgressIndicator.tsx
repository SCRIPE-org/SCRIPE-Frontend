"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { KeyRound, User, ShieldCheck, Sparkles, Check } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { SetupStep } from "../viewmodels/useAccountSetupViewModel";

export interface StepProgressProps {
  currentStep: SetupStep;
  hasCustomFields: boolean;
  onStepClick?: (step: SetupStep) => void;
}

/**
 * Modern Responsive Stepper Progress Indicator for Mobile & Compact Views.
 */
export function StepProgressIndicator({
  currentStep,
  hasCustomFields,
  onStepClick,
}: StepProgressProps) {
  const { t } = useI18n();

  const steps = [
    { id: 1 as SetupStep, title: t("auth.accountSetup.step1Security") || "Security", icon: KeyRound },
    { id: 2 as SetupStep, title: t("auth.accountSetup.step2Profile") || "Profile", icon: User },
    ...(hasCustomFields
      ? [{ id: 3 as SetupStep, title: t("auth.accountSetup.step3Attributes") || "Attributes", icon: ShieldCheck }]
      : []),
    { id: 4 as SetupStep, title: t("auth.accountSetup.step4Celebration") || "Ready", icon: Sparkles },
  ];

  const currentStepObj = steps.find((s) => s.id === currentStep) ?? steps[0];

  return (
    <nav aria-label="Setup progress" className="w-full">
      {/* Mobile view (< sm): Step counter and clean progress bar */}
      <div className="sm:hidden space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("common.stepOfTotal", { current: currentStep, total: steps.length }) || `Step ${currentStep} of ${steps.length}`}
          </span>
          <span className="font-semibold text-foreground">{currentStepObj.title}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={Math.round((currentStep / steps.length) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Account setup progress"
          className="h-1.5 w-full rounded-full bg-muted overflow-hidden"
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Desktop / Tablet view (>= sm): Full stepper with icons and titles */}
      <ol className="hidden sm:flex items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const isDone = currentStep > step.id || currentStep === 4;
          const isCurrent = currentStep === step.id;
          const Icon = step.icon;

          return (
            <React.Fragment key={step.id}>
              <li className="flex flex-1 items-center">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => onStepClick?.(step.id)}
                  disabled={step.id > currentStep}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={`Step ${step.id}: ${step.title}`}
                  className={cn(
                    "group h-auto p-1.5 flex w-full flex-col items-center gap-1.5 text-center transition-colors hover:bg-transparent rounded-lg focus-visible:ring-2 focus-visible:ring-primary",
                    step.id > currentStep ? "cursor-not-allowed opacity-40" : "cursor-pointer"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition-all shadow-xs",
                      isDone && !isCurrent
                        ? "border-primary bg-primary text-primary-foreground"
                        : isCurrent
                        ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                        : "border-border bg-muted/30 text-muted-foreground"
                    )}
                  >
                    {isDone && !isCurrent ? (
                      <Check className="h-4 w-4 stroke-[2.5]" />
                    ) : (
                      <Icon className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs transition-colors",
                      isCurrent
                        ? "font-semibold text-foreground"
                        : isDone
                        ? "font-medium text-muted-foreground"
                        : "text-muted-foreground/60"
                    )}
                  >
                    {step.title}
                  </span>
                </Button>
              </li>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 transition-colors rounded-full mb-5",
                    currentStep > steps[idx + 1].id || (currentStep > step.id && currentStep !== 1)
                      ? "bg-primary"
                      : "bg-border/60"
                  )}
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
