"use client";

import { useEffect, useRef, useState } from "react";
import { SlotRenderer } from "../SlotRenderer";
import { LogoImg, MobileLogo } from "./layout-shared";
import { BG_STYLE } from "./layout-types";
import type { LoginLayoutProps } from "./layout-types";

/**
 * VaultLayout — the "Showroom" split auth layout.
 *
 * Left: a cinematic stage built like a product showroom. The canonical 3D
 * Relay Grid stands as a monument on a full-width horizon line, reflected
 * in the floor beneath it (DESIGN.md's cinematic clause explicitly allows
 * environmental Lime reflection for login), lit by one grounded pool of
 * Signal Lime stage light that breathes slowly. Below the monument: a
 * centered editorial headline with exactly one word in Lime, a muted
 * standfirst, and a footer carrying the product family + compliance marks
 * above a hairline. Structured light on a floor — never floating blobs,
 * grids, or particles.
 *
 * Right: calm high-contrast form card, untouched product logic.
 *
 * Motion: the monument settles onto the horizon (650ms), the stage light
 * fades up then breathes (9s, opacity only), the headline lines rise out of
 * clipping masks, supporting text fades to present. Fine-pointer parallax
 * tilts the monument container ±2° — never the mark's geometry. Reduced
 * motion renders everything in place, static.
 *
 * Every color reads from the `--sx-*` token layer (globals.css, themed
 * dark/light) — no hardcoded hex.
 */
import { VaultBackground } from "./VaultBackground";
import Image from "next/image";

/** The three product family names are brand nouns — they do not localize. */
const PRODUCT_FAMILY = ["Venue", "Academy", "Football Intelligence"];

/**
 * The canonical 3D Relay Grid as a monument on the stage horizon: the mark,
 * its floor reflection, and the grounded pool of stage light. Container-level
 * presentation only — the image is never cropped, recolored, or upscaled
 * beyond its native 1254x1254 source (V3 fidelity policy).
 */
function Monument() {
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

  // The glyph sits off-center inside its 1254px canvas (alpha bbox: x 60-1252,
  // y 124-1068). translateX(-2.3%) optically centers it; the ground shadow at
  // bottom 12% lands at the glyph's true feet instead of the canvas edge.
  const markStyle = {
    width: "clamp(300px, 26vw, 400px)",
    height: "auto",
    transform: "translateX(-2.3%)",
  } as const;

  return (
    <div
      ref={wrapRef}
      className="scripe-monument scripe-monument-settle relative flex justify-center"
      style={{ perspective: 900 }}
    >
      <div
        className="relative"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 200ms var(--scripe-ease-out, cubic-bezier(0.16, 1, 0.3, 1))",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Ground shadow — product-photography contact shadow at the glyph's
            true feet, the only staging the object needs */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: "50%",
            bottom: "10.5%",
            transform: "translateX(-50%)",
            width: "58%",
            height: 30,
            background: "radial-gradient(ellipse, rgba(0, 0, 0, 0.32) 0%, transparent 68%)",
            filter: "blur(10px)",
          }}
        />
        <Image
          src="/brand/auth/login-relay-grid-3d.png"
          alt=""
          width={400}
          height={400}
          sizes="400px"
          priority
          className="relative object-contain"
          style={markStyle}
          aria-hidden="true"
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
        {/* ── Showroom stage (desktop) ─────────────────────────────── */}
        <div className="relative hidden flex-col justify-between px-12 py-10 lg:flex xl:px-16">
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

          {/* Scene — the product shot, then the words. The negative margin
              swallows the PNG canvas's ~15% transparent bottom padding so the
              headline relates to the glyph's feet, not the file's edge. */}
          <div className="flex flex-col items-center">
            <div style={{ marginBottom: "max(-3vw, -44px)" }}>
              <Monument />
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

          {/* Stage footer — product family above compliance, one hairline */}
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
