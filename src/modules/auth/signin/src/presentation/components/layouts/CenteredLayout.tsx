"use client";

import { SlotRenderer } from "../SlotRenderer";
import { BG_STYLE, WRAPPER_STYLE } from "./layout-types";
import { LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function CenteredLayout({
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
      className={`flex min-h-screen w-full flex-col items-center ${BG_STYLE} login-page selection:bg-primary/20`}
      dir={direction}
      style={WRAPPER_STYLE}
    >
      {topActions}
      <div className="flex w-full max-w-lg flex-1 flex-col items-center justify-center px-6 py-24">
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
            <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{companyName}</h1>
          <p className="text-sm text-muted-foreground">{t("auth.pleaseLogin")}</p>
        </div>
        <SlotRenderer
          slotId="login.sidebar.content"
          slotConfig={slotConfig}
          className="mb-8 w-full"
        />
        {formContent}
        {footerSlot}
        <p className="mt-12 text-[11px] font-medium text-muted-foreground/50">
          © {new Date().getFullYear()} {companyName} — {t("auth.branding.copyright")}
        </p>
      </div>
    </div>
  );
}
