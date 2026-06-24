"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * React presentation component representing the immersive layout UI element.
 */
export function ImmersiveLayout({
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
      className={`relative flex min-h-screen w-full ${BG_STYLE} font-sans selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom right, var(--login-overlay-color, hsl(var(--background)))/0.8, transparent/0.4, var(--login-overlay-color, hsl(var(--background)))/0.8)",
          opacity: "var(--login-overlay-opacity, 0.7)",
          backdropFilter: "blur(var(--login-overlay-blur, 0px))",
        }}
      />
      {topActions}
      {/* Left: Big cinematic headline */}
      <div className="relative z-10 hidden flex-col justify-center px-16 lg:flex lg:w-3/5 xl:px-24">
        <h1 className="login-heading text-7xl font-black leading-[0.95] tracking-tighter text-[var(--login-text,hsl(var(--foreground)))]">
          {branding?.loginHeadline || companyName}
        </h1>
        <p className="mt-6 max-w-lg text-xl text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
          {branding?.loginSubtitle || t("auth.branding.subtitle")}
        </p>
        <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-10" />
      </div>
      {/* Right: Form on surface (no card) */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-8 py-12 lg:w-2/5">
        <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
        {loginStep === "credentials" && <DesktopHeading companyName={companyName} />}
        {formContent}
        {footer}
        {footerSlot}
      </div>
    </div>
  );
}
