/**
 * DashboardThemeConfig — Domain entity for dashboard theming (M9 + M11)
 *
 * This is the typed schema for `TenantSettings.DashboardThemeJson`.
 * It extends the existing prefs (`theme`, `sidebarCollapsed`, `language`)
 * with visual tokens for the dashboard UI and builder canvas layout.
 */

import { type DashboardBuilderCanvas, DEFAULT_BUILDER_CANVAS } from "./DashboardWidget";
// ── Greeting ──
/**
 * Domain model representing a Dashboard Greeting structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DashboardGreeting {
  enabled: boolean;
  text?: string; // e.g. "Welcome back, {name}"
  subtitle?: string; // e.g. "Here's what's happening today"
}
// ── KPI Card Styles ──
/**
 * Domain model representing a Card Radius structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type CardRadius = "none" | "sm" | "md" | "lg" | "xl" | "2xl";
/**
 * Domain model representing a Shadow Level structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type ShadowLevel = "none" | "sm" | "md" | "lg";
/**
 * Domain model representing a Dashboard K P I Config structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DashboardKPIConfig {
  borderRadius: CardRadius;
  showBorder: boolean;
  shadowLevel: ShadowLevel;
  accentColors: Record<string, string>; // kpiKey → hex color
}
// ── Chart Styles ──
/**
 * Domain model representing a Chart Style structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type ChartStyle = "gradient" | "solid" | "outline";
/**
 * Domain model representing a Dashboard Chart Config structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DashboardChartConfig {
  colorPalette: string[]; // 6-8 hex colors
  style: ChartStyle;
  showGrid: boolean;
}
// ── Section Visibility ──
/**
 * Domain model representing a Dashboard Sections structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DashboardSections {
  loginActivity: boolean;
  eventDistribution: boolean;
  recentChanges: boolean;
  securityEvents: boolean;
  blockedIPs: boolean;
}
// ── Layout ──
/**
 * Domain model representing a Layout Density structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export type LayoutDensity = "compact" | "default" | "comfortable";
/**
 * Domain model representing a Dashboard Layout structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DashboardLayout {
  density: LayoutDensity;
  columnsPerRow: 3 | 4 | 5;
}
// ═══════════════════════════════════════════════
// Full Config
// ═══════════════════════════════════════════════
/**
 * Domain model representing a Dashboard Theme Config structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DashboardThemeConfig {
  // Existing prefs (backward-compat)
  theme?: string;
  sidebarCollapsed?: boolean;
  language?: string;
  // M9: Visual tokens
  greeting: DashboardGreeting;
  kpiCards: DashboardKPIConfig;
  charts: DashboardChartConfig;
  sections: DashboardSections;
  layout: DashboardLayout;
  // M11: Builder canvas
  builderCanvas: DashboardBuilderCanvas;
}
// ═══════════════════════════════════════════════
// Palettes (prebuilt chart color sets)
// ═══════════════════════════════════════════════
/**
 * Domain model representing a Dashboard Palette structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface DashboardPalette {
  id: string;
  nameKey: string; // i18n key
  colors: string[];
  accent: string; // Primary accent for KPI icons
}
/**
 * Domain model representing a D A S H B O A R D_ P A L E T T E S structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export const DASHBOARD_PALETTES: DashboardPalette[] = [
  {
    id: "default",
    nameKey: "dashboard.studio.palette.default",
    colors: [
      "#6366f1",
      "#8b5cf6",
      "#a78bfa",
      "#c4b5fd",
      "#ddd6fe",
      "#ede9fe",
      "#818cf8",
      "#4f46e5",
    ],
    accent: "#6366f1",
  },
  {
    id: "ocean",
    nameKey: "dashboard.studio.palette.ocean",
    colors: [
      "#0ea5e9",
      "#06b6d4",
      "#14b8a6",
      "#0891b2",
      "#22d3ee",
      "#67e8f9",
      "#38bdf8",
      "#0284c7",
    ],
    accent: "#0ea5e9",
  },
  {
    id: "sunset",
    nameKey: "dashboard.studio.palette.sunset",
    colors: [
      "#f97316",
      "#fb923c",
      "#f59e0b",
      "#ef4444",
      "#fbbf24",
      "#facc15",
      "#ea580c",
      "#dc2626",
    ],
    accent: "#f97316",
  },
  {
    id: "forest",
    nameKey: "dashboard.studio.palette.forest",
    colors: [
      "#22c55e",
      "#10b981",
      "#34d399",
      "#16a34a",
      "#4ade80",
      "#6ee7b7",
      "#059669",
      "#15803d",
    ],
    accent: "#22c55e",
  },
  {
    id: "monochrome",
    nameKey: "dashboard.studio.palette.monochrome",
    colors: [
      "#334155",
      "#475569",
      "#64748b",
      "#94a3b8",
      "#cbd5e1",
      "#e2e8f0",
      "#1e293b",
      "#0f172a",
    ],
    accent: "#475569",
  },
];
// ═══════════════════════════════════════════════
// Defaults
// ═══════════════════════════════════════════════
/**
 * Domain model representing a D E F A U L T_ D A S H B O A R D_ T H E M E structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export const DEFAULT_DASHBOARD_THEME: DashboardThemeConfig = {
  greeting: {
    enabled: true,
    text: undefined,
    subtitle: undefined,
  },
  kpiCards: {
    borderRadius: "lg",
    showBorder: true,
    shadowLevel: "none",
    accentColors: {},
  },
  charts: {
    colorPalette: DASHBOARD_PALETTES[0].colors,
    style: "gradient",
    showGrid: true,
  },
  sections: {
    loginActivity: true,
    eventDistribution: true,
    recentChanges: true,
    securityEvents: true,
    blockedIPs: true,
  },
  layout: {
    density: "default",
    columnsPerRow: 5,
  },
  builderCanvas: { ...DEFAULT_BUILDER_CANVAS },
};
// ═══════════════════════════════════════════════
// Parser (JSON → typed config)
// ═══════════════════════════════════════════════
/**
 * Domain model representing a parse Dashboard Theme Json structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export function parseDashboardThemeJson(json: string | null | undefined): DashboardThemeConfig {
  if (!json) return { ...DEFAULT_DASHBOARD_THEME };
  try {
    const raw = JSON.parse(json);
    return {
      theme: raw.theme,
      sidebarCollapsed: raw.sidebarCollapsed,
      language: raw.language,
      greeting: {
        enabled: raw.greeting?.enabled ?? DEFAULT_DASHBOARD_THEME.greeting.enabled,
        text: raw.greeting?.text ?? DEFAULT_DASHBOARD_THEME.greeting.text,
        subtitle: raw.greeting?.subtitle ?? DEFAULT_DASHBOARD_THEME.greeting.subtitle,
      },
      kpiCards: {
        borderRadius: raw.kpiCards?.borderRadius ?? DEFAULT_DASHBOARD_THEME.kpiCards.borderRadius,
        showBorder: raw.kpiCards?.showBorder ?? DEFAULT_DASHBOARD_THEME.kpiCards.showBorder,
        shadowLevel: raw.kpiCards?.shadowLevel ?? DEFAULT_DASHBOARD_THEME.kpiCards.shadowLevel,
        accentColors: raw.kpiCards?.accentColors ?? DEFAULT_DASHBOARD_THEME.kpiCards.accentColors,
      },
      charts: {
        colorPalette: raw.charts?.colorPalette ?? DEFAULT_DASHBOARD_THEME.charts.colorPalette,
        style: raw.charts?.style ?? DEFAULT_DASHBOARD_THEME.charts.style,
        showGrid: raw.charts?.showGrid ?? DEFAULT_DASHBOARD_THEME.charts.showGrid,
      },
      sections: {
        loginActivity:
          raw.sections?.loginActivity ?? DEFAULT_DASHBOARD_THEME.sections.loginActivity,
        eventDistribution:
          raw.sections?.eventDistribution ?? DEFAULT_DASHBOARD_THEME.sections.eventDistribution,
        recentChanges:
          raw.sections?.recentChanges ?? DEFAULT_DASHBOARD_THEME.sections.recentChanges,
        securityEvents:
          raw.sections?.securityEvents ?? DEFAULT_DASHBOARD_THEME.sections.securityEvents,
        blockedIPs: raw.sections?.blockedIPs ?? DEFAULT_DASHBOARD_THEME.sections.blockedIPs,
      },
      layout: {
        density: raw.layout?.density ?? DEFAULT_DASHBOARD_THEME.layout.density,
        columnsPerRow: raw.layout?.columnsPerRow ?? DEFAULT_DASHBOARD_THEME.layout.columnsPerRow,
      },
      builderCanvas: {
        enabled: raw.builderCanvas?.enabled ?? DEFAULT_BUILDER_CANVAS.enabled,
        widgets: raw.builderCanvas?.widgets ?? DEFAULT_BUILDER_CANVAS.widgets,
        gridRows: raw.builderCanvas?.gridRows ?? DEFAULT_BUILDER_CANVAS.gridRows,
      },
    };
  } catch {
    return { ...DEFAULT_DASHBOARD_THEME };
  }
}
