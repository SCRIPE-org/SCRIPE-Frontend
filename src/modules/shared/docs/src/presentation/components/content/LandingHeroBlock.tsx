"use client";

import type { CSSProperties } from "react";
import { useRef } from "react";
import Link from "next/link";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { usePublicPlatformStats } from "../../hooks/usePublicPlatformStats";
import type { LandingHeroBlockSection } from "../../../domain/entities/DocSection";

/* ── Constants ────────────────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Product module tiles. Names/icons/colors are a deliberate marketing-curated
 * subset (not the full internal module list). Values are never invented —
 * "Active" states a real, safe fact about the deployment; the Tenants tile's
 * value comes from the real platform-stats endpoint (see PlatformModuleTile).
 *
 * Colors: Identity is the flagship tile and gets the one committed Lime
 * signal; Tenants/Entitlements are neutral (light/dark mineral-graphite)
 * rather than a second saturated brand hue — the retired violet+cyan duo
 * both these used to read as no longer exists as two distinct colors.
 * Billing/Marketplace/Docs keep their existing semantic-adjacent hues.
 */
const PLATFORM_MODULES = [
  { id: "identity", icon: "ID", name: "Identity", color: "oklch(0.91 0.24 128)" },
  { id: "tenants", icon: "TN", name: "Tenants", color: "oklch(0.75 0.02 128)" },
  { id: "billing", icon: "BI", name: "Billing", color: "oklch(0.79 0.17 160)" },
  { id: "marketplace", icon: "MK", name: "Marketplace", color: "oklch(0.82 0.155 80)" },
  { id: "docs", icon: "DC", name: "Docs", color: "oklch(0.65 0.22 20)" },
  { id: "entitlement", icon: "EN", name: "Entitlements", color: "oklch(0.55 0.02 128)" },
] as const;

const MARQUEE_ITEMS = [
  ".NET 10",
  "Next.js 16",
  "Multi-Tenant",
  "CQRS",
  "Clean Architecture",
  "99.9% SLA",
  "SOC 2 Type II",
  "GDPR",
  "Redis",
  "Hangfire",
  "Entity Framework",
  "Stripe",
  "OpenTelemetry",
  "Docker",
  "PostgreSQL",
];

/* ── Icons ─────────────────────────────────────────────────────────────── */
const ArrowIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlayIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

/* ── Animation variants ────────────────────────────────────────────────── */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.055, delayChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(7px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.65, ease: EASE } },
};

/* ── Word split helper ─────────────────────────────────────────────────── */
function SplitWords({ text, gradient }: { text: string; gradient?: boolean }) {
  if (gradient) {
    /*
     * DEFINITIVE FIX for Chromium background-clip:text colored-block bug:
     * Any element animated by Framer Motion (opacity, y, filter) gets
     * will-change:transform set, which creates a GPU compositing layer.
     * background-clip:text does NOT work across compositing layer boundaries.
     *
     * Solution: plain HTML <span> + CSS @keyframes only (no JS animation).
     * CSS animations don't promote the element to a separate GPU layer.
     */
    return (
      <span className="com-hero-gradient-line" aria-label={text}>
        {text}
      </span>
    );
  }

  const words = text.split(" ");
  return (
    <>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          className="com-hero-word"
          variants={fadeUp}
          style={{ "--i": i } as CSSProperties}
        >
          {word}
        </motion.span>
      ))}
    </>
  );
}

