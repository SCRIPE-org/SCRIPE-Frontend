"use client";

import { LoginBranding } from "../LoginBranding";
import { BG_STYLE, SPLIT_WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * React presentation component representing the split diagonal layout UI element.
 */
export function SplitDiagonalLayout({
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
      className={`relative flex min-h-screen w-full ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={SPLIT_WRAPPER_STYLE}
    >
      <div
        className="absolute inset-0 hidden w-[55%] lg:block"
        style={{
          clipPath: "polygon(0 0, 100% 0, 75% 100%, 0 100%)",
          backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))",
        }}
      >
        <LoginBranding branding={branding} slotConfig={slotConfig} position="left" />
      </div>
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-6 py-12 lg:ms-auto lg:w-[50%]">
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
