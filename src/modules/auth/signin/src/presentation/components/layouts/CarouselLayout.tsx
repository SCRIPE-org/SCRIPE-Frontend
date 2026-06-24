"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, SPLIT_WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading, LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * Presentation UI component rendering the carousel layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CarouselLayout({
  branding,
  slotConfig,
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
      className={`flex min-h-screen w-full ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={SPLIT_WRAPPER_STYLE}
    >
      <div className="relative hidden flex-col justify-center overflow-hidden border-e border-border bg-[var(--login-surface,hsl(var(--muted)/0.4))] p-16 lg:flex lg:w-1/2 xl:w-[55%]">
        <div className="mb-8">
          <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
        </div>
        <h2 className="login-heading text-4xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">
          {branding?.loginHeadline || t("auth.branding.headline")}
        </h2>
        <p className="mt-4 text-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
          {branding?.loginSubtitle || t("auth.branding.subtitle")}
        </p>
        <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
        <SlotRenderer
          slotId="login.sidebar.bottom"
          slotConfig={slotConfig}
          className="mt-auto pt-10"
        />
      </div>
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]">
        {topActions}
        <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
        {loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
        {formContent}
        {footer}
        {footerSlot}
      </div>
    </div>
  );
}
