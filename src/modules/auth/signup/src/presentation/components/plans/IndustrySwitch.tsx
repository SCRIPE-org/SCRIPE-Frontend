"use client";

import { useId } from "react";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";

// ═══════════════════════════════════════════════════════════════════════════
// IndustrySwitch — "Plans for [ Healthcare ▾ ]".
//
// A NATIVE <select> styled to brand. Using the native element is deliberate:
// the OS renders the option list in its own layer, so it can NEVER be clipped
// by an ancestor's overflow — the exact failure a custom popover risks. This
// replaces the old tab row entirely (no tabs, no "All").
//
// RTL: the chevron is logically positioned (end-3) and text aligns to start.
// Pure UI — the active slug + options + handler come from the viewmodel.
// ═══════════════════════════════════════════════════════════════════════════

interface IndustrySwitchProps {
  value: string | null;
  options: { slug: string; label: string }[];
  onChange: (slug: string) => void;
}

export function IndustrySwitch({ value, options, onChange }: IndustrySwitchProps) {
  const { t, direction } = useI18n();
  const { tokens } = useSignupTheme();
  const selectId = useId();

  // With a single (or no) industry there is nothing to switch — render a quiet
  // static label instead of a dead control.
  if (options.length <= 1) {
    const only = options[0]?.label;
    if (!only) return null;
    return (
      <p className="text-[0.9375rem]" style={{ color: tokens.inkMuted }}>
        {t("signup.plans.industry.prefix")}{" "}
        <span className="font-semibold" style={{ color: tokens.ink }}>
          {only}
        </span>
      </p>
    );
  }

  return (
    <label htmlFor={selectId} className="inline-flex items-center gap-2 text-[0.9375rem]" style={{ color: tokens.inkMuted }}>
      <span>{t("signup.plans.industry.prefix")}</span>
      <span
        className="relative inline-flex items-center rounded-lg"
        style={{ background: tokens.surfaceRaised, border: tokens.borderCard }}
      >
        <select
          id={selectId}
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          dir={direction}
          aria-label={t("signup.plans.industry.ariaLabel")}
          className="cursor-pointer appearance-none rounded-lg bg-transparent py-2 pe-9 ps-3.5 text-[0.9375rem] font-semibold focus-visible:outline-none focus-visible:ring-2"
          style={{
            color: tokens.ink,
            // @ts-expect-error — CSS custom prop for Tailwind ring color.
            "--tw-ring-color": tokens.accent,
          }}
        >
          {options.map((opt) => (
            <option key={opt.slug} value={opt.slug} style={{ color: "#111", background: "#fff" }}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          aria-hidden
          className="pointer-events-none absolute end-2.5"
          style={{ color: tokens.inkFaint }}
        />
      </span>
    </label>
  );
}
