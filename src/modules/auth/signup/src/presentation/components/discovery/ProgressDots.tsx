"use client";

import { motion } from "framer-motion";
import { useSignupTheme } from "@core/providers/signup-theme";

// ═══════════════════════════════════════════════════════════════════════════
// ProgressDots — minimal dot indicator for the adaptive Discovery phase.
//
// Discovery is PRE-stepper (it runs before the account/review progress band),
// so this is a lightweight position cue, not a labelled progress bar. The active
// dot grows + takes the accent; completed dots stay solid-muted; upcoming dots
// are faint. Width animates so the active dot reads as a "pill". Reduced-motion
// collapses the animation to an instant state change.
//
// Pure UI — count + index come from the viewmodel.
// ═══════════════════════════════════════════════════════════════════════════

const prefersReducedMotion =
  typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

interface ProgressDotsProps {
  /** Total number of visible questions. */
  total: number;
  /** Zero-based index of the current question. */
  current: number;
  /** Accessible label for the indicator group. */
  label: string;
}

/**
 * React presentation component representing the progress dots UI element.
 */
export function ProgressDots({ total, current, label }: ProgressDotsProps) {
  const { tokens } = useSignupTheme();

  if (total <= 1) return null;

  const transition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const };

  return (
    <div
      className="flex items-center gap-2"
      role="progressbar"
      aria-label={label}
      aria-valuenow={current + 1}
      aria-valuemin={1}
      aria-valuemax={total}
    >
      {Array.from({ length: total }, (_, i) => {
        const isActive = i === current;
        const isComplete = i < current;
        return (
          <motion.span
            key={i}
            aria-hidden
            className="h-1.5 rounded-full"
            initial={false}
            animate={{
              width: isActive ? 24 : 6,
              backgroundColor: isActive
                ? tokens.accent
                : isComplete
                  ? tokens.inkFaint
                  : tokens.inkGhost,
            }}
            transition={transition}
          />
        );
      })}
    </div>
  );
}

export default ProgressDots;
