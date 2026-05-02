"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg, OverlayDiv } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function BrandedFullLayout({
  slotConfig, formContent, topActions, footerSlot,
  logoSrc, logoAlt, companyName, direction,
}: LoginLayoutProps) {
  return (
    <div
      className={`relative flex min-h-screen w-full items-center justify-center ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      <OverlayDiv />
      {topActions}
      <div
        className="border-[var(--login-border,hsl(var(--border)))]/50 relative z-10 mx-4 w-full border backdrop-blur-xl"
        style={{
          maxWidth: "var(--login-form-width, 480px)",
          borderRadius: "var(--login-radius-card, 16px)",
          padding: "var(--login-card-padding, 32px)",
          boxShadow: "var(--login-shadow-card, 0 25px 50px -12px rgba(0,0,0,.25))",
          backgroundColor: "color-mix(in srgb, var(--login-surface, hsl(var(--background))) 95%, transparent)",
        }}
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div
            className="flex h-16 w-16 items-center justify-center overflow-hidden border border-border bg-background shadow-sm"
            style={{ borderRadius: "var(--login-radius-card, 12px)" }}
          >
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1
            className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
            style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}
          >
            {companyName}
          </h1>
        </div>
        <SlotRenderer slotId="login.form.above" slotConfig={slotConfig} className="mb-4" />
        {formContent}
        {footerSlot}
      </div>
    </div>
  );
}
