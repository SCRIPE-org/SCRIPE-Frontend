"use client";

import { LoginBranding } from "../LoginBranding";
import { BG_STYLE, SPLIT_WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * React presentation component representing the asymmetric layout UI element.
 */
export function AsymmetricLayout({
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
}: LoginLayoutProps) {
  return (
    <div
      className={`flex min-h-screen w-full ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={SPLIT_WRAPPER_STYLE}
    >
      <div className="relative hidden overflow-hidden lg:flex lg:w-[60%]">
        <LoginBranding branding={branding} slotConfig={slotConfig} position="left" />
        {/* Accent divider */}
        <div className="absolute inset-y-0 end-0 w-1 bg-gradient-to-b from-transparent via-[var(--login-primary,hsl(var(--primary)))] to-transparent" />
      </div>
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-[40%]">
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
