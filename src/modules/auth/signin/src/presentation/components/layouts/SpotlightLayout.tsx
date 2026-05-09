"use client";

import { BG_STYLE, WRAPPER_STYLE, cardStyle } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function SpotlightLayout({
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
      className={`relative flex min-h-screen w-full items-center justify-center ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      {/* Radial spotlight glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 60% at 50% 50%, var(--login-primary, hsl(var(--primary)))/0.12 0%, transparent 70%)",
        }}
      />
      {topActions}
      <div
        className="relative z-10 mx-4 w-full border border-[var(--login-accent,hsl(var(--border)))]"
        style={cardStyle("420px")}
      >
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1
            className="login-heading tracking-tight text-[var(--login-text,hsl(var(--foreground)))]"
            style={{ fontSize: "var(--login-size-headline, 1.5rem)" }}
          >
            {companyName}
          </h1>
          <p
            className="text-[var(--login-text-muted,hsl(var(--muted-foreground)))]"
            style={{ fontSize: "var(--login-size-subtitle, 0.875rem)" }}
          >
            {t("auth.pleaseLogin")}
          </p>
        </div>
        {formContent}
        {footerSlot}
      </div>
    </div>
  );
}
