"use client";

import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";

interface CredentialsFormHeaderProps {
  t: (key: string) => string;
}

export function CredentialsFormHeader({ t }: CredentialsFormHeaderProps) {
  return (
    <div style={{ marginBottom: "var(--login-heading-margin, 24px)" }}>
      <div
        className="mb-2.5 flex items-center justify-between gap-4 text-[11px] font-medium uppercase tracking-[0.2em]"
        style={{
          color: "var(--sx-accent-text, hsl(var(--primary)))",
          fontFamily: "var(--font-mono, ui-monospace, monospace)",
        }}
      >
        <span>{t("auth.stepLabel") || "STEP 01 · IDENTIFY"}</span>
        <div className="flex shrink-0 items-center gap-1.5 normal-case tracking-normal">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </div>
      <h2
        className="m-0 text-[26px] font-semibold leading-tight"
        style={{
          letterSpacing: "-0.02em",
          color: "var(--sx-text, hsl(var(--foreground)))",
        }}
      >
        {t("auth.signInHeading")}
      </h2>
      <p
        className="mt-1.5 text-[14px] leading-relaxed"
        style={{ color: "var(--sx-text-mute, hsl(var(--muted-foreground)))" }}
      >
        {t("auth.signInSubheading")}
      </p>
    </div>
  );
}
