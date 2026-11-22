"use client";

import { BG_STYLE, WRAPPER_STYLE, cardStyle } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the floating layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function FloatingLayout({
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
      {/* Grid pattern background */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--nx-line)_1px,transparent_1px),linear-gradient(to_bottom,var(--nx-line)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-40 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />
      {topActions}
      <main className="relative z-10 mx-4 w-full border border-nx-line" style={cardStyle("440px")}>
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-nx-line bg-nx-surface">
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
      </main>
    </div>
  );
}
