/**
 * CreateTenantStepIndicator — Stepper navigation bar
 *
 * Displays the 3-step progress indicator with clickable steps.
 * Extracted from CreateTenantView for architecture compliance.
 *
 * @module tenants/presentation/components
 */
"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Building2, UserPlus, CreditCard, Check } from "lucide-react";
import { STEPS, type StepId } from "../../viewmodels/useCreateTenantViewModel";

const STEP_ICONS: Record<number, React.ElementType> = {
  1: Building2,
  2: UserPlus,
  3: CreditCard,
};

interface CreateTenantStepIndicatorProps {
  currentStep: StepId;
  isStepValid: (step: StepId) => boolean;
  goToStep: (step: StepId) => void;
  t: (key: string) => string;
  isRtl: boolean;
}

export function CreateTenantStepIndicator({
  currentStep,
  isStepValid,
  goToStep,
  t,
  isRtl,
}: CreateTenantStepIndicatorProps) {
  const stepLabels: Record<number, string> = {
    1: t("tenant.stepOrganization") || "Organization",
    2: t("tenant.stepAdministrator") || "Administrator",
    3: t("tenant.stepPlan") || "Plan & Billing",
  };

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const Icon = STEP_ICONS[step.id];
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep || (step.id < 3 && isStepValid(step.id));
        const isClickable = step.id <= currentStep || isStepValid((step.id - 1) as StepId);

        return (
          <React.Fragment key={step.id}>
            <button
              onClick={() => isClickable && goToStep(step.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-300 cursor-pointer group",
                isActive && "bg-primary/10 ring-1 ring-primary/30 shadow-sm",
                !isActive && isCompleted && "hover:bg-muted/60",
                !isActive && !isCompleted && "opacity-50 cursor-not-allowed"
              )}
              disabled={!isClickable}
            >
              <div
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300",
                  isActive && "bg-primary text-primary-foreground shadow-md",
                  isCompleted && !isActive && "bg-green-500/15 text-green-600",
                  !isActive && !isCompleted && "bg-muted text-muted-foreground"
                )}
              >
                {isCompleted && !isActive ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <div className="hidden sm:block text-start">
                <p
                  className={cn(
                    "text-xs font-medium uppercase tracking-wider",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {t("common.step") || "Step"} {step.id}
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold",
                    isActive ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {stepLabels[step.id]}
                </p>
              </div>
            </button>

            {idx < STEPS.length - 1 && (
              <div className="hidden sm:flex flex-1 items-center px-2">
                <div
                  className={cn(
                    "h-px flex-1 transition-colors duration-500",
                    step.id < currentStep ? "bg-green-500/50" : "bg-border/50"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
