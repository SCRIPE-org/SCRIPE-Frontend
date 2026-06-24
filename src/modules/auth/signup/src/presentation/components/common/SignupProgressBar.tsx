"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import type { SignupPhase } from "../../viewmodels/useSignupWizard";

// ═══════════════════════════════════════════════════════════════════════════
// SignupProgressBar — the stepper rendered in SignupShell's progressSlot for the
// Elevate product-task phases (Plan · Account · Verify · Workspace · Review).
//
// Product-register calm: a thin connector track with discrete nodes, the current
// node in the committed accent, completed nodes filled with a check, upcoming
// nodes muted. NO purple glow, NO gradient text. Labels are localized and read
// under each node on >= sm; on mobile only the active label shows to stay dense.
//
// RTL-aware: the row + connector mirror via `dir`; the fill grows from the
// leading edge in both directions (logical inset-inline-start). Reduced-motion
// safe — width/scale transitions collapse to instant.
// ═══════════════════════════════════════════════════════════════════════════

/** Phases that show the stepper, in canonical display order. */
const STEPPER_PHASES = [
  "plan",
  "account",
  "verification",
  "workspace",
  "review",
] as const satisfies readonly SignupPhase[];

type StepperPhase = (typeof STEPPER_PHASES)[number];

/** i18n key per phase (under `signup.steps.*`). */
const PHASE_LABEL_KEY: Record<StepperPhase, string> = {
  plan: "signup.steps.plan",
  account: "signup.steps.account",
  verification: "signup.steps.verify",
  workspace: "signup.steps.workspace",
  review: "signup.steps.review",
};

interface SignupProgressBarProps {
  /** Current wizard phase. Phases outside the stepper render nothing. */
  phase: SignupPhase;
}

/**
 * React presentation component representing the signup progress bar UI element.
 */
export function SignupProgressBar({ phase }: SignupProgressBarProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();

  const currentIndex = (STEPPER_PHASES as readonly SignupPhase[]).indexOf(phase);

  const labels = useMemo(() => STEPPER_PHASES.map((p) => t(PHASE_LABEL_KEY[p])), [t]);

  // Phases without a stepper node (welcome / discovery / contact-sales /
  // provisioning / complete) render nothing — the band collapses in the shell.
  if (currentIndex < 0) return null;

  const total = STEPPER_PHASES.length;
  // Progress fill spans node centers: 0% at the first node, 100% at the last.
  const fillPct = total > 1 ? (currentIndex / (total - 1)) * 100 : 0;

  return (
    <div
      dir={direction}
      className="mx-auto w-full max-w-2xl px-5 py-3.5 sm:px-8"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={currentIndex + 1}
      aria-valuetext={labels[currentIndex]}
      aria-label={t("signup.stepper.label")}
    >
      <div className="relative">
        {/* Connector track — sits behind the nodes, centered on the node row. */}
        <div
          aria-hidden
          className="absolute end-0 start-0 top-[0.5625rem] h-0.5 rounded-full"
          style={{ background: tokens.border }}
        >
          {/* Fill — grows from the leading edge; mirrored automatically by dir. */}
          <div
            className="h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${fillPct}%`, background: tokens.accent }}
          />
        </div>

        {/* Nodes + labels */}
        <ol className="relative flex items-start justify-between">
          {STEPPER_PHASES.map((p, i) => {
            const done = i < currentIndex;
            const active = i === currentIndex;
            return (
              <li key={p} className="flex min-w-0 flex-col items-center gap-1.5">
                <span
                  aria-hidden
                  className="flex h-[1.125rem] w-[1.125rem] items-center justify-center rounded-full transition-transform duration-200 ease-out motion-reduce:transition-none"
                  style={{
                    background: done || active ? tokens.accent : tokens.surfaceRaised,
                    border: done || active ? `1px solid ${tokens.accent}` : tokens.borderCard,
                    transform: active ? "scale(1.12)" : "scale(1)",
                  }}
                >
                  {done ? (
                    <Check
                      className="h-2.5 w-2.5"
                      strokeWidth={3}
                      style={{ color: tokens.accentContrast }}
                    />
                  ) : (
                    <span
                      className="h-1.5 w-1.5 rounded-full"
                      style={{
                        background: active ? tokens.accentContrast : tokens.inkGhost,
                      }}
                    />
                  )}
                </span>
                <span
                  className={`truncate text-[0.6875rem] font-medium leading-none ${
                    active ? "block" : "hidden sm:block"
                  }`}
                  style={{
                    color: active ? tokens.accent : done ? tokens.inkMuted : tokens.inkFaint,
                  }}
                >
                  {labels[i]}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export default SignupProgressBar;
