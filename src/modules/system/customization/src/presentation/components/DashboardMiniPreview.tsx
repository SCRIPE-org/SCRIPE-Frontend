/**
 * DashboardMiniPreview — Live miniature preview of dashboard settings
 *
 * Renders a compact (100% width × ~180px) preview card showing a simplified
 * dashboard mockup that updates in real-time as settings change in the builder.
 *
 * Shows: sidebar, header, content cards, color theme, card style, layout hints.
 *
 * @module customization/presentation/components
 */
"use client";

import { useMemo } from "react";
import { cn } from "@/core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import type { DashboardThemeSettings } from "../../domain/entities/StudioDraft";

// ── Color palette for theme preview ──
const THEME_COLORS: Record<string, string> = {
  purple: "#8b5cf6", blue: "#3b82f6", green: "#22c55e", orange: "#f97316",
  red: "#ef4444", teal: "#14b8a6", pink: "#ec4899", indigo: "#6366f1",
  cyan: "#06b6d4", amber: "#f59e0b", yellow: "#eab308", lime: "#84cc16",
  emerald: "#10b981", sky: "#0ea5e9", violet: "#7c3aed", fuchsia: "#d946ef",
  rose: "#f43f5e", slate: "#64748b", zinc: "#71717a", stone: "#78716c",
  gold: "#d4a017", coral: "#ff6b6b",
};

// ── Background colors for light/dark themes ──
const LIGHT_BG_COLORS: Record<string, string> = {
  default: "#ffffff", warm: "#fefcf8", cool: "#f0f4f8", neutral: "#f5f5f5",
  soft: "#faf8ff", cream: "#fffbeb", mint: "#f0fdf4", lavender: "#faf5ff",
  rose: "#fff1f2", sky: "#f0f9ff", sand: "#fef6e4", pearl: "#fafaf9",
  ice: "#ecfeff", linen: "#fdf8f6", cloud: "#f8fafc", snow: "#fafafa",
};

const DARK_BG_COLORS: Record<string, string> = {
  default: "#0a0a0a", darker: "#050505", pitch: "#000000", slate: "#0f172a",
  "warm-dark": "#1c1917", forest: "#052e16", ocean: "#0c4a6e", "purple-dark": "#1e1b4b",
  crimson: "#450a0a", midnight: "#0f1729", charcoal: "#1a1a2e", obsidian: "#0d0d0d",
  navy: "#0a192f", graphite: "#1f2937", onyx: "#111111", volcanic: "#1a0a0a",
};

interface DashboardMiniPreviewProps {
  settings: DashboardThemeSettings;
}

