/**
 * CreateTenantStepIndicator — Stepper navigation bar
 *
 * Displays the 3-step progress indicator with clickable steps.
 *
 * @module tenants/presentation/components
 */
"use client";

import React from "react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Building2, UserPlus, CreditCard, Check, AlertCircle } from "lucide-react";
import { STEPS, type StepId } from "../../viewmodels/useCreateTenantViewModel";

const STEP_ICONS: Record<number, React.ElementType> = {
  1: Building2,
  2: UserPlus,
  3: CreditCard,
};

type StepState = "current" | "done" | "error" | "upcoming";

interface CreateTenantStepIndicatorProps {
  currentStep: StepId;
  isStepValid: (step: StepId) => boolean;
  goToStep: (step: StepId) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  /** Field-level errors per step, from the viewmodel. */
  stepErrors: Record<StepId, string[]>;
  /** Whether the user has actually visited/attempted a step. */
  stepTouched: Record<StepId, boolean>;
}

/**
 * The wizard's progress rail.
 *
 * It is an ordered list inside a landmark, not a row of divs: the step count,
 * the current position and each step's name are all things a screen reader has
 * to be able to reach.
 */
export function CreateTenantStepIndicator({
  currentStep,
  isStepValid,
  goToStep,
  t,
  stepErrors,
  stepTouched,
}: CreateTenantStepIndicatorProps) {
  const stepLabels: Record<number, string> = {
    1: t("tenant.stepOrganization"),
    2: t("tenant.stepAdministrator"),
    3: t("tenant.stepPlan"),
  };

  const stateOf = (id: StepId): StepState => {
    if (id === currentStep) return "current";
    // An error is only shown once the user has actually been through the step —
    // a wizard that opens with everything red teaches the user to ignore red.
    if (stepTouched[id] && stepErrors[id].length > 0) return "error";
    // The old guard was `id < 3 && isStepValid(id)`, which meant step 3 could
    // never render as complete, because currentStep never exceeds 3.
    if (id < currentStep || isStepValid(id)) return "done";
    return "upcoming";
  };

  const currentLabel = stepLabels[currentStep];
  const progressLabel = t("common.stepOfTotal", { current: currentStep, total: STEPS.length });

  return (
    <nav aria-label={t("tenant.createSteps")}>
      {/* Below sm the chip row degraded to three unlabelled icons — no step
          number, no names, no count, on the screen size where orientation
          matters most. A named counter plus a progress bar replaces it. */}
      <div className="sm:hidden">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
          {progressLabel}
        </p>
        <p className="text-sm font-semibold text-nx-ink">{currentLabel}</p>
        <div className="mt-2 h-1 w-full rounded-full bg-nx-line">
          <div
            className="h-full rounded-full bg-nx-accent-fill transition-[inline-size] duration-nx-standard ease-nx-enter motion-reduce:transition-none"
            // Logical, so the bar fills from the inline start in both directions.
            style={{ inlineSize: `${(currentStep / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* The change of step is announced, not just drawn. */}
      <p role="status" aria-live="polite" className="sr-only">
        {progressLabel} — {currentLabel}
      </p>

      <ol className="hidden items-center gap-0 sm:flex">
        {STEPS.map((step, idx) => {
          const Icon = STEP_ICONS[step.id];
          const state = stateOf(step.id);
          const isClickable = step.id <= currentStep || isStepValid((step.id - 1) as StepId);

          return (
            <React.Fragment key={step.id}>
              <li className="flex min-w-0 items-center">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => isClickable && goToStep(step.id)}
                  disabled={!isClickable}
                  aria-current={state === "current" ? "step" : undefined}
                  className={cn(
                    "group flex h-auto items-center gap-3 rounded-nx-control px-4 py-3 text-start",
                    "transition-[background-color,border-color,color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:z-raised focus-visible:shadow-nx-focus focus-visible:outline-none",
                    // A disabled button must not advertise a pointer.
                    "disabled:pointer-events-none",
                    state === "current" &&
                      "border border-nx-accent bg-nx-accent-wash hover:bg-nx-accent-wash",
                    state === "done" &&
                      "cursor-pointer border border-transparent hover:bg-nx-hover",
                    state === "error" &&
                      "cursor-pointer border border-nx-danger bg-[color:color-mix(in_srgb,var(--nx-danger)_10%,transparent)]",
                    // Upcoming reads quiet through its own tokens. The old
                    // opacity-50 dimmed the whole chip, which the design bar
                    // bans — opacity math over tokens is not a colour.
                    state === "upcoming" && "border border-transparent"
                  )}
                >
                  <span
                    className={cn(
                      "grid h-9 w-9 shrink-0 place-items-center rounded-nx-md",
                      "transition-[background-color,color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                      state === "current" && "bg-nx-accent-fill text-nx-on-fill",
                      state === "done" && "bg-success/15 text-success",
                      state === "error" && "bg-destructive/15 text-destructive",
                      state === "upcoming" && "bg-nx-raised text-nx-ink-3"
                    )}
                  >
                    {state === "done" ? (
                      <Check className="h-4 w-4" aria-hidden="true" />
                    ) : state === "error" ? (
                      <AlertCircle className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    )}
                  </span>
                  <span className="min-w-0 text-start">
                    <span
                      className={cn(
                        "block text-[11px] font-semibold uppercase tracking-wider",
                        state === "current"
                          ? "text-nx-accent"
                          : state === "error"
                            ? "text-nx-danger"
                            : "text-nx-ink-3"
                      )}
                    >
                      {t("common.step")} {step.id}
                    </span>
                    <span
                      className={cn(
                        "block truncate text-sm font-semibold",
                        state === "current"
                          ? "text-nx-ink"
                          : state === "upcoming"
                            ? "text-nx-ink-3"
                            : "text-nx-ink-2"
                      )}
                    >
                      {stepLabels[step.id]}
                    </span>
                  </span>
                </Button>
              </li>

              {idx < STEPS.length - 1 && (
                <li aria-hidden="true" className="mx-2 flex flex-1 items-center">
                  <span
                    className={cn(
                      "h-px flex-1 transition-colors duration-nx-standard ease-nx-enter motion-reduce:transition-none",
                      step.id < currentStep ? "bg-success" : "bg-nx-line"
                    )}
                  />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
