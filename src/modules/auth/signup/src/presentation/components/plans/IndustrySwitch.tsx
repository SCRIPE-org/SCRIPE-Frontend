"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useSignupTheme } from "@core/providers/signup-theme";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";

// ═══════════════════════════════════════════════════════════════════════════
// IndustrySwitch — "Plans for [ Healthcare ▾ ]".
//
// A brand-compliant Select dropdown. Replaces the native select with SCRIPE's
// standard design system Select component, ensuring theme compliance.
//
// RTL: the select component handles layout direction automatically.
// Pure UI — the active slug + options + handler come from the viewmodel.
// ═══════════════════════════════════════════════════════════════════════════

interface IndustrySwitchProps {
  value: string | null;
  options: { slug: string; label: string }[];
  onChange: (slug: string) => void;
  hasAnswers?: boolean;
}

/**
 * React presentation component representing the industry switch UI element.
 */
export function IndustrySwitch({
  value,
  options,
  onChange,
  hasAnswers = false,
}: IndustrySwitchProps) {
  const { t } = useI18n();
  const { tokens, theme } = useSignupTheme();

  // If onboarding questions were answered, we show a static recommended category
  // instead of letting the user switch.
  if (hasAnswers) {
    const activeOpt = options.find((opt) => opt.slug === value);
    const displayName = activeOpt?.label ?? value;
    if (!displayName) return null;
    return (
      <p className="text-[0.9375rem]" style={{ color: tokens.inkMuted }}>
        {t("signup.plans.industry.prefix")}{" "}
        <span className="font-semibold" style={{ color: tokens.ink }}>
          {displayName}
        </span>
      </p>
    );
  }

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
    <div
      className="inline-flex items-center gap-2.5 text-[0.9375rem]"
      style={{ color: tokens.inkMuted }}
    >
      <span>{t("signup.plans.industry.prefix")}</span>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger
          className="h-9 w-[160px] rounded-lg border text-[0.9375rem] font-semibold focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{
            background: theme === "dark" ? "#140c2e" : "#ffffff", // Enforce fully opaque solid background
            borderColor: tokens.border,
            color: tokens.ink,
          }}
        >
          <SelectValue placeholder={t("signup.plans.industry.ariaLabel")} />
        </SelectTrigger>
        <SelectContent
          style={{
            background: theme === "dark" ? "#100826" : "#ffffff", // Enforce fully opaque solid background
            borderColor: tokens.border,
            color: tokens.ink,
          }}
        >
          {options.map((opt) => (
            <SelectItem key={opt.slug} value={opt.slug} className="cursor-pointer text-[0.9375rem]">
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
