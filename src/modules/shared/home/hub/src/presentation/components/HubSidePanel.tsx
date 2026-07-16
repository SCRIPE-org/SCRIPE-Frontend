// UI-EXCEPTION: compact studio layout
"use client";

/**
 * HubSidePanel — Right-side panel with Today activity card + Recent items.
 *
 * Two glassmorphism cards stacked vertically.
 * Accepts real activity data via props (from useHubActivity hook in parent).
 */

import React from "react";
import { Activity, ArrowUp, ArrowDown } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";

// ── Props ─────────────────────────────────────────────────────────────────────

/**
 * Interface defining property specifications, keys types, and structural contract rules for hub side panel props.
 */
export interface HubSidePanelProps {
  todayCount: number;
  moduleCount: number;
  trendPercent: number;
  recentItems: Array<{
    icon: string;
    label: string;
    meta: string;
    grad: string;
    glow: string;
  }>;
  isLoading?: boolean;
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Presentation UI component rendering the hub side panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function HubSidePanel({
  todayCount,
  moduleCount,
  trendPercent,
  recentItems,
  isLoading = false,
}: HubSidePanelProps) {
  const { t } = useI18n();

  const trendUp = trendPercent >= 0;
  const trendLabel = trendUp ? `+${trendPercent}%` : `${trendPercent}%`;
  const trendColor = trendUp ? "#7BE7B0" : "#F04E5A";
  const TrendIcon = trendUp ? ArrowUp : ArrowDown;

  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Today activity card */}
      <div
        style={{
          padding: 20,
          borderRadius: 18,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <span
            style={{
              width: 22,
              height: 22,
              borderRadius: 6,
              background: "rgba(124,139,255,0.18)",
              border: "1px solid rgba(124,139,255,0.28)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#9DA9FF",
            }}
          >
            <Activity size={12} strokeWidth={2} />
          </span>
          <h3
            style={{
              margin: 0,
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              color: "rgba(230,233,245,0.7)",
            }}
          >
            {t("workspaceHub.today.title")}
          </h3>
        </div>

        {/* Big stat */}
        <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <div
            style={{
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "#f6f7fb",
              fontVariantNumeric: "tabular-nums",
              opacity: isLoading ? 0.4 : 1,
              transition: "opacity 300ms ease",
            }}
          >
            {isLoading ? "—" : todayCount}
          </div>
          <div style={{ fontSize: 12, color: "rgba(230,233,245,0.55)" }}>
            {t("workspaceHub.today.actions")}{" "}
            <span style={{ color: "#e6e9f5" }}>
              {moduleCount}{" "}
              {moduleCount === 1
                ? t("workspaceHub.today.modules_one")
                : t("workspaceHub.today.modules_other", { count: moduleCount })}
            </span>
          </div>
        </div>

        {/* Sparkline */}
        <svg
          viewBox="0 0 280 44"
          preserveAspectRatio="none"
          style={{ width: "100%", height: 44, marginTop: 12, display: "block" }}
        >
          <defs>
            <linearGradient id="nx-hub-spark-g" x1="0" y1="0" x2="0" y2="1">
              <stop stopColor="#7C8BFF" stopOpacity="0.5" />
              <stop offset="1" stopColor="#7C8BFF" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d="M0,32 L28,30 L56,24 L84,28 L112,18 L140,22 L168,12 L196,18 L224,8 L252,14 L280,4"
            stroke="#9DA9FF"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0,32 L28,30 L56,24 L84,28 L112,18 L140,22 L168,12 L196,18 L224,8 L252,14 L280,4 L280,44 L0,44 Z"
            fill="url(#nx-hub-spark-g)"
          />
        </svg>

        {/* Trend */}
        <div
          style={{
            marginTop: 12,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.05)",
            fontSize: 11.5,
            color: "rgba(230,233,245,0.5)",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span style={{ color: trendUp ? "#5DE0A0" : "#F04E5A" }}>
            <TrendIcon size={12} strokeWidth={2.2} />
          </span>
          <span style={{ color: trendColor, fontWeight: 600 }}>{trendLabel}</span>
          <span>{t("workspaceHub.today.vsYesterday")}</span>
        </div>
      </div>

      {/* Recent items card */}
      <div
        style={{
          padding: 20,
          borderRadius: 18,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.015) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          flex: 1,
        }}
      >
        <h3
          style={{
            margin: "0 0 14px",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            color: "rgba(230,233,245,0.7)",
          }}
        >
          {t("workspaceHub.recent.title")}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {recentItems.length === 0 && !isLoading && (
            <div
              style={{
                fontSize: 12,
                color: "rgba(230,233,245,0.35)",
                padding: "12px 0",
                textAlign: "center",
              }}
            >
              {t("workspaceHub.recent.empty")}
            </div>
          )}
          {recentItems.map((item, i) => (
            <RecentRow key={i} {...item} />
          ))}
        </div>
      </div>
    </aside>
  );
}

// ── Recent row component ─────────────────────────────────────────────────────

function RecentRow({
  icon,
  label,
  meta,
  grad,
  glow,
}: {
  icon: string;
  label: string;
  meta: string;
  grad: string;
  glow: string;
}) {
  const [hover, setHover] = React.useState(false);

  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 10px",
        borderRadius: 10,
        border: hover ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
        background: hover ? "rgba(255,255,255,0.035)" : "transparent",
        color: "inherit",
        textAlign: "start",
        cursor: "pointer",
        transition: "background 160ms ease, border-color 160ms ease",
        fontFamily: "inherit",
      }}
    >
      <span
        style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          flexShrink: 0,
          background: grad,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          boxShadow: `0 4px 12px -4px rgba(${glow}, 0.55)`,
        }}
      >
        <DynamicIcon name={icon} size={14} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            display: "block",
            fontSize: 12.5,
            fontWeight: 500,
            color: "#e6e9f5",
            letterSpacing: "-0.005em",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
        <span style={{ fontSize: 11, color: "rgba(230,233,245,0.45)" }}>{meta}</span>
      </span>
    </button>
  );
}
