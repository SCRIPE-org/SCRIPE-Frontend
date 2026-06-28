"use client";

import type { CSSProperties } from "react";
import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { motion, type Variants, useScroll, useTransform } from "framer-motion";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import type { LandingHeroBlockSection } from "../../../domain/entities/DocSection";

/* ── Constants ────────────────────────────────────────────────────────── */
const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const PLATFORM_MODULES = [
  { id: "identity",     icon: "ID", name: "Identity",     val: "2.4k",   color: "oklch(0.72 0.22 296)" },
  { id: "tenants",      icon: "TN", name: "Tenants",      val: "148",    color: "oklch(0.84 0.155 213)" },
  { id: "billing",      icon: "BI", name: "Billing",      val: "$84k",   color: "oklch(0.79 0.17 160)" },
  { id: "marketplace",  icon: "MK", name: "Marketplace",  val: "23",     color: "oklch(0.82 0.155 80)" },
  { id: "docs",         icon: "DC", name: "Docs",         val: "v3.5",   color: "oklch(0.65 0.22 20)" },
  { id: "entitlement",  icon: "EN", name: "Entitlements", val: "Active", color: "oklch(0.72 0.22 296)" },
] as const;

const MARQUEE_ITEMS = [
  ".NET 10", "Next.js 16", "Multi-Tenant", "CQRS", "Clean Architecture",
  "99.9% SLA", "SOC 2 Type II", "GDPR", "Redis", "Hangfire",
  "Entity Framework", "Stripe", "OpenTelemetry", "Docker", "PostgreSQL",
  ".NET 10", "Next.js 16", "Multi-Tenant", "CQRS", "Clean Architecture",
  "99.9% SLA", "SOC 2 Type II", "GDPR", "Redis", "Hangfire",
  "Entity Framework", "Stripe", "OpenTelemetry", "Docker", "PostgreSQL",
];

const SPARK_POINTS = [
  { x: 0, y: 48 }, { x: 30, y: 40 }, { x: 60, y: 44 },
  { x: 90, y: 30 }, { x: 120, y: 36 }, { x: 150, y: 22 },
  { x: 180, y: 26 }, { x: 210, y: 14 }, { x: 240, y: 18 },
  { x: 270, y: 8 },  { x: 300, y: 10 },
];

function buildSparkPath(pts: typeof SPARK_POINTS): string {
  return pts.reduce((acc, pt, i) => {
    if (i === 0) return `M ${pt.x} ${pt.y}`;
    const prev = pts[i - 1];
    const cpx = prev.x + (pt.x - prev.x) / 2;
    return `${acc} C ${cpx} ${prev.y} ${cpx} ${pt.y} ${pt.x} ${pt.y}`;
  }, "");
}

function buildSparkArea(pts: typeof SPARK_POINTS): string {
  const line = buildSparkPath(pts);
  const last = pts[pts.length - 1];
  return `${line} L ${last.x} 52 L 0 52 Z`;
}

/* ── Icons ─────────────────────────────────────────────────────────────── */
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
  show:   { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.65, ease: EASE } },
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
  value, label, color, delay = 0, style
}: { value: string; label: string; color: string; delay?: number; style?: CSSProperties }) {
  return (
    <motion.div
      className="com-float-badge"
      initial={{ opacity: 0, scale: 0.7, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE }}
      style={style}
    >
      <span className="com-float-badge-dot" style={{ background: color }} />
      <span className="com-float-badge-val" style={{ color }}>{value}</span>
      <span className="com-float-badge-label">{label}</span>
    </motion.div>
  );
}

