"use client";

import { LoginBranding } from "../LoginBranding";
import { BG_STYLE, SPLIT_WRAPPER_STYLE, FORM_SIDE_BG_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function SplitLeftLayout({
  branding, slotConfig, formContent, topActions, footer, footerSlot,
  logoSrc, logoAlt, companyName, direction, loginStep,
}: LoginLayoutProps) {
  return (
    <div
      className={`flex min-h-screen w-full ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={SPLIT_WRAPPER_STYLE}
    >
      <div
        className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2 xl:w-[45%]"
        style={FORM_SIDE_BG_STYLE}
      >
        {topActions}
        <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
        {loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
        {formContent}
        {footer}
        {footerSlot}
      </div>
      <LoginBranding branding={branding} slotConfig={slotConfig} position="right" />
    </div>
  );
}
