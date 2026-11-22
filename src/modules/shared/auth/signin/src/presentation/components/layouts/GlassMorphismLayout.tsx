"use client";

import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the glass morphism layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function GlassMorphismLayout({
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
          opacity: "var(--login-overlay-opacity, 0.5)",
        }}
      />
      {topActions}
      <main
        className="relative z-10 mx-4 w-full"
        style={{ maxWidth: "var(--login-form-width, 440px)" }}
      >
        <div
          className="border border-[var(--login-border,var(--nx-line))]"
          style={{
            borderRadius: "var(--login-radius-card, 24px)",
            padding: "var(--login-card-padding, 40px)",
            boxShadow: "var(--login-shadow-card, none)",
            backgroundColor:
              "color-mix(in srgb, var(--login-surface, var(--nx-surface)) 92%, transparent)",
          }}
        >
          <div className="relative z-10">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div
                className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-[var(--login-border,var(--nx-line))]"
                style={{
                  backgroundColor: "var(--login-surface, var(--nx-raised))",
                }}
              >
                <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--login-text,var(--nx-ink))]">
                {companyName}
              </h1>
              <p className="text-sm text-[var(--login-text-muted,var(--nx-ink-2))]">
                {t("auth.pleaseLogin")}
              </p>
            </div>
            {formContent}
            {footerSlot}
          </div>
        </div>
      </main>
    </div>
  );
}
