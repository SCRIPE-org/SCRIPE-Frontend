"use client";

import { LanguageSwitcher } from "@core/ui/layout/common/language-switcher";
import { ThemeSwitcher } from "@core/ui/layout/common/theme-switcher";
import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, SPLIT_WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the dual panel layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function DualPanelLayout({
  branding,
  slotConfig,
  formContent,
  footerSlot,
  logoSrc,
  logoAlt,
  companyName,
  direction,
  t,
}: LoginLayoutProps) {
  return (
    <div
      className={`flex min-h-[100dvh] w-full flex-col ${BG_STYLE} login-page`}
      dir={direction}
      style={SPLIT_WRAPPER_STYLE}
    >
      {/* Top header bar */}
      <header
        className="flex items-center justify-between border-b border-nx-line px-8 py-4"
        style={{ backgroundColor: "var(--login-surface, var(--nx-surface))" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-nx-line bg-nx-surface">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <span className="text-sm font-semibold text-[var(--login-text,var(--nx-ink))]">
            {companyName}
          </span>
        </div>
        <div className="flex gap-1">
          <LanguageSwitcher />
          <ThemeSwitcher />
        </div>
      </header>
      {/* Two-column body */}
      <div className="flex flex-1">
        <div
          className="hidden flex-col justify-center border-e border-nx-line px-12 lg:flex lg:w-1/2 xl:px-16"
          style={{ backgroundColor: "var(--login-surface, var(--nx-raised))" }}
        >
          <h2 className="text-3xl font-bold tracking-tight text-[var(--login-text,var(--nx-ink))]">
            {branding?.loginHeadline || t("auth.branding.headline")}
          </h2>
          <p className="mt-3 text-base text-[var(--login-text-muted,var(--nx-ink-2))]">
            {branding?.loginSubtitle || t("auth.branding.subtitle")}
          </p>
          <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
        </div>
        <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
          <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
          {formContent}
          {footerSlot}
        </main>
      </div>
    </div>
  );
}
