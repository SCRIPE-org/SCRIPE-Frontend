// UI-EXCEPTION: compact studio layout
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";

// ═══════════════════════════════════════════════════════════════════════════
// BillingCycleToggle — Monthly ⇄ Annual segmented control.
//
// A 1D control → flex. The active segment carries the accent surface; the
// "Save N%" chip rides on the Annual segment. aria-pressed announces state.
// No glow; transition is a 200ms colour fade with a reduced-motion fallback
// (colour transitions are inert under reduced-motion).
// ═══════════════════════════════════════════════════════════════════════════

interface BillingCycleToggleProps {
  value: "monthly" | "annual";
  onChange: (cycle: "monthly" | "annual") => void;
  /** Annual savings %, 0 hides the chip. */
  savingsPercent: number;
}

export function BillingCycleToggle({ value, onChange, savingsPercent }: BillingCycleToggleProps) {
  const { t } = useI18n();
  const { tokens } = useSignupTheme();

  const cycles: ("monthly" | "annual")[] = ["monthly", "annual"];

  return (
    <div
      role="group"
      aria-label={t("signup.plans.billing.label")}
      className="inline-flex items-center rounded-full p-1"
      style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
    >
      {cycles.map((cycle) => {
        const active = value === cycle;
        return (
          <button
            key={cycle}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(cycle)}
            className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-[0.8125rem] font-semibold transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2"
            style={{
              background: active ? `${tokens.accent}1f` : "transparent",
              color: active ? tokens.accent : tokens.inkFaint,
              border: active ? tokens.borderActive : "1px solid transparent",
              // @ts-expect-error — CSS custom prop for Tailwind ring color.
              "--tw-ring-color": tokens.accent,
            }}
          >
            {cycle === "monthly"
              ? t("signup.plans.billing.monthly")
              : t("signup.plans.billing.annual")}
            {cycle === "annual" && savingsPercent > 0 && (
              <span
                className="rounded-full px-1.5 py-0.5 text-[0.625rem] font-bold"
                style={{ background: `${tokens.cyan}26`, color: tokens.cyan }}
              >
                {t("signup.plans.billing.save", { percent: savingsPercent })}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
