/* eslint-disable unused-imports/no-unused-vars */
"use client";

import { BG_STYLE, SPLIT_WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading, LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the sidebar compact layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SidebarCompactLayout({
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
      className={`flex min-h-[100dvh] w-full ${BG_STYLE} login-page`}
      dir={direction}
      style={SPLIT_WRAPPER_STYLE}
    >
      {/* Narrow brand strip */}
      <div className="hidden w-20 flex-col items-center justify-between border-e border-nx-line bg-[var(--login-surface,var(--nx-raised))] py-8 lg:flex">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-nx-line bg-nx-surface">
          <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
        </div>
        <p className="rotate-180 text-[9px] text-nx-ink-3 [writing-mode:vertical-lr]">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
      {/* Main form area */}
      <main className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
        {topActions}
        <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
        {loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
        {formContent}
        {footer}
        {footerSlot}
      </main>
    </div>
  );
}
