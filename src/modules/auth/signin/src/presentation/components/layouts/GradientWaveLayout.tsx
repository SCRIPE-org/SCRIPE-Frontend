"use client";

import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

/**
 * React presentation component representing the gradient wave layout UI element.
 */
export function GradientWaveLayout({
  branding,
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
      className={`flex min-h-screen w-full flex-col ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      {topActions}
      {/* Top branded section */}
      <div
        className="relative flex flex-col items-center justify-center px-8 pb-24 pt-20 text-center"
        style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.4))" }}
      >
        <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
        </div>
        <h1 className="login-heading mt-6 text-4xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">
          {companyName}
        </h1>
        <p className="mt-3 text-base text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
          {branding?.loginSubtitle || t("auth.branding.subtitle")}
        </p>
        {/* Wave SVG divider */}
        <svg
          className="absolute -bottom-1 left-0 w-full"
          viewBox="0 0 1440 100"
          preserveAspectRatio="none"
          style={{ height: "60px" }}
        >
          <path
            d="M0,40 C360,100 720,0 1080,60 C1260,80 1380,50 1440,40 L1440,100 L0,100 Z"
            fill="var(--login-bg, hsl(var(--background)))"
          />
        </svg>
      </div>
      {/* Bottom form section */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {formContent}
        {footerSlot}
      </div>
    </div>
  );
}
