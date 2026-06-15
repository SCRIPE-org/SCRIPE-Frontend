"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";

// ═══════════════════════════════════════════════════════════════════════════
// PasswordStrengthMeter — calm 5-segment strength indicator for the account
// phase (F5). Product-register: a fixed five-segment bar (no animated shimmer),
// a single semantic color per bucket, and a short label. Announced politely to
// assistive tech via role=status. Reduced-motion safe.
//
// Dumb UI: the score (0–5) is computed in the viewmodel (calcPasswordStrengthScore)
// and passed in — this component only renders.
// ═══════════════════════════════════════════════════════════════════════════

const SEGMENTS = 5;

interface PasswordStrengthMeterProps {
  /** Strength bucket 0–5 from the viewmodel. */
  score: number;
  /** Links the meter to the password field for screen readers. */
  id?: string;
}

export function PasswordStrengthMeter({ score, id }: PasswordStrengthMeterProps) {
  const { t } = useI18n();
  const { tokens } = useSignupTheme();

  const labels = [
    t("signup.account.passwordStrength.veryWeak"),
    t("signup.account.passwordStrength.weak"),
    t("signup.account.passwordStrength.fair"),
    t("signup.account.passwordStrength.good"),
    t("signup.account.passwordStrength.strong"),
  ];

  // Map the 0–5 score onto one of five buckets (1–5) → a semantic color.
  const bucket = Math.max(0, Math.min(score, SEGMENTS));
  const colorFor = (b: number): string => {
    if (b <= 1) return tokens.error;
    if (b === 2) return "#f59e0b"; // amber — semantic "caution" only
    if (b === 3) return "#eab308";
    return tokens.success;
  };
  const activeColor = colorFor(bucket);
  const label = bucket > 0 ? labels[Math.min(bucket, SEGMENTS) - 1] : "";

  return (
    <div id={id} role="status" aria-live="polite" aria-atomic="true" className="space-y-1.5">
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: SEGMENTS }, (_, i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-colors duration-200 ease-out motion-reduce:transition-none"
            style={{ background: i < bucket ? activeColor : tokens.border }}
          />
        ))}
      </div>
      {label && (
        <p className="text-[0.6875rem] font-medium leading-none" style={{ color: activeColor }}>
          {label}
        </p>
      )}
    </div>
  );
}

export default PasswordStrengthMeter;
