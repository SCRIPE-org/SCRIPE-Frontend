"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function StackedLayout({
  slotConfig,
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
      {/* Brand Banner */}
      <div
        className="relative w-full overflow-hidden px-8 py-12 text-center"
        style={{
          backgroundImage: "var(--login-bg-image, none)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[var(--login-surface,hsl(var(--muted)/0.4))]" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--login-text,hsl(var(--foreground)))]">
            {companyName}
          </h1>
          <p className="text-sm text-[var(--login-text-muted,hsl(var(--muted-foreground)))]">
            {t("auth.pleaseLogin")}
          </p>
        </div>
        <SlotRenderer
          slotId="login.sidebar.content"
          slotConfig={slotConfig}
          className="relative z-10 mt-6"
        />
      </div>
      {/* Form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {formContent}
        {footerSlot}
      </div>
    </div>
  );
}
