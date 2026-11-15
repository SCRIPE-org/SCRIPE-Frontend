"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE, cardStyle } from "./layout-types";
import { LogoImg, OverlayDiv } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the corner card layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CornerCardLayout({
  branding,
  slotConfig,
  formContent,
  topActions,
  footerSlot,
  logoSrc,
  logoAlt,
  companyName,
  direction,
  t,
}: LoginLayoutProps) {
  return (
    <div
      className={`relative flex min-h-[100dvh] w-full ${BG_STYLE} login-page`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <OverlayDiv />
      {topActions}
      {/* Hero branding area */}
      <div className="relative z-10 hidden flex-1 flex-col justify-center px-16 lg:flex xl:px-24">
        <h1 className="login-heading text-6xl font-black tracking-tighter text-[var(--login-text,var(--nx-ink))]">
          {branding?.loginHeadline || companyName}
        </h1>
        <p className="mt-4 max-w-lg text-lg text-[var(--login-text-muted,var(--nx-ink-2))]">
          {branding?.loginSubtitle || t("auth.branding.subtitle")}
        </p>
        <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-8" />
      </div>
      {/* Corner card */}
      <main className="relative z-10 flex w-full items-end justify-center p-6 lg:w-auto lg:items-end lg:justify-end lg:p-10">
        <div
          className="w-full border border-[var(--login-accent,var(--nx-line))]"
          style={cardStyle("400px")}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-nx-line bg-nx-surface">
              <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
            </div>
            <span className="text-sm font-semibold text-[var(--login-text,var(--nx-ink))]">
              {companyName}
            </span>
          </div>
          {formContent}
          {footerSlot}
        </div>
      </main>
    </div>
  );
}
