"use client";

import type { CSSProperties } from "react";
import { motion, type Variants } from "framer-motion";
import { useDocsI18n } from "../../providers/DocsI18nProvider";
import { DocContent } from "./DocContent";
import type { DocSection } from "../../../domain/entities/DocSection";

interface CommercialContentProps {
  sections: DocSection[];
  titleKey: string;
  descriptionKey?: string;
  lastUpdated?: string;
  categoryInfo?: { id: string; titleKey: string };
}

// Signal data per category — right-column hero card
const CATEGORY_SIGNALS: Record<string, {
  label: string;
  value: string;
  detail: string;
  bars: number[];
  tag: string;
}> = {
  "commercial-why-scripe": {
    label: "Market motion",
    value: "B2B2C",
    detail: "Positioning, journeys, differentiation",
    bars: [62, 78, 54, 88, 72],
    tag: "Why SCRIPE",
  },
  "commercial-platform": {
    label: "Platform depth",
    value: "10+",
    detail: "Architecture, modules, deployments",
    bars: [82, 66, 90, 74, 58],
    tag: "Platform",
  },
  "commercial-enterprise": {
    label: "Enterprise readiness",
    value: "99.9%",
    detail: "Tenancy, security, audit, localization",
    bars: [72, 86, 80, 92, 70],
    tag: "Enterprise",
  },
  "commercial-security": {
    label: "Trust posture",
    value: "4-layer",
    detail: "Identity, data, infra, compliance",
    bars: [68, 84, 88, 76, 92],
    tag: "Security",
  },
  "commercial-pricing": {
    label: "Commercial model",
    value: "ARR",
    detail: "Pricing, ROI, investor paths",
    bars: [54, 72, 88, 80, 96],
    tag: "Commercial",
  },
  "commercial-modules": {
    label: "Revenue surface",
    value: "Open",
    detail: "Entitlements, billing, plugins",
    bars: [76, 82, 64, 90, 84],
    tag: "Modules",
  },
};

const DEFAULT_SIGNAL = {
  label: "Buyer signal",
  value: "Ready",
  detail: "Operational proof for commercial evaluation",
  bars: [64, 82, 70, 88, 76],
  tag: "Commercial",
};

const FLOW_STEPS = ["Evaluate", "Model", "Launch"];

export function CommercialContent({
  sections,
  titleKey,
  descriptionKey,
  lastUpdated,
  categoryInfo,
}: CommercialContentProps) {
  const { t } = useDocsI18n();

  const headings = sections.filter(
    (s): s is Extract<DocSection, { type: "heading" }> => s.type === "heading"
  );

  const signal = CATEGORY_SIGNALS[categoryInfo?.id ?? ""] ?? DEFAULT_SIGNAL;

  const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.06 } },
  };

  const itemVariant: Variants = {
    hidden: { opacity: 0, y: 18 },
    show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
  };

  return (
    <article data-category={categoryInfo?.id ?? "commercial-general"}>
      {/* ── Page Hero ──────────────────────────────────────────────── */}
      <header className="com-page-hero">
        <div className="com-page-hero-inner">
          {/* Left: copy */}
          <motion.div
            className="com-page-hero-copy"
            initial="hidden"
            animate="show"
            variants={containerVariants}
          >
            {/* Kicker tags */}
            <motion.div className="com-page-hero-kicker" variants={itemVariant}>
              <span className="com-page-hero-tag com-page-hero-tag--accent">
                {categoryInfo ? t(categoryInfo.titleKey) : "Commercial"}
              </span>
              <span className="com-page-hero-tag">Decision memo</span>
              {lastUpdated && (
                <span className="com-page-hero-tag">Updated {lastUpdated}</span>
              )}
            </motion.div>

            {/* Title */}
            <motion.h1 className="com-page-hero-title" variants={itemVariant}>
              {t(titleKey)}
            </motion.h1>

            {/* Description */}
            {descriptionKey && (
              <motion.p className="com-page-hero-desc" variants={itemVariant}>
                {t(descriptionKey)}
              </motion.p>
            )}

            {/* Meta badges */}
            <motion.div
              className="com-page-hero-meta"
              variants={itemVariant}
              aria-label="Document properties"
            >
              <span>Buyer-ready</span>
              <span>Founder-grade detail</span>
              <span>{signal.tag}</span>
            </motion.div>
          </motion.div>

          {/* Right: signal card */}
          <motion.div
            className="com-signal-card"
            aria-hidden="true"
            initial={{ opacity: 0, y: 24, rotateX: 6 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 0.85, delay: 0.12, ease: EASE }}
          >
            <div className="com-signal-row">
              <span className="com-signal-label">{signal.label}</span>
              <span className="com-signal-value">{signal.value}</span>
            </div>

            <p className="com-signal-detail">{signal.detail}</p>

            <div className="com-signal-bars">
              {signal.bars.map((bar, i) => (
                <div
                  key={i}
                  className="com-signal-bar"
                  style={{ "--bar": `${bar}%`, "--delay": `${i * 80}ms` } as CSSProperties}
                />
              ))}
            </div>

            <div className="com-signal-flow">
              {FLOW_STEPS.map((step) => (
                <span key={step}>{step}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </header>

      {/* ── Content Area ───────────────────────────────────────────── */}
      <div className="com-content-area">
        {/* TOC Rail */}
        {headings.length > 0 && (
          <aside className="com-content-rail" aria-label="On this page" style={{ order: 2 }}>
            <span>On this page</span>
            <nav aria-label="Table of contents">
              {headings.slice(0, 10).map((heading) => {
                const id =
                  heading.id ||
                  heading.titleKey.split(".").pop() ||
                  heading.titleKey;
                return (
                  <a key={id} href={`#${id}`}>
                    {t(heading.titleKey)}
                  </a>
                );
              })}
            </nav>
          </aside>
        )}

        {/* Main content */}
        <div className="com-content-body" style={{ order: 1 }}>
          <DocContent sections={sections} />
        </div>
      </div>
    </article>
  );
}