/* ── Floating stat badge ───────────────────────────────────────────────── */
function FloatBadge({
  value,
  label,
  color,
  delay = 0,
  style,
}: {
  value: string;
  label: string;
  color: string;
  delay?: number;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className="com-float-badge"
      initial={{ opacity: 0, scale: 0.7, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      style={style}
    >
      <span className="com-float-badge-dot" style={{ background: color }} />
      <span className="com-float-badge-val" style={{ color }}>
        {value}
      </span>
      <span className="com-float-badge-label">{label}</span>
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */
export function LandingHeroBlock({ section }: { section: LandingHeroBlockSection }) {
  const { t } = useDocsI18n();
  const { stats } = usePublicPlatformStats();
  const heroRef = useRef<HTMLElement>(null);

  /* Scroll-driven parallax */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);

  return (
    <>
      {/* ════════════════════════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════════════════════════ */}
      <section className="com-hero" ref={heroRef} aria-labelledby="commercial-hero-title">
        {/* Background layers */}
        <motion.div className="com-hero-bg" style={{ y: bgY }} aria-hidden="true" />
        <div className="com-hero-grid" aria-hidden="true" />
        <div className="com-hero-noise" aria-hidden="true" />

        {/* Orbital rings */}
        <div className="com-hero-orb-ring com-hero-orb-ring--1" aria-hidden="true" />
        <div className="com-hero-orb-ring com-hero-orb-ring--2" aria-hidden="true" />

        <div className="com-hero-inner">
          {/* ── Left: Copy ─────────────────────────────────────────────── */}
          <motion.div
            className="com-hero-copy"
            style={{ y: copyY }}
            initial="hidden"
            animate="show"
            variants={stagger}
          >
            {/* Kicker badge */}
            <motion.div className="com-hero-badge" variants={fadeUp} aria-label="Live platform">
              <span className="com-hero-badge-dot" aria-hidden="true" />
              {section.kickerKey ? t(section.kickerKey) : "The B2B2C SaaS Platform"}
            </motion.div>

            {/* Main headline */}
            <motion.h1 id="commercial-hero-title" className="com-hero-title" variants={stagger}>
              <SplitWords text={t(section.title1Key)} gradient={false} />
              {section.title2Key && (
                <>
                  {" "}
                  <SplitWords text={t(section.title2Key)} gradient />
                </>
              )}
            </motion.h1>

            {/* Subtitle */}
            <motion.p className="com-hero-subtitle" variants={fadeUp}>
              {t(section.subtitleKey)}
            </motion.p>

            {/* CTAs */}
            <motion.div className="com-hero-ctas" variants={fadeUp}>
              <Link
                href={section.primaryCtaHref}
                prefetch={false}
                className="com-btn com-btn--primary com-btn--hero"
              >
                {t(section.primaryCtaKey)}
                <ArrowIcon />
              </Link>
              <button type="button" className="com-btn com-btn--play">
                <span className="com-btn-play-ring">
                  <PlayIcon />
                </span>
                Watch demo
              </button>
            </motion.div>

            {/* Trust strip */}
            <motion.div className="com-hero-trust" variants={fadeUp} aria-label="Certifications">
              {["SOC 2 Type II", "GDPR Compliant", "99.9% SLA"].map((item) => (
                <span key={item} className="com-hero-trust-item">
                  <CheckIcon />
                  {item}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Product card ────────────────────────────────────── */}
          <motion.div
            className="com-hero-product"
            style={{ y: cardY }}
            initial={{ opacity: 0, y: 48, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
            aria-hidden="true"
          >
            {/* Floating mini badges — real platform counts, never invented */}
            <FloatBadge
              value={stats ? stats.activeTenants.toLocaleString() : "—"}
              label="Tenants"
              color="oklch(0.79 0.17 160)"
              delay={0.9}
              style={{ position: "absolute", top: "-18px", right: "12%", zIndex: 3 }}
            />
            <FloatBadge
              value={stats ? `${stats.activeModules} active` : "Live"}
              label="Modules"
              color="oklch(0.91 0.24 128)"
              delay={1.1}
              style={{ position: "absolute", bottom: "40px", left: "-20px", zIndex: 3 }}
            />

            <div className="com-product-card">
              {/* Window chrome */}
              <div className="com-product-bar">
                <div className="com-product-dots">
                  <div className="com-product-dot" />
                  <div className="com-product-dot" />
                  <div className="com-product-dot" />
                </div>
                <span className="com-product-bar-title">scripe · commercial-os · live</span>
                <span className="com-product-bar-status">
                  <span className="com-product-bar-pulse" />
                  Running
                </span>
              </div>

              {/* Module grid */}
              <div className="com-product-modules">
                {PLATFORM_MODULES.map((mod, i) => (
                  <motion.div
                    key={mod.id}
                    className="com-product-module"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.35 + i * 0.06, ease: EASE }}
                  >
                    <div
                      className="com-product-module-icon"
                      style={{
                        background: `color-mix(in oklch, ${mod.color} 18%, oklch(0.08 0.02 270))`,
                        border: `1px solid color-mix(in oklch, ${mod.color} 30%, transparent)`,
                      }}
                    >
                      <span style={{ color: mod.color, fontSize: "0.6rem", fontWeight: 900 }}>
                        {mod.icon}
                      </span>
                    </div>
                    <span className="com-product-module-name">{mod.name}</span>
                    <span className="com-product-module-val" style={{ color: mod.color }}>
                      {mod.id === "tenants"
                        ? stats
                          ? stats.activeTenants.toLocaleString()
                          : "—"
                        : "Active"}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Platform stats — real tenant count, no chart is drawn since
                  there is no real time-series here to plot (no invented sparkline). */}
              <div className="com-product-chart">
                <div className="com-product-chart-head">
                  <span className="com-product-chart-label">Platform</span>
                  <span className="com-product-chart-val">
                    {stats ? stats.activeTenants.toLocaleString() : "—"}
                    <span className="com-product-chart-delta">tenants</span>
                  </span>
                </div>
              </div>

              {/* Card footer */}
              <div className="com-product-footer">
                <span className="com-product-footer-modules">
                  <span className="com-product-footer-dot" />
                  {stats ? stats.activeModules : PLATFORM_MODULES.length} modules active
                </span>
                <span className="com-product-footer-growth">{stats?.uptimeSla ?? "99.9%"} uptime</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="com-hero-scroll"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          aria-hidden="true"
        >
          <div className="com-hero-scroll-line" />
        </motion.div>
      </section>

      {/* ════════════════════════════════════════════════════════════════
          MARQUEE STRIP
      ════════════════════════════════════════════════════════════════ */}
      <div className="com-marquee-section" aria-hidden="true">
        <div className="com-marquee-track">
          {MARQUEE_ITEMS.map((item, i) => (
            <div key={`${item}-${i}`} className="com-marquee-item">
              <span className="com-marquee-dot" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
