"use client";

import { useI18n } from "@core/providers/i18n-provider";

interface SignupStepperProps {
  currentStep: string;
  steps: { key: string; label: string }[];
  className?: string;
}

/**
 * SignupStepper — Progress indicator for the signup wizard
 *
 * Per motion.md: active step fills with brand gradient.
 * Per responsive.md: labels collapse to numbers on xs.
 * Per design.md: brand violet gradient, token colors only.
 */
export function SignupStepper({ currentStep, steps, className }: SignupStepperProps) {
  const { t, direction } = useI18n();
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div
      className={className ?? "mb-6 flex items-center justify-center gap-1 sm:gap-2"}
      dir={direction}
      role="navigation"
      aria-label={t("signup.stepper.label") || "Signup progress"}
    >
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;
        const isFuture = i > currentIndex;

        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300"
                style={{
                  background:
                    isCompleted || isActive
                      ? "linear-gradient(180deg, #A855F7 0%, #7C3AED 100%)"
                      : "rgba(255,255,255,0.06)",
                  color: isCompleted || isActive ? "#fff" : "rgba(245,242,255,0.4)",
                  boxShadow: isActive ? "0 0 12px rgba(168,85,247,0.4)" : "none",
                }}
                aria-current={isActive ? "step" : undefined}
              >
                {isCompleted ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 6L5 9L10 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  i + 1
                )}
              </div>
              {/* Label — hidden on xs, visible on sm+ */}
              <span
                className="hidden text-[10px] font-medium sm:block"
                style={{
                  color: isActive
                    ? "rgba(245,242,255,0.9)"
                    : isFuture
                      ? "rgba(245,242,255,0.3)"
                      : "rgba(245,242,255,0.6)",
                }}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {i < steps.length - 1 && (
              <div
                className="h-px w-5 transition-all duration-300 sm:w-8"
                style={{
                  background: isCompleted ? "rgba(168,85,247,0.5)" : "rgba(255,255,255,0.08)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
