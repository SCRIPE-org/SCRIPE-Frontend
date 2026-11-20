"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the immersive layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ImmersiveLayout({
  branding,
  slotConfig,
  formContent,
  topActions,
  footer,
  footerSlot,
  logoSrc,
  logoAlt,
  companyName,
  direction,
  loginStep,
  t,
}: LoginLayoutProps) {
  return (
    <div
      // "login-page" is the scope every global auth accessibility rule is
      // written under; this was the only one of the 23 layouts missing it, so
      // those rules silently did nothing here.
      className={`login-page relative flex min-h-[100dvh] w-full ${BG_STYLE} font-sans`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom right, color-mix(in srgb, var(--login-overlay-color, var(--nx-ground)) 80%, transparent), transparent, color-mix(in srgb, var(--login-overlay-color, var(--nx-ground)) 80%, transparent))",
          opacity: "var(--login-overlay-opacity, 0.7)",
        }}
      />
      {topActions}
      {/* Left: Big cinematic headline */}
      <div className="relative z-10 hidden flex-col justify-center px-16 lg:flex lg:w-3/5 xl:px-24">
        <h1 className="login-heading text-7xl font-black leading-[0.95] tracking-tighter text-[var(--login-text,var(--nx-ink))]">
          {branding?.loginHeadline || companyName}
        </h1>
        <p className="mt-6 max-w-lg text-xl text-[var(--login-text-muted,var(--nx-ink-2))]">
          {branding?.loginSubtitle || t("auth.branding.subtitle")}
        </p>
        <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
      </div>
      {/* Right: Form on surface (no card) */}
      <main className="relative z-10 flex w-full flex-col items-center justify-center px-8 py-12 lg:w-2/5">
        <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
        {loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
        {formContent}
        {footer}
        {footerSlot}
      </main>
    </div>
  );
}
