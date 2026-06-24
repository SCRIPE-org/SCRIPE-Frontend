"use client";

import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the fullscreen form layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FullscreenFormLayout({
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
      {/* Subtle animated dot pattern */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle,var(--login-accent,hsl(var(--border)))_1px,transparent_1px)] bg-[size:24px_24px] opacity-[0.07]" />
      {topActions}
      <div
        className="relative z-10 w-full px-6"
        style={{ maxWidth: "var(--login-form-width, 400px)" }}
      >
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1
            className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
            style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}
          >
            {companyName}
          </h1>
        </div>
        {formContent}
        {footerSlot}
        <p className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]/50 mt-12 text-center text-[11px] font-medium">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
    </div>
  );
}
