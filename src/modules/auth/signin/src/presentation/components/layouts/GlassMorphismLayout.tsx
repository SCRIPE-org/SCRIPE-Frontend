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
      className={`relative flex min-h-screen w-full items-center justify-center ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: "var(--login-overlay-color, hsl(var(--background)))",
          opacity: "var(--login-overlay-opacity, 0.5)",
          backdropFilter: "blur(var(--login-overlay-blur, 2px))",
        }}
      />
      {/* Ambient glow orbs */}
      <div className="bg-[var(--login-primary,hsl(var(--primary)))]/20 pointer-events-none absolute start-1/4 top-1/4 h-64 w-64 rounded-full blur-[100px]" />
      <div className="bg-[var(--login-primary,hsl(var(--primary)))]/15 pointer-events-none absolute bottom-1/4 end-1/4 h-48 w-48 rounded-full blur-[80px]" />
      {topActions}
      <div
        className="relative z-10 mx-4 w-full"
        style={{ maxWidth: "var(--login-form-width, 440px)" }}
      >
        <div
          className="border-[var(--login-accent,hsl(var(--border)))]/20 border shadow-2xl backdrop-blur-3xl"
          style={{
            borderRadius: "var(--login-radius-card, 24px)",
            padding: "var(--login-card-padding, 40px)",
            backgroundColor:
              "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 70%, transparent)",
          }}
        >
          <div className="from-[var(--login-primary,hsl(var(--primary)))]/30 to-[var(--login-primary,hsl(var(--primary)))]/15 pointer-events-none absolute -inset-px rounded-3xl bg-gradient-to-br via-transparent" />
          <div className="relative z-10">
            <div className="mb-8 flex flex-col items-center gap-3 text-center">
              <div
                className="h-18 w-18 border-[var(--login-accent,hsl(var(--border)))]/20 flex items-center justify-center overflow-hidden rounded-2xl border shadow-xl backdrop-blur-md"
                style={{
                  backgroundColor:
                    "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 50%, transparent)",
                }}
              >
                <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">
                {companyName}
              </h1>
              <p className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
                {t("auth.pleaseLogin")}
              </p>
            </div>
            {formContent}
            {footerSlot}
          </div>
        </div>
      </div>
    </div>
  );
}
