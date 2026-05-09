"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function MagazineLayout({
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
      style={WRAPPER_STYLE}
    >
      <div
        className="relative hidden flex-col justify-end overflow-hidden p-16 lg:flex lg:w-3/5"
        style={{
          backgroundImage: "var(--login-bg-image, none)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="login-heading text-6xl font-bold leading-[1.1] tracking-tight text-white">
            {branding?.loginHeadline || t("auth.branding.headline")}
          </h1>
          <p className="mt-4 text-lg text-white/80">
            {branding?.loginSubtitle || t("auth.branding.subtitle")}
          </p>
        </div>
        <SlotRenderer
          slotId="login.sidebar.content"
          slotConfig={slotConfig}
          className="relative z-10 mt-8"
        />
      </div>
      <div className="relative flex w-full flex-col items-center justify-center px-6 py-12 lg:w-2/5">
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
