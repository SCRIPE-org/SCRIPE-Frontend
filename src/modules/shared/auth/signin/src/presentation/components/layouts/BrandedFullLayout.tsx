"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg, OverlayDiv } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the branded full layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BrandedFullLayout({
  slotConfig,
  formContent,
  topActions,
  footerSlot,
  logoSrc,
  logoAlt,
  companyName,
  direction,
}: LoginLayoutProps) {
  return (
    <div
      className={`relative flex min-h-[100dvh] w-full items-center justify-center ${BG_STYLE} login-page`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <OverlayDiv />
      {topActions}
      <main
        className="relative z-10 mx-4 w-full border border-[var(--login-border,var(--nx-line))]"
        style={{
          maxWidth: "var(--login-form-width, 480px)",
          borderRadius: "var(--login-radius-card, 16px)",
          padding: "var(--login-card-padding, 32px)",
          boxShadow: "var(--login-shadow-card, none)",
          backgroundColor:
            "color-mix(in srgb, var(--login-surface, var(--nx-surface)) 95%, transparent)",
        }}
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden border border-nx-line bg-nx-surface"
            style={{ borderRadius: "var(--login-radius-card, 12px)" }}
          >
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1
            className="login-heading tracking-tight text-[var(--login-text,var(--nx-ink))]"
            style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}
          >
            {companyName}
          </h1>
        </div>
        <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-4" />
        {formContent}
        {footerSlot}
      </main>
    </div>
  );
}
