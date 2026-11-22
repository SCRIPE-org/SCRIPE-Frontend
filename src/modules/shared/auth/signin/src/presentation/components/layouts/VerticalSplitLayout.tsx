"use client";

import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the vertical split layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function VerticalSplitLayout({
  branding,
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
      className={`flex min-h-[100dvh] w-full flex-col ${BG_STYLE} login-page`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      {topActions}
      <div
        className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 text-center"
        style={{
          backgroundImage: "var(--login-bg-image, none)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "var(--login-surface, var(--nx-raised))" }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-nx-line bg-nx-surface">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1 className="login-heading text-4xl font-bold tracking-tight text-[var(--login-text,var(--nx-ink))]">
            {branding?.loginHeadline || companyName}
          </h1>
          <p className="text-base text-[var(--login-text-muted,var(--nx-ink-2))]">
            {branding?.loginSubtitle || t("auth.branding.subtitle")}
          </p>
        </div>
        {/* Gradient divider */}
        <div className="absolute -bottom-px inset-x-0 h-1 bg-gradient-to-r from-transparent via-[var(--login-primary,var(--nx-accent))] to-transparent" />
      </div>
      <main className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {formContent}
        {footerSlot}
      </main>
    </div>
  );
}
