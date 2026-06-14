"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";

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
 * Theme-aware via useSignupTheme — zero hardcoded dark rgba/hex values.
 */
export function SignupStepper({ currentStep, steps, className }: SignupStepperProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();
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
                  background: isCompleted || isActive ? tokens.gradientCta : tokens.border,
                  color: isCompleted || isActive ? tokens.accentContrast : tokens.inkFaint,
                  boxShadow: isActive ? `0 0 12px ${tokens.accent}66` : "none",
                  border: isActive ? tokens.borderActive : "none",
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
                  color: isActive ? tokens.ink : isFuture ? tokens.inkGhost : tokens.inkMuted,
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
                  background: isCompleted ? `${tokens.accent}80` : tokens.border,
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
