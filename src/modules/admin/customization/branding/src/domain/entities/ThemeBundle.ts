/**
 * ThemeBundle — Domain entity for theme bundle marketplace
 *
 * A Bundle packages multiple customization layers (login theme, dashboard theme,
 * auth page overrides, builder canvases) into a single "one-click apply" package.
 *
 * @module customization/domain
 */

// ═══════════════════════════════════════════════════════════════
//  BUNDLE TYPES & CONFIG
// ═══════════════════════════════════════════════════════════════

/** Type of bundle — determines which layers are included */
export type BundleType = "login-only" | "auth-suite" | "dashboard-only" | "full-bundle";

/** What's inside a bundle */
export interface ThemeBundleContents {
  loginThemeJson?: string;
  authPageOverrides?: string;
  dashboardThemeJson?: string;
  loginCanvasJson?: string;
  dashboardCanvasJson?: string;
}

/** Layers that can be included in a bundle */
export type BundleLayer = "login" | "authPages" | "dashboard" | "loginBuilder" | "dashboardBuilder";

/** Configuration for each bundle type */
export interface BundleTypeConfig {
  type: BundleType;
  labelKey: string;
  icon: string;
  layers: BundleLayer[];
  color: string;
  description: string;
}

/** Bundle type catalog — defines what each type includes */
export const BUNDLE_TYPE_CONFIG: Record<BundleType, BundleTypeConfig> = {
  "login-only": {
    type: "login-only",
    labelKey: "studio.bundles.typeLogin",
    icon: "LogIn",
    layers: ["login"],
    color: "#6366f1",
    description: "Login page theme only",
  },
  "auth-suite": {
    type: "auth-suite",
    labelKey: "studio.bundles.typeAuthSuite",
    icon: "Shield",
    layers: ["login", "authPages", "loginBuilder"],
    color: "#8b5cf6",
    description: "Login + all 6 auth page overrides + builder canvas",
  },
  "dashboard-only": {
    type: "dashboard-only",
    labelKey: "studio.bundles.typeDashboard",
    icon: "LayoutDashboard",
    layers: ["dashboard", "dashboardBuilder"],
    color: "#06b6d4",
    description: "Dashboard theme + builder canvas only",
  },
  "full-bundle": {
    type: "full-bundle",
    labelKey: "studio.bundles.typeFull",
    icon: "Package",
    layers: ["login", "authPages", "dashboard", "loginBuilder", "dashboardBuilder"],
    color: "#f59e0b",
    description: "Complete platform branding — everything included",
  },
};

// Layer display info (icon/color) lives in the presentation layer — see
// ../../presentation/constants/layerDisplay.ts. A domain entity describes what
// a BundleLayer IS, not how to render one.

// ═══════════════════════════════════════════════════════════════
//  DOMAIN ENTITY
// ═══════════════════════════════════════════════════════════════

/**
 * Domain model representing a Theme Bundle Data structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export interface ThemeBundleData {
  id: string;
  slug: string;
  name: string;
  description: string;
  bundleType: BundleType;
  contents: ThemeBundleContents;
  // Display
  accentColor: string;
  thumbnailUrl: string;
  screenshots: string[];
  tags: string[];
  // Metadata
  authorName: string;
  version: string;
  publishedAt: string;
  // Pricing & Access
  isFree: boolean;
  isSystem: boolean;
  isFeatured: boolean;
  minTierLevel: number;
  // User state
  isFavorited: boolean;
  isApplied: boolean;
  isAvailable: boolean;
}

/**
 * Domain model representing a Theme Bundle structure.
 * Bundles read-only attributes, computed properties, and copy builders for safe mutation state transfers.
 */
export class ThemeBundle {
  constructor(private readonly data: ThemeBundleData) {}

  // ── Identity ──
  get id() {
    return this.data.id;
  }
  get slug() {
    return this.data.slug;
  }
  get name() {
    return this.data.name;
  }
  get description() {
    return this.data.description;
  }
  get bundleType() {
    return this.data.bundleType;
  }
  get contents() {
    return this.data.contents;
  }

  // ── Display ──
  get accentColor() {
    return this.data.accentColor;
  }
  get thumbnailUrl() {
    return this.data.thumbnailUrl;
  }
  get screenshots() {
    return this.data.screenshots;
  }
  get tags() {
    return this.data.tags;
  }

  // ── Metadata ──
  get authorName() {
    return this.data.authorName;
  }
  get version() {
    return this.data.version;
  }
  get publishedAt() {
    return this.data.publishedAt;
  }

  // ── Pricing & Access ──
  get isFree() {
    return this.data.isFree;
  }
  get isSystem() {
    return this.data.isSystem;
  }
  get isFeatured() {
    return this.data.isFeatured;
  }
  get minTierLevel() {
    return this.data.minTierLevel;
  }

  // ── User State ──
  get isFavorited() {
    return this.data.isFavorited;
  }
  get isApplied() {
    return this.data.isApplied;
  }
  get isAvailable() {
    return this.data.isAvailable;
  }

  // ── Computed Properties ──

  /** Bundle type configuration from catalog */
  get typeConfig(): BundleTypeConfig {
    return BUNDLE_TYPE_CONFIG[this.data.bundleType];
  }

  /** Layers included in this bundle */
  get includedLayers(): BundleLayer[] {
    return this.typeConfig.layers;
  }

  /** Number of layers in this bundle */
  get layerCount(): number {
    return this.includedLayers.length;
  }

  /** Does this bundle include login theme? */
  get includesLogin(): boolean {
    return this.includedLayers.includes("login");
  }

  /** Does this bundle include auth page overrides? */
  get includesAuthPages(): boolean {
    return this.includedLayers.includes("authPages");
  }

  /** Does this bundle include dashboard theme? */
  get includesDashboard(): boolean {
    return this.includedLayers.includes("dashboard");
  }

  /** Does this bundle include login builder canvas? */
  get includesLoginBuilder(): boolean {
    return this.includedLayers.includes("loginBuilder");
  }

  /** Does this bundle include dashboard builder canvas? */
  get includesDashboardBuilder(): boolean {
    return this.includedLayers.includes("dashboardBuilder");
  }

  /** Is this a full bundle with everything? */
  get isComplete(): boolean {
    return this.data.bundleType === "full-bundle";
  }

  /** Immutable update */
  copyWith(updates: Partial<ThemeBundleData>): ThemeBundle {
    return new ThemeBundle({ ...this.data, ...updates });
  }
}
