"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the centered layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CenteredLayout({
  slotConfig,
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
      className={`flex min-h-[100dvh] w-full flex-col items-center ${BG_STYLE} login-page`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      {topActions}
      <main className="flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-nx-line bg-nx-surface">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-nx-ink">{companyName}</h1>
          <p className="text-sm text-nx-ink-2">{t("auth.pleaseLogin")}</p>
        </div>
        <SlotRenderer
          slotId="login.sidebar.content"
          slotConfig={slotConfig}
          className="mb-8 w-full"
        />
        {formContent}
        {footerSlot}
        <p className="mt-12 text-center text-[11px] font-medium text-nx-ink-3">
          © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
        </p>
      </main>
    </div>
  );
}
