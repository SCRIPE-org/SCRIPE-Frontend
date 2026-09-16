/**
 * VaultLayout — Showroom split authentication layout.
 * Left: Cinematic stage featuring the 3D Relay Grid monument, localized editorial typography, and product family branding.
 * Right: High-contrast authentication card hosting login forms, multi-factor challenges, and SSO triggers.
 */

"use client";

import { SlotRenderer } from "../SlotRenderer";
import { LogoImg, MobileLogo } from "./layout-shared";
import { BG_STYLE } from "./layout-types";
import type { LoginLayoutProps } from "./layout-types";
import { VaultBackground } from "./VaultBackground";
import { VaultMonument } from "./VaultMonument";

const PRODUCT_FAMILY = ["Venue", "Academy", "Football Intelligence"];

/**
 * Renders the showroom split layout for sign-in and authentication workflows.
 *
 * @param props Authentication layout properties including branding, slots, form contents, and locale functions.
 * @returns Full-screen split view authentication layout.
 */
export function VaultLayout({
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
  const tenantHeadline = branding?.loginHeadline;
  const subtitle = branding?.loginSubtitle || t("auth.branding.subtitle");

  const monoStyle = {
    fontFamily: "var(--font-mono, ui-monospace, monospace)",
  } as const;

  return (
    <div
      className={`vault-stage login-page relative min-h-screen w-full overflow-hidden font-sans ${BG_STYLE}`}
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />

      <div className="relative z-[1] grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_min(500px,48%)]">
        {/* Showroom stage (desktop) */}
        <div className="relative hidden flex-col justify-between px-12 py-10 lg:flex xl:px-16">
          {/* Masthead */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
              <LogoImg
                logoSrc={logoSrc}
                logoAlt={logoAlt}
                className="h-full w-full object-contain"
              />
            </div>
            <span
              className="text-lg font-semibold tracking-tight"
              style={{ color: "var(--sx-text)" }}
            >
              {companyName}
            </span>
          </div>

          {/* Scene */}
          <div className="flex flex-col items-center">
            <div style={{ marginBottom: "max(-3vw, -44px)" }}>
              <VaultMonument />
            </div>

            <h1
              className="m-0 mt-6 text-center font-bold"
              style={{
                fontSize: "clamp(40px, 4.2vw, 64px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.05,
                color: "var(--sx-text-heading)",
              }}
            >
              {tenantHeadline ? (
                <span className="scripe-line-mask">
                  <span className="scripe-line-rise">{tenantHeadline}</span>
                </span>
              ) : (
                <>
                  <span className="scripe-line-mask">
                    <span className="scripe-line-rise" data-line="1">
                      {t("auth.branding.headlineL1")}
                    </span>
                  </span>
                  <span className="scripe-line-mask">
                    <span className="scripe-line-rise" data-line="2">
                      {t("auth.branding.headlineL2Pre")}
                      <span style={{ color: "var(--sx-accent-text)" }}>
                        {t("auth.branding.headlineL2Accent")}
                      </span>
                    </span>
                  </span>
                </>
              )}
            </h1>

            <p
              className="scripe-fade-in m-0 mt-5 max-w-[46ch] text-center text-[16px] leading-relaxed"
              style={{ color: "var(--sx-text-mute)" }}
            >
              {subtitle}
            </p>

            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} />
          </div>

          {/* Stage footer */}
          <div
            className="scripe-fade-in flex flex-col gap-3 pt-5"
            style={{ borderTop: "1px solid var(--sx-divider)" }}
          >
            <div
              className="flex flex-wrap items-center gap-3 text-[11px] font-medium uppercase tracking-[0.16em]"
              style={{ ...monoStyle, color: "var(--sx-text-mute)" }}
            >
              {PRODUCT_FAMILY.map((name, i) => (
                <span key={name} className="flex items-center gap-3">
                  {i > 0 && <span style={{ color: "var(--sx-accent-text)" }}>·</span>}
                  {name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Form column */}
        <div
          className="relative flex flex-col items-center justify-center px-5 lg:py-14 lg:pe-10 lg:ps-0"
          style={{
            paddingTop: "var(--login-container-py, 48px)",
            paddingBottom: "var(--login-container-py, 48px)",
          }}
        >
          {topActions}
          <div
            key={loginStep}
            className="sx-screen vault-cta relative flex w-full max-w-[430px] flex-col rounded-[20px]"
            style={{
              padding: "var(--login-card-padding, 34px)",
              background: "var(--sx-card-bg)",
              border: "1px solid var(--sx-card-border)",
              boxShadow: "var(--sx-card-shadow)",
            }}
          >
            {/* Top accent line */}
            <div
              className="pointer-events-none absolute left-[20%] right-[20%] top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, var(--sx-accent, #C6FF00), transparent)`,
                opacity: 0.7,
              }}
              aria-hidden="true"
            />
            <div className="lg:hidden">
              <MobileLogo logoSrc={logoSrc} logoAlt={logoAlt} companyName={companyName} />
            </div>
            {formContent}
            {footer}
            {footerSlot}
          </div>
        </div>
      </div>
    </div>
  );
}
