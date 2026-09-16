/**
 * HeroProductCard — Interactive platform simulation card displaying live tenant counts,
 * module status, and simulated window chrome for documentation hero sections.
 */

import React, { type CSSProperties } from "react";
import { motion, type MotionValue } from "framer-motion";
import type { PublicPlatformStatsResponse } from "../../hooks/usePublicPlatformStats";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/**
 * Product module descriptor tiles displaying curated platform capabilities and telemetry metrics.
 */
export const PLATFORM_MODULES = [
  { id: "identity", icon: "ID", name: "Identity", color: "oklch(0.91 0.24 128)" },
  { id: "tenants", icon: "TN", name: "Tenants", color: "oklch(0.75 0.02 128)" },
  { id: "billing", icon: "BI", name: "Billing", color: "oklch(0.79 0.17 160)" },
  { id: "marketplace", icon: "MK", name: "Marketplace", color: "oklch(0.82 0.155 80)" },
  { id: "docs", icon: "DC", name: "Docs", color: "oklch(0.65 0.22 20)" },
  { id: "entitlement", icon: "EN", name: "Entitlements", color: "oklch(0.55 0.02 128)" },
] as const;

/**
 * Props for the floating metric badge indicator.
 */
export interface FloatBadgeProps {
  /** Numerical or text metric value */
  value: string;
  /** Explanatory descriptor label */
  label: string;
  /** Semantic accent dot and text color */
  color: string;
  /** Entrance animation delay in seconds */
  delay?: number;
  /** Absolute positioning and layout overrides */
  style?: CSSProperties;
}

/**
 * Floating badge displaying platform statistics with subtle entrance animation.
 *
 * @param props Badge configuration attributes.
 * @returns Rendered floating badge element.
 */
export function FloatBadge({ value, label, color, delay = 0, style }: FloatBadgeProps) {
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

/**
 * Props for the hero product preview card.
 */
export interface HeroProductCardProps {
  /** Vertical scroll parallax motion value */
  cardY: MotionValue<number>;
  /** Live or cached public platform telemetry stats */
  stats: PublicPlatformStatsResponse | null | undefined;
}

/**
 * Hero product preview window featuring interactive module cards, status indicators, and uptime telemetry.
 *
 * @param props Card properties including scroll animation and platform statistics.
 * @returns Rendered product preview card.
 */
export function HeroProductCard({ cardY, stats }: HeroProductCardProps) {
  return (
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

        {/* Platform stats */}
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
  );
}
