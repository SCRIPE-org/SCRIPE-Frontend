"use client";

import { BG_STYLE, WRAPPER_STYLE, cardStyle } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the mosaic layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function MosaicLayout({
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
      {/* Mosaic grid pattern background */}
      <div className="pointer-events-none absolute inset-0 grid grid-cols-6 grid-rows-4 gap-1 p-2 opacity-[0.06]">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg bg-[var(--login-primary,hsl(var(--primary)))]"
            style={{ opacity: 0.3 + (i % 5) * 0.15 }}
          />
        ))}
      </div>
      {topActions}
      <div
        className="relative z-10 mx-4 w-full border border-[var(--login-accent,hsl(var(--border)))]"
        style={cardStyle("440px")}
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
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
  );
}
