"use client";

import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the overlay layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function OverlayLayout({
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
      className={`relative flex min-h-[100dvh] w-full items-center justify-center ${BG_STYLE} login-page`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--login-overlay-color, var(--nx-ground))",
          opacity: "var(--login-overlay-opacity, 0.7)",
        }}
      />
      {topActions}
      <main
        className="relative z-10 mx-4 w-full border border-[var(--login-border,var(--nx-line))]"
        style={{
          maxWidth: "var(--login-form-width, 420px)",
          padding: "var(--login-card-padding, 32px)",
          borderRadius: "var(--login-radius-card, 24px)",
          boxShadow: "var(--login-shadow-card, none)",
          backgroundColor:
            "color-mix(in srgb, var(--login-surface, var(--nx-surface)) 92%, transparent)",
        }}
      >
        <div className="relative z-10">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div
              className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-[var(--login-border,var(--nx-line))]"
              style={{
                backgroundColor: "var(--login-surface, var(--nx-raised))",
              }}
            >
              <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
            </div>
            <h1
              className="login-heading tracking-tight text-[var(--login-text,var(--nx-ink))]"
              style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}
            >
              {companyName}
            </h1>
            <p
              className="text-[var(--login-text-muted,var(--nx-ink-2))]"
              style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
            >
              {t("auth.pleaseLogin")}
            </p>
          </div>
          {formContent}
          {footerSlot}
        </div>
      </main>
    </div>
  );
}
