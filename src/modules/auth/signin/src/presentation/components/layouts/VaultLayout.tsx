"use client";

import type { CSSProperties } from "react";
import { ShieldCheck, Building2, Zap } from "lucide-react";
import { SlotRenderer } from "../SlotRenderer";
import { LogoImg, MobileLogo } from "./layout-shared";
import { BG_STYLE } from "./layout-types";
import type { LoginLayoutProps } from "./layout-types";

/**
 * VaultLayout — Scripe's cinematic split auth layout.
 *
 * Left: ambient hero (wordmark, giant 3D mark, secure badge, gradient headline,
 * feature chips, compliance footer). Right: glass card holding the form.
 *
 * Every color/surface is read from the `--sx-*` token layer (globals.css, themed
 * dark/light) — no hardcoded hex. The hero text resolves from the Branding
 * Resolver output (`branding`, `companyName`) so platform vs. tenant surfaces and
 * tenant customizations both work. Ambient motion is in <VaultBackground/> under
 * `.sx-ambient` and honors prefers-reduced-motion.
 *
 * Visual source of truth: Scripe_claude_design/Scripe/scripe-vault.jsx.
 */
import { VaultBackground } from "./VaultBackground";

/** Giant 3D Scripe mark with rings, aurora glow, and (light-theme) glass orb. */
function VaultLogoBlock() {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: 280, height: 280, animation: "sxFloat 7s ease-in-out infinite" }}
    >
      {/* Breathing rings */}
      <div
        className="absolute rounded-full"
        style={{
          inset: "-10%",
          border: "1px solid var(--sx-accent-soft-border)",
          animation: "sxBreathe 4s ease-in-out infinite",
        }}
      />
      <div
        className="absolute rounded-full"
        style={{
          inset: "-25%",
          border: "1px solid var(--sx-card-border)",
          animation: "sxBreathe 5s ease-in-out infinite",
          animationDelay: "1s",
        }}
      />
      {/* Aurora glow under the mark */}
      <div
        className="absolute"
        style={{
          inset: "-20%",
          background: "radial-gradient(circle, var(--sx-aurora-a) 0%, transparent 65%)",
          filter: "blur(40px)",
        }}
      />
      {/* Light-theme dark glass orb (opacity token: 0 on dark, 1 on light) */}
      <div
        className="absolute rounded-full"
        style={{
          width: 260,
          height: 260,
          opacity: "var(--sx-logo-orb-opacity, 0)",
          background: "radial-gradient(circle at 30% 25%, #1a0f3d 0%, #06060e 80%)",
          boxShadow:
            "0 30px 80px rgba(76,29,149,.35), inset 0 1px 0 rgba(255,255,255,.10), 0 0 0 1px rgba(124,58,237,.30)",
        }}
      />
      {/* The 3D S — brand hero asset */}
      <img
        src="/scripe-icon-3d.png"
        alt="Scripe"
        className="relative z-[1] object-contain"
        style={{
          width: 280,
          height: 280,
          mixBlendMode: "var(--sx-logo-blend)" as CSSProperties["mixBlendMode"],
          filter: "var(--sx-logo-filter)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, #000 38%, transparent 62%)",
          maskImage: "radial-gradient(circle at 50% 50%, #000 38%, transparent 62%)",
        }}
      />
    </div>
  );
}

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
  const headline = branding?.loginHeadline || companyName;
  const subtitle = branding?.loginSubtitle || t("auth.branding.subtitle");

  const features = [
    { icon: ShieldCheck, label: t("auth.branding.featureSecurity") },
    { icon: Building2, label: t("auth.branding.featureMultiTenant") },
    { icon: Zap, label: t("auth.branding.featureRealtime") },
  ];
  const compliance = [
    t("auth.branding.vault.soc2"),
    t("auth.branding.vault.hipaa"),
    t("auth.branding.vault.iso"),
    t("auth.branding.vault.gdpr"),
  ];

  return (
    <div
      className={`vault-stage relative min-h-screen w-full overflow-hidden font-sans ${BG_STYLE}`}
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />
      {topActions}

      <div className="relative z-[1] grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,1fr)_min(500px,48%)]">
        {/* ── Hero (desktop) ───────────────────────────────────────── */}
        <div className="relative hidden flex-col justify-center gap-8 px-12 py-14 lg:flex xl:px-16">
          {/* Top lockup */}
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

          {/* Giant mark */}
          <div className="self-center">
            <VaultLogoBlock />
          </div>

          {/* Headline block */}
          <div className="flex max-w-xl flex-col gap-3.5">
            <span
              className="sx-mono inline-flex w-fit items-center gap-2 rounded-full px-2.5 py-1.5 text-[11px] uppercase tracking-[0.15em]"
              style={{
                background: "var(--sx-accent-soft)",
                border: "1px solid var(--sx-accent-soft-border)",
                color: "var(--sx-accent-text)",
                fontFamily: "var(--font-mono, ui-monospace, monospace)",
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--sx-accent)", boxShadow: "0 0 8px var(--sx-accent)" }}
              />
              {t("auth.branding.vault.secureBadge")}
            </span>
            <h1
              className="m-0 font-semibold leading-[1.05]"
              style={{
                fontSize: "clamp(40px, 4.6vw, 56px)",
                letterSpacing: "-0.025em",
                background: "var(--sx-text-heading)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              {headline}
            </h1>
            <p
              className="m-0 max-w-md text-[15px] leading-relaxed"
              style={{ color: "var(--sx-text-mute)" }}
            >
              {subtitle}
            </p>
          </div>

          {/* Feature chips */}
          <div className="flex flex-wrap gap-3">
            {features.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs"
                style={{
                  background: "var(--sx-chip-bg)",
                  border: "1px solid var(--sx-chip-border)",
                  color: "var(--sx-text-mute)",
                }}
              >
                <Icon className="h-3.5 w-3.5" style={{ color: "var(--sx-accent-text)" }} />
                {label}
              </span>
            ))}
          </div>

          <SlotRenderer slotId="login.sidebar.content" slotConfig={slotConfig} />

          {/* Compliance footer */}
          <div
            className="sx-mono flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.1em]"
            style={{
              color: "var(--sx-text-faint)",
              fontFamily: "var(--font-mono, ui-monospace, monospace)",
            }}
          >
            {compliance.map((c, i) => (
              <span key={c} className="flex items-center gap-4">
                {i > 0 && <span style={{ opacity: 0.4 }}>·</span>}
                {c}
              </span>
            ))}
          </div>
        </div>

        {/* ── Form column ──────────────────────────────────────────── */}
        <div className="flex items-center justify-center px-5 py-12 lg:py-14 lg:pe-10 lg:ps-0">
          <div
            key={loginStep}
            className="sx-screen vault-cta relative flex w-full max-w-[430px] flex-col rounded-[20px]"
            style={{
              padding: 34,
              background: "var(--sx-card-bg)",
              border: "1px solid var(--sx-card-border)",
              boxShadow: "var(--sx-card-shadow)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Top accent line — purple gradient glow */}
            <div
              className="pointer-events-none absolute left-[20%] right-[20%] top-0 h-px"
              style={{
                background: `linear-gradient(90deg, transparent, var(--sx-accent, #A855F7), transparent)`,
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
