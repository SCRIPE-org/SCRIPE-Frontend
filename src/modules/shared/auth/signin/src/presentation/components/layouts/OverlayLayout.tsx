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
      className={`relative flex min-h-screen w-full items-center justify-center ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--login-overlay-color, hsl(var(--background)))",
          opacity: "var(--login-overlay-opacity, 0.7)",
          backdropFilter: "blur(var(--login-overlay-blur, 6px))",
        }}
      />
      {topActions}
      <div
        className="border-[var(--login-accent,hsl(var(--border)))]/30 relative z-10 mx-4 w-full border shadow-2xl backdrop-blur-2xl"
        style={{
          maxWidth: "var(--login-form-width, 420px)",
          padding: "var(--login-card-padding, 32px)",
          borderRadius: "var(--login-radius-card, 24px)",
          boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
          backgroundColor:
            "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 85%, transparent)",
        }}
      >
        <div className="from-[var(--login-primary,hsl(var(--primary)))]/20 to-[var(--login-primary,hsl(var(--primary)))]/10 pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-b via-transparent" />
        <div className="relative z-10">
          <div className="mb-8 flex flex-col items-center gap-3 text-center">
            <div
              className="border-[var(--login-accent,hsl(var(--border)))]/30 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border shadow-lg backdrop-blur-sm"
              style={{
                backgroundColor:
                  "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 60%, transparent)",
              }}
            >
              <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
            </div>
            <h1
              className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
              style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}
            >
              {companyName}
            </h1>
            <p
              className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
              style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
            >
              {t("auth.pleaseLogin")}
            </p>
          </div>
          {formContent}
          {footerSlot}
        </div>
      </div>
    </div>
  );
}