/* ── Main component ────────────────────────────────────────────────────── */
export function LandingHeroBlock({ section }: { section: LandingHeroBlockSection }) {
  const { t } = useDocsI18n();
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  /* Scroll-driven parallax */
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const copyY = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const cardY = useTransform(scrollYProgress, [0, 1], [0, -30]);
  const bgY   = useTransform(scrollYProgress, [0, 1], [0, 80]);

  useEffect(() => {
    setMounted(true);
    const card = cardRef.current;
    if (!card) return;

    const onMove = (e: MouseEvent) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      card.style.transition = "transform 80ms linear";
      card.style.transform = `perspective(1400px) rotateY(${x * 12 - 4}deg) rotateX(${-y * 9 + 2}deg) translateY(-6px)`;
    };

    const onLeave = () => {
      card.style.transition = "transform 700ms cubic-bezier(0.16, 1, 0.3, 1)";
      card.style.transform = "perspective(1400px) rotateY(-4deg) rotateX(2deg)";
    };

    card.addEventListener("mousemove", onMove as EventListener);
    card.addEventListener("mouseleave", onLeave);
    return () => {
      card.removeEventListener("mousemove", onMove as EventListener);
      card.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const sparkPath = buildSparkPath(SPARK_POINTS);
  const sparkArea = buildSparkArea(SPARK_POINTS);

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
              <span className="com-hero-badge-ring" aria-hidden="true" />
              <span className="com-hero-badge-dot" aria-hidden="true" />
              {section.kickerKey ? t(section.kickerKey) : "The B2B2C SaaS Platform"}
            </motion.div>

            {/* Main headline */}
            <motion.h1
              id="commercial-hero-title"
              className="com-hero-title"
              variants={stagger}
            >
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
              <Link href={section.primaryCtaHref} className="com-btn com-btn--primary com-btn--hero">
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

            {/* Stat row */}
            <motion.div className="com-hero-stats" variants={fadeUp} aria-label="Platform statistics">
              {[
                { val: "2,400+", label: "Active users" },
                { val: "$84k",   label: "MRR tracked" },
                { val: "148",    label: "Live tenants" },
              ].map((s) => (
                <div key={s.label} className="com-hero-stat">
                  <strong>{s.val}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* ── Right: Product card ────────────────────────────────────── */}
          <motion.div
            className="com-hero-product"
            style={{ y: cardY }}
            initial={{ opacity: 0, y: 48, filter: "blur(16px)" }}
            animate={{ opacity: 1, y: 0,  filter: "blur(0px)"  }}
            transition={{ duration: 1.1, ease: EASE, delay: 0.2 }}
            aria-hidden="true"
          >
            {/* Floating mini badges */}
            <FloatBadge value="+12.4%" label="MRR growth" color="oklch(0.79 0.17 160)"
              delay={0.9} style={{ position: "absolute", top: "-18px", right: "12%", zIndex: 3 }} />
            <FloatBadge value="6 active" label="Modules" color="oklch(0.72 0.22 296)"
              delay={1.1} style={{ position: "absolute", bottom: "40px", left: "-20px", zIndex: 3 }} />

            <div className="com-product-card" ref={cardRef}>
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
                      <span style={{ color: mod.color, fontSize: "0.6rem", fontWeight: 900 }}>{mod.icon}</span>
                    </div>
                    <span className="com-product-module-name">{mod.name}</span>
                    <span className="com-product-module-val" style={{ color: mod.color }}>{mod.val}</span>
                  </motion.div>
                ))}
              </div>

              {/* Revenue chart */}
              <div className="com-product-chart">
                <div className="com-product-chart-head">
                  <span className="com-product-chart-label">Monthly Revenue</span>
                  <span className="com-product-chart-val">
                    $84,231
                    <span className="com-product-chart-delta">+12.4%</span>
                  </span>
                </div>
                {mounted && (
                  <svg className="com-product-sparkline" viewBox="0 0 300 52"
                    preserveAspectRatio="none" aria-hidden="true">
                    <defs>
                      <linearGradient id="sparkG" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%"   stopColor="oklch(0.84 0.155 213)" />
                        <stop offset="100%" stopColor="oklch(0.72 0.22 296)" />
                      </linearGradient>
                      <linearGradient id="sparkA" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="oklch(0.72 0.22 296)" stopOpacity="0.28" />
                        <stop offset="100%" stopColor="oklch(0.72 0.22 296)" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={sparkArea} fill="url(#sparkA)" />
                    <path d={sparkPath} stroke="url(#sparkG)" strokeWidth="2" fill="none" />
                    {/* Live dot */}
                    <circle cx="300" cy="10" r="3.5" fill="oklch(0.79 0.17 160)" />
                    <circle cx="300" cy="10" r="6" fill="oklch(0.79 0.17 160)" fillOpacity="0.3" />
                  </svg>
                )}
              </div>

              {/* Card footer */}
              <div className="com-product-footer">
                <span className="com-product-footer-modules">
                  <span className="com-product-footer-dot" />
                  6 modules active
                </span>
                <span className="com-product-footer-growth">
                  ↑ +12% this week
                </span>
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