export function DashboardMiniPreview({ settings }: DashboardMiniPreviewProps) {
  const { t, direction } = useI18n();
  const isRTL = direction === "rtl";

  // Resolve colors from settings
  const primaryColor = useMemo(() => {
    if (settings.customPrimaryColor && settings.backgroundMode === "custom") {
      return settings.customPrimaryColor;
    }
    return THEME_COLORS[settings.colorTheme || "blue"] || "#3b82f6";
  }, [settings.colorTheme, settings.customPrimaryColor, settings.backgroundMode]);

  const bgColor = useMemo(() => {
    if (settings.backgroundMode === "custom" && settings.customDarkBgColor) {
      return settings.customDarkBgColor;
    }
    return DARK_BG_COLORS[settings.darkBackgroundTheme || "default"] || "#0a0a0a";
  }, [settings.darkBackgroundTheme, settings.customDarkBgColor, settings.backgroundMode]);

  const lightBgColor = useMemo(() => {
    if (settings.backgroundMode === "custom" && settings.customLightBgColor) {
      return settings.customLightBgColor;
    }
    return LIGHT_BG_COLORS[settings.lightBackgroundTheme || "default"] || "#ffffff";
  }, [settings.lightBackgroundTheme, settings.customLightBgColor, settings.backgroundMode]);

  // Resolve gradient if applicable
  const bgStyle = useMemo(() => {
    if (settings.backgroundMode === "gradient" && settings.gradientStartColor && settings.gradientEndColor) {
      const dirMap: Record<string, string> = {
        "to-t": "to top", "to-tr": "to top right", "to-r": "to right",
        "to-br": "to bottom right", "to-b": "to bottom", "to-bl": "to bottom left",
        "to-l": "to left", "to-tl": "to top left",
      };
      const dir = dirMap[settings.gradientDirection || "to-br"] || "to bottom right";
      return {
        background: `linear-gradient(${dir}, ${settings.gradientStartColor}, ${settings.gradientEndColor})`,
      };
    }
    return { background: bgColor };
  }, [settings.backgroundMode, settings.gradientStartColor, settings.gradientEndColor, settings.gradientDirection, bgColor]);

  // Border radius mapping
  const radiusMap: Record<string, string> = {
    none: "0px", small: "4px", default: "6px", large: "10px", full: "14px",
  };
  const radius = radiusMap[settings.borderRadius || "default"] || "6px";

  // Card style classes
  const getCardBorder = () => {
    switch (settings.cardStyle) {
      case "bordered": return `1px solid ${primaryColor}30`;
      case "elevated": return "1px solid rgba(255,255,255,0.08)";
      case "glass": return "1px solid rgba(255,255,255,0.12)";
      case "flat": return "none";
      default: return "1px solid rgba(255,255,255,0.06)";
    }
  };

  const getCardBg = () => {
    switch (settings.cardStyle) {
      case "glass": return "rgba(255,255,255,0.06)";
      case "bordered": return "rgba(255,255,255,0.02)";
      case "elevated": return "rgba(255,255,255,0.05)";
      case "flat": return "rgba(255,255,255,0.03)";
      default: return "rgba(255,255,255,0.04)";
    }
  };

  // Determine sidebar/header visibility based on layout
  const hasSidebar = !["bottombar", "topside", "megamenu", "breadcrumb"].includes(settings.layoutTemplate || "");
  const isLeftSidebar = isRTL
    ? (settings.sidebarPosition || "left") === "right"
    : (settings.sidebarPosition || "left") === "left";

  // Shadow intensity
  const shadowMap: Record<string, string> = {
    none: "none", subtle: "0 1px 2px rgba(0,0,0,0.1)",
    moderate: "0 2px 8px rgba(0,0,0,0.15)", strong: "0 4px 16px rgba(0,0,0,0.25)",
  };
  const shadow = shadowMap[settings.shadowIntensity || "subtle"] || "0 1px 2px rgba(0,0,0,0.1)";

  return (
    <div className="relative w-full">
      {/* Preview label */}
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
          {t("studio.dashboard.preview") || "Live Preview"}
        </span>
        <span className="text-[9px] text-muted-foreground/60">
          {settings.layoutTemplate || "modern"}
        </span>
      </div>

      {/* Preview container — simulates a dashboard */}
      <div
        className="relative w-full overflow-hidden border border-border/30"
        style={{
          ...bgStyle,
          borderRadius: radius,
          height: "168px",
          boxShadow: shadow,
        }}
      >
        {/* ── Sidebar ── */}
        {hasSidebar && (
          <div
            className={cn(
              "absolute top-0 bottom-0 flex flex-col gap-1.5 p-1.5",
              isLeftSidebar ? "left-0" : "right-0"
            )}
            style={{
              width: "32px",
              background: `linear-gradient(180deg, ${primaryColor}18, ${primaryColor}08)`,
              borderRight: isLeftSidebar ? "1px solid rgba(255,255,255,0.06)" : "none",
              borderLeft: !isLeftSidebar ? "1px solid rgba(255,255,255,0.06)" : "none",
            }}
          >
            {/* Logo dot */}
            <div
              className="mx-auto h-4 w-4 rounded-full"
              style={{ background: primaryColor, opacity: 0.8 }}
            />
            {/* Nav items */}
            {[0.6, 0.4, 0.5, 0.3, 0.4, 0.35].map((opacity, i) => (
              <div
                key={i}
                className="mx-auto h-3 w-3 rounded"
                style={{
                  background: i === 0 ? primaryColor : "rgba(255,255,255,0.2)",
                  opacity: i === 0 ? 0.9 : opacity,
                  borderRadius: radius,
                }}
              />
            ))}
          </div>
        )}

        {/* ── Main Content Area ── */}
        <div
          className="absolute top-0 bottom-0 flex flex-col"
          style={{
            left: hasSidebar && isLeftSidebar ? "32px" : "0",
            right: hasSidebar && !isLeftSidebar ? "32px" : "0",
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-2 shrink-0"
            style={{
              height: "20px",
              background: settings.headerStyle === "floating"
                ? "transparent"
                : "rgba(255,255,255,0.03)",
              borderBottom: settings.headerStyle === "bordered"
                ? `1px solid ${primaryColor}20`
                : "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {/* Breadcrumbs mock */}
            {settings.showBreadcrumbs !== false && (
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-6 rounded-full bg-white/15" />
                <div className="h-1 w-1 rounded-full bg-white/10" />
                <div className="h-1.5 w-8 rounded-full bg-white/10" />
              </div>
            )}
            {/* Header actions */}
            <div className="flex items-center gap-1 ms-auto">
              {settings.showNotifications !== false && (
                <div className="h-2 w-2 rounded-full bg-white/15" />
              )}
              {settings.showUserAvatar !== false && (
                <div className="h-3 w-3 rounded-full" style={{ background: primaryColor, opacity: 0.4 }} />
              )}
            </div>
          </div>

          {/* Content area */}
          <div className="flex-1 p-2 overflow-hidden">
            {/* Welcome / title bar mock */}
            <div className="mb-2 flex items-center gap-1.5">
              <div className="h-2 w-16 rounded-full bg-white/15" />
              <div className="h-2 w-10 rounded-full" style={{ background: primaryColor, opacity: 0.3 }} />
            </div>

            {/* Stats cards row */}
            <div className="grid grid-cols-4 gap-1 mb-1.5">
              {[0.7, 0.5, 0.6, 0.4].map((opacity, i) => (
                <div
                  key={i}
                  style={{
                    background: getCardBg(),
                    border: getCardBorder(),
                    borderRadius: radius,
                    boxShadow: settings.cardStyle === "elevated" ? shadow : "none",
                  }}
                  className="p-1.5"
                >
                  <div
                    className="h-1.5 w-4 rounded-full mb-1"
                    style={{ background: primaryColor, opacity }}
                  />
                  <div className="h-1 w-6 rounded-full bg-white/10" />
                </div>
              ))}
            </div>

            {/* Content blocks row */}
            <div className="grid grid-cols-3 gap-1">
              {/* Chart card */}
              <div
                className="col-span-2 p-1.5"
                style={{
                  background: getCardBg(),
                  border: getCardBorder(),
                  borderRadius: radius,
                  boxShadow: settings.cardStyle === "elevated" ? shadow : "none",
                }}
              >
                <div className="h-1 w-8 rounded-full bg-white/12 mb-1.5" />
                {/* Mini bar chart */}
                <div className="flex items-end gap-0.5 h-[32px]">
                  {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.3, 0.65, 0.55].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h * 100}%`,
                        background: i % 3 === 0
                          ? primaryColor
                          : `${primaryColor}${i % 2 === 0 ? '50' : '30'}`,
                        opacity: 0.8,
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Side card */}
              <div
                className="p-1.5"
                style={{
                  background: getCardBg(),
                  border: getCardBorder(),
                  borderRadius: radius,
                  boxShadow: settings.cardStyle === "elevated" ? shadow : "none",
                }}
              >
                <div className="h-1 w-6 rounded-full bg-white/12 mb-1.5" />
                {/* Mini list */}
                {[0.7, 0.5, 0.3, 0.6].map((w, i) => (
                  <div key={i} className="flex items-center gap-1 mb-1">
                    <div
                      className="h-1.5 w-1.5 rounded-full shrink-0"
                      style={{ background: primaryColor, opacity: 0.6 }}
                    />
                    <div
                      className="h-1 rounded-full bg-white/10"
                      style={{ width: `${w * 100}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          {settings.showFooter && (
            <div
              className="shrink-0 flex items-center justify-center"
              style={{
                height: "12px",
                borderTop: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div className="h-1 w-12 rounded-full bg-white/8" />
            </div>
          )}
        </div>

        {/* Theme color indicator dot */}
        <div
          className="absolute bottom-1.5 end-1.5 h-3 w-3 rounded-full ring-1 ring-white/20"
          style={{ background: primaryColor }}
          title={settings.colorTheme || "blue"}
        />
      </div>

      {/* Settings summary badges */}
      <div className="mt-1.5 flex flex-wrap gap-1">
        {[
          settings.colorTheme,
          settings.cardStyle !== "default" && settings.cardStyle,
          settings.borderRadius !== "default" && `r:${settings.borderRadius}`,
          settings.animationLevel !== "default" && `anim:${settings.animationLevel}`,
          settings.backgroundMode !== "preset" && settings.backgroundMode,
        ].filter(Boolean).map((badge, i) => (
          <span
            key={i}
            className="inline-flex items-center rounded-full border border-border/30 bg-muted/30 px-1.5 py-0.5 text-[8px] font-medium text-muted-foreground"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
