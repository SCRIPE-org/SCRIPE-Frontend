"use client";

import { useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";

interface PasswordStrengthMeterProps {
  password: string;
  strength: number; // 0-5
}

const STRENGTH_COLORS = [
  "rgba(255,255,255,0.08)", // 0: empty
  "#EF4444",                // 1: very weak (red)
  "#F97316",                // 2: weak (orange)
  "#EAB308",                // 3: fair (yellow)
  "#22C55E",                // 4: strong (green)
  "#10B981",                // 5: very strong (emerald)
];

/**
 * PasswordStrengthMeter — Visual strength indicator
 * 
 * Per security-policy.md:
 * - Min 12 chars (hard floor 8)
 * - Length-first policy (no forced composition)
 * - Shows strength bar + label
 */
export function PasswordStrengthMeter({ password, strength }: PasswordStrengthMeterProps) {
  const { t } = useI18n();

  const strengthLabel = useMemo(() => {
    if (!password) return "";
    const labels = [
      "",
      t("signup.password.veryWeak") || "Very weak",
      t("signup.password.weak") || "Weak",
      t("signup.password.fair") || "Fair",
      t("signup.password.strong") || "Strong",
      t("signup.password.veryStrong") || "Very strong",
    ];
    return labels[strength] || "";
  }, [password, strength, t]);

  if (!password) return null;

  const color = STRENGTH_COLORS[strength] || STRENGTH_COLORS[0];
  const percentage = (strength / 5) * 100;

  return (
    <div className="mt-2 space-y-1.5" aria-live="polite" aria-label={strengthLabel}>
      {/* Bar */}
      <div
        className="h-1 w-full overflow-hidden rounded-full"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percentage}%`,
            background: color,
          }}
        />
      </div>

      {/* Label */}
      <p
        className="text-[11px] font-medium transition-colors duration-200"
        style={{ color }}
      >
        {strengthLabel}
      </p>
    </div>
  );
}
