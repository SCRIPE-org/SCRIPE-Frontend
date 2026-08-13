"use client";

import { SlotRenderer } from "../SlotRenderer";
import { LogoImg, MobileLogo } from "./layout-shared";
import { BG_STYLE } from "./layout-types";
import type { LoginLayoutProps } from "./layout-types";

/**
 * VaultLayout — the "Program Cover" split auth layout.
 *
 * Left: an editorial brand stage composed like a matchday program cover —
 * masthead lockup at the top, a quiet crest, a large two-line headline with
 * exactly one word in Signal Lime, a muted standfirst, and a footer block
 * carrying the product family and compliance marks above a hairline. The
 * typography is the hero; there is no ambient decoration of any kind.
 *
 * Right: calm high-contrast form card, untouched product logic.
 *
 * Motion: ONE authored moment — the headline lines rise out of clipping
 * masks (550ms, second line a beat behind); crest and supporting text fade
 * to present. Nothing loops. Reduced motion renders everything in place.
 *
 * Every color reads from the `--sx-*` token layer (globals.css, themed
 * dark/light) — no hardcoded hex.
 */
import { VaultBackground } from "./VaultBackground";
import Image from "next/image";

/** The three product family names are brand nouns — they do not localize. */
const PRODUCT_FAMILY = ["Venue", "Academy", "Football Intelligence"];

/**
 * The canonical 3D Relay Grid mark as a quiet crest — small, seated with a
 * real contact shadow, no filters, no blend tricks, no motion beyond a fade.
 * The image is never cropped, recolored, or upscaled beyond its native
 * 1254x1254 source (V3 fidelity policy).
 */
function Crest() {
  const size = 168;
  return (
    <div className="scripe-crest scripe-fade-in flex w-fit flex-col items-center">
      <Image
        src="/brand/auth/login-relay-grid-3d.png"
        alt=""
        width={size}
        height={size}
        sizes={`${size}px`}
        priority
        className="object-contain"
        style={{ width: size, height: size }}
        aria-hidden="true"
      />
      {/* Contact shadow — attached to the crest, not floating in the scene */}
      <div
        aria-hidden="true"
        style={{
          width: size * 0.56,
          height: 12,
          marginTop: -6,
          background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.42) 0%, transparent 70%)",
          filter: "blur(5px)",
        }}
      />
    </div>
  );
}

/**
 * Presentation UI component rendering the vault layout.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
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
  // Tenant override renders as one plain line; the platform default is a
  // composed two-line headline with a single Signal Lime word — DESIGN.md's
  // "one deliberate visual signal in a cinematic auth scene". Never the bare
  // company name: a giant "SCRIPE" is a label, not a pitch.
  const tenantHeadline = branding?.loginHeadline;
  const subtitle = branding?.loginSubtitle || t("auth.branding.subtitle");

  const compliance = [
    t("auth.branding.vault.soc2"),
    t("auth.branding.vault.hipaa"),
    t("auth.branding.vault.iso"),
    t("auth.branding.vault.gdpr"),
  ];

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
        {/* ── Program cover (desktop) ─────────────────────────────── */}
        <div className="relative hidden flex-col justify-between px-12 py-12 lg:flex xl:px-16">
          {/* Masthead — instantly present, no entrance */}
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

          {/* Cover — crest, headline, standfirst */}
          <div className="flex max-w-2xl flex-col gap-8 py-10">
            <Crest />

            <h1
              className="m-0 font-bold"
              style={{
                fontSize: "clamp(44px, 4.8vw, 72px)",
                letterSpacing: "-0.03em",
                lineHeight: 1.04,
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
              className="scripe-fade-in m-0 max-w-[44ch] text-[16px] leading-relaxed"
              style={{ color: "var(--sx-text-mute)" }}
            >
              {subtitle}
            </p>

            <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} />
          </div>

          {/* Cover footer — product family above compliance, one hairline */}
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
            <div
              className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.1em]"
              style={{ ...monoStyle, color: "var(--sx-text-faint)" }}
            >
              {compliance.map((c, i) => (
                <span key={c} className="flex items-center gap-3">
                  {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Form column ──────────────────────────────────────────── */}
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
              // Solid surface — DESIGN.md bans default glassmorphism; the
              // card gradient is already near-opaque, the blur was costume.
              padding: "var(--login-card-padding, 34px)",
              background: "var(--sx-card-bg)",
              border: "1px solid var(--sx-card-border)",
              boxShadow: "var(--sx-card-shadow)",
            }}
          >
            {/* Top accent line — Signal Lime, one hairline signal */}
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
