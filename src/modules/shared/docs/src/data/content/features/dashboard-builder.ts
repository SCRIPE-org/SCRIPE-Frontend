import { registerPage } from "../../repositories/DocsRepository";
import type { DocSection } from "../../../domain/entities/DocSection";

const sections: DocSection[] = [
  { type: "paragraph", contentKey: "features.dashboardBuilder.intro" },

  // ─── Overview ─────────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.overviewTitle",
    id: "overview",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.overviewIntro" },
  {
    type: "table",
    headers: ["Component", "Description", "Technology"],
    rows: [
      [
        "4-Layer Merge Engine",
        "Platform → Tenant → Admin → Runtime settings resolution",
        "React Context + localStorage",
      ],
      [
        "Server Sync Hook",
        "Bidirectional sync of admin preferences to AdminSettingsJson",
        "Custom React Hook + REST API",
      ],
      [
        "FOUC Prevention",
        "Optimistic render from cache, silent server reconcile",
        "localStorage + CustomEvent",
      ],
      [
        "Override Control",
        "Tenant admins control which settings admins can customize",
        "Path-level whitelist",
      ],
      [
        "Preset System",
        "Pre-built and custom theme presets with marketplace",
        "Database + JSON blobs",
      ],
      [
        "Edition Gating",
        "Feature visibility controlled by subscription tier",
        "FeatureChecker pipeline",
      ],
    ],
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "features.dashboardBuilder.overviewTip",
  },

  // ─── 4-Layer Merge Engine ─────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.mergeEngineTitle",
    id: "merge-engine",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.mergeEngineIntro" },
  {
    type: "flowchart",
    title: "Settings Merge Pipeline",
    direction: "horizontal",
    nodes: [
      { id: "l1", label: "Layer 1: Platform Defaults", type: "default" },
      { id: "l3", label: "Layer 3: Tenant Defaults", type: "info" },
      { id: "l4", label: "Layer 4: Admin Overrides", type: "warning" },
      { id: "final", label: "Final Applied Settings", type: "success" },
    ],
    connections: [
      { from: "l1", to: "l3", label: "Spread merge" },
      { from: "l3", to: "l4", label: "Path-filtered" },
      { from: "l4", to: "final", label: "Applied to DOM" },
    ],
  },
  {
    type: "table",
    headers: ["Layer", "Source", "Persistence", "Scope"],
    rows: [
      [
        "1. Platform Defaults",
        "defaultSettings in settings-provider.tsx",
        "Hardcoded",
        "All users",
      ],
      [
        "3. Tenant Defaults",
        "DashboardThemeJson on TenantSettings",
        "Database (tenant)",
        "All admins in tenant",
      ],
      [
        "4. Admin Overrides",
        "AdminSettingsJson on Admin",
        "Database (per-admin)",
        "Individual admin",
      ],
    ],
  },
  {
    type: "info",
    variant: "note",
    contentKey: "features.dashboardBuilder.mergeEngineNote",
  },

  // ─── Server Sync Hook ─────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.syncHookTitle",
    id: "server-sync",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.syncHookIntro" },
  {
    type: "flowchart",
    title: "Admin Settings Lifecycle",
    direction: "vertical",
    nodes: [
      { id: "login", label: "Admin Logs In", type: "default" },
      { id: "cache", label: "Check localStorage Cache", type: "info" },
      { id: "flush", label: "Check PENDING_SETTINGS_FLUSH", type: "warning" },
      { id: "fetch", label: "GET AdminSettingsJson", type: "info" },
      { id: "reconcile", label: "Silent Reconcile", type: "success" },
      { id: "change", label: "User Changes Setting", type: "default" },
      { id: "debounce", label: "2s Debounce", type: "warning" },
      { id: "save", label: "PUT to Server", type: "success" },
    ],
    connections: [
      { from: "login", to: "cache" },
      { from: "cache", to: "flush" },
      { from: "flush", to: "fetch" },
      { from: "fetch", to: "reconcile" },
      { from: "change", to: "debounce" },
      { from: "debounce", to: "save" },
    ],
  },
  {
    type: "code",
    language: "typescript",
    filename: "useAdminSettingsSync.ts — Usage",
    code: `// In DashboardLayout (authenticated layout root):
const { isSettingsReady } = useAdminSettingsSync();

// Shimmer only on first-ever device login (no cache)
if (!isSettingsReady) {
  return <LoadingShimmer />;
}`,
  },

  // ─── Widget & Grid Configuration Schema ───────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.widgetConfigTitle",
    id: "widget-config",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.widgetConfigIntro" },
  {
    type: "code",
    language: "typescript",
    filename: "DashboardWidget.ts Schema",
    code: `export interface DashboardWidget {
  id: string;                      // Unique identifier
  type: DashboardWidgetType;       // 'statsCard' | 'chart' | 'dataTable' | 'quickActions' | ...
  gridColumn: string;              // CSS Grid span configuration (e.g. "1 / 7")
  gridRow: string;                 // CSS Grid row configuration (e.g. "1 / 3")
  alignment: WidgetAlignment;      // 'start' | 'center' | 'end' | 'stretch'
  props: Record<string, unknown>;  // Element specific settings (title, chartType, customUrl)
  zIndex: number;                  // Overlap layer control
  visible: boolean;                // Hide/show toggle
}

export interface DashboardBuilderCanvas {
  enabled: boolean;                // True if layout customization is enabled
  widgets: DashboardWidget[];      // Collection of positioned dashboard widgets
  gridRows: number;                // Configured row height (default: 6)
}`,
  },

  // ─── Edge Case Protections ────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.edgeCasesTitle",
    id: "edge-cases",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.edgeCasesIntro" },
  {
    type: "table",
    headers: ["Edge Case", "Problem", "Solution"],
    rows: [
      [
        "FOUC (Flash of Unstyled Content)",
        "Blocking render for server fetch causes visible flash",
        "Optimistic render from localStorage cache; shimmer only on first-ever device",
      ],
      [
        "Tab Close Data Loss",
        "2s debounce means last change may be lost",
        "fetch({ keepalive: true }) with JWT in beforeunload handler",
      ],
      [
        "409 Concurrency Conflict",
        "Two sessions editing same admin's settings",
        "Field-level last-write-wins merge using changedFieldsSinceLastSync tracker",
      ],
      [
        "Payload Size Bomb",
        "Large base64 in logoText could overflow 10KB column",
        "8KB client-side guard with admin-settings-size-error event",
      ],
      [
        "JWT Expired at Tab Close",
        "beforeunload fetch fails with 401",
        "Deferred flush via PENDING_SETTINGS_FLUSH localStorage key, flushed on next login",
      ],
    ],
  },
  {
    type: "info",
    variant: "warning",
    contentKey: "features.dashboardBuilder.edgeCasesWarning",
  },

  // ─── Settings Reference ───────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.settingsRefTitle",
    id: "settings-reference",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.settingsRefIntro" },
  {
    type: "table",
    headers: ["Section", "Count", "Examples", "Edition Gate"],
    rows: [
      ["Layout & Structure", "7", "layoutTemplate, sidebarPosition, headerStyle", "Always"],
      [
        "Colors & Theme",
        "16",
        "colorTheme, gradientDirection, customPrimaryColor",
        "Gradients / CustomColors",
      ],
      ["Typography & Spacing", "5", "fontSize, borderRadius, spacingSize", "Always"],
      ["Component Styles", "16", "buttonStyle, inputStyle, tableStyle", "ComponentStyles.Enabled"],
      ["Logo & Branding", "5", "logoType, logoAnimation, logoSize", "LogoCustomization.Enabled"],
      ["Navigation & UX", "9", "navigationStyle, highContrast, showDetailPanel", "Always"],
      [
        "Toast Configuration",
        "3",
        "toastStyle, showToastIcons, toastDuration",
        "ComponentStyles.Enabled",
      ],
      ["Hover Effects", "2", "hoverEffectType, hoverEffectIntensity", "HoverEffects.Enabled"],
    ],
  },

  // ─── Admin Override Control ───────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.overrideControlTitle",
    id: "override-control",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.overrideControlIntro" },
  {
    type: "table",
    headers: ["Scenario", "Settings Page Behavior"],
    rows: [
      ["AllowAdminThemeOverride = true, no path filter", "Full edit mode (current behavior)"],
      [
        "AllowAdminThemeOverride = true, with path filter",
        "Mixed mode — editable settings show controls, locked settings show 🔒 badge",
      ],
      [
        "AllowAdminThemeOverride = false",
        "Full read-only mode — all controls disabled with banner",
      ],
    ],
  },

  // ─── Security Model ───────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.securityTitle",
    id: "security",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.securityIntro" },
  {
    type: "table",
    headers: ["Threat", "Mitigation"],
    rows: [
      ["Cross-admin settings leak", "AUTH_STORAGE_KEYS_TO_CLEAR wipes all settings on logout"],
      [
        "Raw theme key leak",
        "clearAllLocalStorage() removes theme and scripe_admin_prefs_version explicitly",
      ],
      ["Oversized payload", "8KB client guard + 10KB server column limit"],
      ["Admin modifies locked setting", "Server validates keys against AllowedAdminSettingsJson"],
      ["Concurrent 409 conflict", "Field-level last-write-wins merge with toast notification"],
      ["Tab-close data loss", "fetch({ keepalive: true }) with JWT Authorization header"],
      ["JWT expired at tab close", "Deferred flush via PENDING_SETTINGS_FLUSH (survives logout)"],
    ],
  },

  // ─── Architecture ─────────────────────────────────────────
  {
    type: "heading",
    level: 2,
    titleKey: "features.dashboardBuilder.archTitle",
    id: "architecture",
  },
  { type: "paragraph", contentKey: "features.dashboardBuilder.archIntro" },
  {
    type: "code",
    language: "text",
    filename: "Key Files",
    code: `src/core/providers/
├── useAdminSettingsSync.ts    # Server sync hook (5 edge case protections)
├── settings-provider.tsx      # 4-layer merge engine + field tracking
├── tenant-branding-provider.tsx # Layer 3 sync + override metadata

src/core/config/
├── storage-keys.ts            # Centralized localStorage key definitions
├── api-endpoints.ts           # Dashboard builder API endpoint constants

src/core/ui/layout/
├── dashboard-layout.tsx       # FOUC shimmer gate (layout entry point)

src/modules/auth/core/data/
├── repositories/AuthRepository.ts  # Logout cleanup (raw key removal)

src/modules/monitoring/dashboard/
├── domain/entities/DashboardWidget.ts # 12-column widget schema
├── presentation/components/dashboard-builder/DashboardBuilderPanel.tsx # DnD wrapper
└── presentation/viewmodels/useDashboardBuilderStore.ts # Zustand layout manager`,
  },
  {
    type: "info",
    variant: "tip",
    contentKey: "features.dashboardBuilder.archTip",
  },
];

registerPage({
  slug: "features/dashboard-builder",
  titleKey: "features.dashboardBuilder.title",
  descriptionKey: "features.dashboardBuilder.description",
  category: "features",
  order: 19,
  sections,
  relatedSlugs: [
    "features/login-customizer",
    "features/theme-marketplace",
    "features/login-page-builder",
  ],
  lastUpdated: "2026-06-28",
});
