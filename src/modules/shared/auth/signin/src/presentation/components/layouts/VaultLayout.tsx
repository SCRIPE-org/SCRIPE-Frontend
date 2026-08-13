"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ShieldCheck, Building2, Zap } from "lucide-react";
import { SlotRenderer } from "../SlotRenderer";
import { LogoImg, MobileLogo } from "./layout-shared";
import { BG_STYLE } from "./layout-types";
import type { LoginLayoutProps } from "./layout-types";

/**
 * VaultLayout — SCRIPE Relay vNext cinematic split auth layout.
 *
 * Left: cinematic brand stage (wordmark, protected 3D Relay Grid, secure
 * badge, headline, feature chips, compliance footer). Right: calm
 * high-contrast form card. Every color/surface is read from the `--sx-*`
 * token layer (globals.css, themed dark/light, re-based to Relay vNext) — no
 * hardcoded hex. Ambient stage motion is in <VaultBackground/>; the logo
 * block plays a single 650ms intro reveal (never looping) and an optional
 * fine-pointer parallax, both honoring `prefers-reduced-motion`.
 */
import { VaultBackground } from "./VaultBackground";
import Image from "next/image";

/**
 * The canonical 3D Relay Grid mark, presented as a single protected asset.
 * Container-level motion only — the intro reveal and parallax transform the
 * wrapper; the image itself is never cropped, filtered, or upscaled beyond
 * its native 1254x1254 source (V3 fidelity policy).
 */
function VaultLogoBlock() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!finePointer || reducedMotion) return;

    const el = wrapRef.current;
    if (!el) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      // Max ±2deg, per DESIGN.md's cinematic parallax ceiling.
      setTilt({ x: py * -4, y: px * 4 });
    };
    const onLeave = () => setTilt({ x: 0, y: 0 });

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="scripe-auth-reveal relative flex items-center justify-center"
      style={{
        width: 280,
        height: 280,
        perspective: 800,
      }}
    >
      {/* Static Lime environmental glow — no continuous pulse */}
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
          background: "radial-gradient(circle at 30% 25%, #151719 0%, #050506 80%)",
          boxShadow:
            "0 30px 80px rgba(13,13,14,.35), inset 0 1px 0 rgba(255,255,255,.10), 0 0 0 1px rgba(198,255,0,.18)",
        }}
      />
      {/* The canonical 3D Relay Grid — protected asset, container tilts, never the geometry */}
      <div
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 200ms var(--scripe-ease-out, cubic-bezier(0.16, 1, 0.3, 1))",
          transformStyle: "preserve-3d",
        }}
      >
        <Image
          src="/brand/auth/login-relay-grid-3d.png"
          alt="SCRIPE"
          width={280}
          height={280}
          priority
          className="relative z-[1] object-contain"
          style={{
            width: 280,
            height: 280,
            mixBlendMode: "var(--sx-logo-blend)" as CSSProperties["mixBlendMode"],
            filter: "var(--sx-logo-filter)",
          }}
        />
      </div>
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
      className={`vault-stage login-page relative min-h-screen w-full overflow-hidden font-sans ${BG_STYLE}`}
      dir={direction}
      style={{ background: "var(--sx-bg-grad)", color: "var(--sx-text)" }}
    >
      <VaultBackground />

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

          {/* Canonical 3D mark */}
          <div className="self-center">
            <VaultLogoBlock />
          </div>

          {/* Headline block — solid ink, no gradient text (DESIGN.md ban) */}
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
                color: "var(--sx-text-heading)",
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
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
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
