"use client";

import { BG_STYLE, SPLIT_WRAPPER_STYLE } from "./layout-types";
import { MobileLogo, DesktopHeading, LogoImg } from "./layout-shared";
import type { LoginLayoutProps } from "./layout-types";

export function SidebarCompactLayout({
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
      style={SPLIT_WRAPPER_STYLE}
    >
      {/* Narrow brand strip */}
      <div className="hidden w-20 flex-col items-center justify-between border-e border-border bg-[var(--login-surface,hsl(var(--muted)/0.4))] py-8 lg:flex">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-background shadow-sm">
          <LogoImg logoSrc={logoSrc} logoAlt={logoAlt} />
        </div>
        <p className="rotate-180 text-[9px] text-muted-foreground/40 [writing-mode:vertical-lr]">
          © {new Date().getFullYear()} {companyName}
        </p>
      </div>
      {/* Main form area */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-12">
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
