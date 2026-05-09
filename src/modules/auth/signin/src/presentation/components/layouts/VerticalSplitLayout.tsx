"use client";

import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function VerticalSplitLayout({
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
      <div
        className="relative flex flex-1 flex-col items-center justify-center px-8 py-16 text-center"
        style={{
          backgroundImage: "var(--login-bg-image, none)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ backgroundColor: "var(--login-surface, hsl(var(--muted)/0.6))" }}
        />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1 className="login-heading text-4xl font-bold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">
            {branding?.loginHeadline || companyName}
          </h1>
          <p className="text-base text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            {branding?.loginSubtitle || t("auth.branding.subtitle")}
          </p>
        </div>
        {/* Gradient divider */}
        <div className="absolute -bottom-px left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[var(--login-primary,hsl(var(--primary)))] to-transparent" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {formContent}
        {footerSlot}
      </div>
    </div>
  );
}
