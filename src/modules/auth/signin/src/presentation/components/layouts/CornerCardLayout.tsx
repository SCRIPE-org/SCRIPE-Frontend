"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE, cardStyle } from "./layout-types";
import { LogoImg, OverlayDiv } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function CornerCardLayout({
  branding, slotConfig, formContent, topActions, footerSlot,
  logoSrc, logoAlt, companyName, direction, t,
}: LoginLayoutProps) {
  return (
    <div
      className={`relative flex min-h-screen w-full ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <OverlayDiv />
      {topActions}
      {/* Hero branding area */}
      <div className="relative z-10 hidden flex-1 flex-col justify-center px-16 lg:flex xl:px-24">
        <h1 className="login-heading text-6xl font-black tracking-tighter text-[var(--login-text,hsl(var(--foreground)))]">
          {branding?.loginHeadline || companyName}
        </h1>
        <p className="mt-4 max-w-lg text-lg text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
          {branding?.loginSubtitle || t("auth.branding.subtitle")}
        </p>
        <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} className="mt-8" />
      </div>
      {/* Corner card */}
      <div className="relative z-10 flex w-full items-end justify-center p-6 lg:w-auto lg:items-end lg:justify-end lg:p-10">
        <div
          className="w-full border border-[var(--login-accent,hsl(var(--border)))]"
          style={cardStyle("400px")}
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
              <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
            </div>
            <span className="text-sm font-semibold text-[var(--login-text,hsl(var(--foreground)))]">{companyName}</span>
          </div>
          {formContent}
          {footerSlot}
        </div>
      </div>
    </div>
  );
}
