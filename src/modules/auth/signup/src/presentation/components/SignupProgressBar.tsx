"use client";

/**
 * SignupProgressBar
 *
 * A premium animated progress bar for the signup wizard.
 * Replaces the old step circles with a fluid gradient shimmer design.
 *
 * Features:
 *  - Smooth CSS width transition (350ms ease-out)
 *  - Animated gradient shimmer on active segment
 *  - Step label chips below (active highlights in brand violet)
 *  - Hidden during discovery (immersive full-screen Q&A)
 *  - Fully RTL-aware (direction from useI18n)
 *  - Theme-aware via useSignupTheme — zero hardcoded colors
 */

import { motion } from "framer-motion";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { SignupStep } from "../../domain/entities";

// ─── Step metadata ─────────────────────────────────────────────────────────────

interface SignupProgressBarProps {
  currentStep: SignupStep;
  /** Resolved labels from t() — one per visible step (in order) */
  stepLabels: string[];
  /** Direction from useI18n */
  direction: "ltr" | "rtl";
}

/** Steps that have a visible progress bar. Discovery is excluded (immersive). */
const WIZARD_STEPS: SignupStep[] = ["plan", "account", "verification", "workspace", "review"];

export function SignupProgressBar({ currentStep, stepLabels, direction }: SignupProgressBarProps) {
  const { tokens } = useSignupTheme();
  const currentIndex = WIZARD_STEPS.indexOf(currentStep);

  // Don't render for discovery, category, contact-sales, provisioning, complete
  if (currentIndex < 0) return null;

  const totalSteps = WIZARD_STEPS.length;
  const progressPct = Math.min(((currentIndex + 1) / totalSteps) * 100, 100);

  const labels =
    stepLabels.length >= totalSteps
      ? stepLabels.slice(0, totalSteps)
      : WIZARD_STEPS.map((_, i) => stepLabels[i] ?? `Step ${i + 1}`);

  return (
    <div
      dir={direction}
      className="w-full px-6 py-4 pb-0"
      role="progressbar"
      aria-valuenow={currentIndex + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label="Signup progress"
    >
      {/* Track */}
      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: tokens.border }}
      >
        {/* Fill */}
        <motion.div
          className="absolute inset-y-0 start-0 rounded-full"
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
          style={{
            background: tokens.gradientCta,
          }}
        />
        {/* Shimmer overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%)",
            animation: "sxShimmer 2.4s linear infinite",
          }}
        />
      </div>

      {/* Step chips */}
      <div className="mt-3 flex items-center justify-between">
        {labels.map((label, i) => {
          const done = i < currentIndex;
          const active = i === currentIndex;
          return (
            <div key={i} className="flex flex-col items-center gap-1" style={{ flex: "1 1 0" }}>
              {/* Dot */}
              <motion.div
                animate={{ scale: active ? 1.3 : done ? 1 : 0.85 }}
                transition={{ type: "spring", stiffness: 400, damping: 24 }}
                className="h-2 w-2 rounded-full"
                style={{
                  background: active ? tokens.accent : done ? tokens.success : tokens.border,
                  boxShadow: active ? `0 0 8px ${tokens.accent}80` : "none",
                }}
              />
              {/* Label */}
              <span
                className="hidden text-[9px] font-medium leading-none md:block"
                style={{
                  color: active ? tokens.accent : done ? tokens.inkMuted : tokens.inkGhost,
                }}
              >
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
