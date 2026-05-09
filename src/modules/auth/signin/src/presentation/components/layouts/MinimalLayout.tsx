"use client";

import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function MinimalLayout({
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
      className={`flex min-h-screen w-full flex-col items-center justify-center ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      {topActions}
      <div className="w-full px-6" style={{ maxWidth: "var(--login-form-width, 380px)" }}>
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
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
        <p className="mt-12 text-center text-[11px] font-medium text-muted-foreground/50">
          © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
        </p>
      </div>
    </div>
  );
}
