"use client";

import type React from "react";
import { createContext, useContext, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appLogger } from "@core/common/logger";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { useAppStore } from "@core/store/useAppStore";

// Define all possible setting types
export type ColorTheme =
  | "purple"
  | "blue"
  | "green"
  | "orange"
  | "red"
  | "teal"
  | "pink"
  | "indigo"
  | "cyan"
  | "amber"
  | "yellow"
  | "lime"
  | "emerald"
  | "sky"
  | "violet"
  | "fuchsia"
  | "rose"
  | "slate"
  | "zinc"
  | "stone"
  | "gold"
  | "coral";

export type LightBackgroundTheme =
  | "default"
  | "warm"
  | "cool"
  | "neutral"
  | "soft"
  | "cream"
  | "mint"
  | "lavender"
  | "rose"
  | "sky"
  | "sand"
  | "pearl"
  | "ice"
  | "linen"
  | "cloud"
  | "snow";

export type DarkBackgroundTheme =
  | "default"
  | "darker"
  | "pitch"
  | "slate"
  | "warm-dark"
  | "forest"
  | "ocean"
  | "purple-dark"
  | "crimson"
  | "midnight"
  | "charcoal"
  | "obsidian"
  | "navy"
  | "graphite"
  | "onyx"
  | "volcanic";

export type ShadowIntensity = "none" | "subtle" | "moderate" | "strong";

// Secondary color (same palette as primary)
export type SecondaryColorTheme = ColorTheme;

// Gradient direction
export type GradientDirection =
  | "to-t"
  | "to-tr"
  | "to-r"
  | "to-br"
  | "to-b"
  | "to-bl"
  | "to-l"
  | "to-tl";

// Light gradient themes
export type LightGradientTheme =
  | "none"
  | "sunrise"
  | "ocean-breeze"
  | "lavender-mist"
  | "meadow"
  | "peach-glow"
  | "sky-wash"
  | "cotton-candy"
  | "lemonade"
  | "seafoam"
  | "blush"
  | "arctic"
  | "golden-hour";

// Dark gradient themes
export type DarkGradientTheme =
  | "none"
  | "midnight-blue"
  | "aurora"
  | "deep-space"
  | "ember"
  | "twilight"
  | "neon-noir"
  | "volcanic-ash"
  | "northern-lights"
  | "abyss"
  | "cyber-punk"
  | "dark-forest"
  | "nebula";

// Background mode - which background system is active
export type BackgroundMode = "preset" | "gradient" | "custom";
export type LayoutTemplate =
  | "modern"
  | "minimal"
  | "classic"
  | "compact"
  | "floating"
  | "elegant"
  | "navigation"
  | "tabbed"
  | "dual"
  | "command"
  | "stacked"
  | "hud"
  | "dock"
  | "executive"
  | "magazine"
  | "spotlight"
  | "glassmorphism"
  | "galaxy"
  | "neon"
  | "retro"
  | "aurora"
  | "rail"
  | "newspaper"
  | "cinema"
  | "vault"
  // Batch 1 — Navigation Innovations
  | "bottombar"
  | "megamenu"
  | "breadcrumb"
  | "ribbon"
  | "treeview"
  | "overlay"
  // Batch 2 — Multi-Zone / Pro
  | "hub"
  | "wizard"
  | "shelf"
  | "collapseheader"
  | "splitpane"
  | "inbox"
  // Batch 3 — More Pro Patterns
  | "dualheader"
  | "topside"
  | "focus"
  | "multipanel"
  | "kanban"
  | "bento"
  // Batch 4 — Industry-Specific
  | "chat"
  | "map"
  | "feed"
  | "calendar"
  | "crm"
  | "terminal";

export type CardStyle = "default" | "glass" | "solid" | "bordered" | "elevated";
export type AnimationLevel = "none" | "minimal" | "moderate" | "high";
export type AnimationSpeed = "slow" | "normal" | "fast";
export type Theme = "light" | "dark" | "system";
export type FontSize = "xs" | "small" | "medium" | "default" | "large" | "xl";
export type BorderRadius = "none" | "small" | "default" | "large" | "full";
export type SidebarPosition = "left" | "right";

// Additional setting types
export type HeaderStyle = "default" | "compact" | "elevated" | "transparent";
export type SidebarStyle = "default" | "compact" | "floating" | "minimal";
export type ButtonStyle =
  | "default"
  | "small-round"
  | "medium-round"
  | "large-round"
  | "extra-round"
  | "super-round"
  | "rounded"
  | "sharp"
  | "modern";

export type NavigationStyle = "default" | "pills" | "underline" | "sidebar";
export type SpacingSize = "compact" | "default" | "comfortable" | "spacious";
export type IconStyle = "outline" | "filled" | "duotone" | "minimal";
export type InputStyle = "default" | "rounded" | "underlined" | "filled";
export type TableStyle =
  | "default"
  | "striped"
  | "bordered"
  | "minimal"
  | "glass"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "matrix"
  | "diamond";

export type BadgeStyle =
  | "default"
  | "modern"
  | "glass"
  | "neon"
  | "gradient"
  | "outlined"
  | "filled"
  | "minimal"
  | "pill"
  | "square";
export type AvatarStyle = "default" | "rounded" | "square" | "hexagon";
export type LogoType = "sparkles" | "shield" | "image" | "custom";
export type LogoAnimation = "none" | "spin" | "pulse" | "fancy";
export type LogoSize = "xs" | "sm" | "md" | "lg" | "xl";

export type FormStyle =
  | "default"
  | "compact"
  | "spacious"
  | "inline"
  | "modern"
  | "glass"
  | "minimal"
  | "card"
  | "neon"
  | "elegant"
  | "organic"
  | "retro";
export type LoadingStyle =
  | "spinner"
  | "dots"
  | "bars"
  | "pulse"
  | "wave"
  | "orbit"
  | "ripple"
  | "gradient"
  | "matrix"
  | "helix"
  | "quantum"
  | "morphing";
export type TooltipStyle =
  | "default"
  | "rounded"
  | "sharp"
  | "bubble"
  | "glass"
  | "neon"
  | "minimal"
  | "elegant";
export type ModalStyle =
  | "default"
  | "centered"
  | "fullscreen"
  | "drawer"
  | "glass"
  | "floating"
  | "card"
  | "overlay";

export type TreeStyle =
  | "lines"
  | "cards"
  | "minimal"
  | "bubble"
  | "modern"
  | "glass"
  | "elegant"
  | "professional"
  | "gradient"
  | "neon"
  | "organic"
  | "corporate";
export type ToastDesign = "minimal" | "modern" | "gradient" | "outlined" | "filled";
export type DatePickerStyle =
  | "default"
  | "modern"
  | "glass"
  | "outlined"
  | "filled"
  | "minimal"
  | "elegant";
export type CalendarStyle = "default" | "modern" | "glass" | "elegant" | "minimal" | "dark";

export type SelectStyle =
  | "default"
  | "modern"
  | "glass"
  | "outlined"
  | "filled"
  | "minimal"
  | "elegant"
  | "professional"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "aurora"
  | "matrix"
  | "diamond"
  | "holographic"
  | "cosmic"
  | "liquid"
  | "crystal"
  | "plasma"
  | "quantum"
  | "nebula"
  | "prism"
  | "stellar"
  | "vortex"
  | "phoenix";

export type SwitchStyle =
  | "default"
  | "modern"
  | "ios"
  | "android"
  | "toggle"
  | "slider"
  | "neon"
  | "neumorphism"
  | "liquid"
  | "cyberpunk"
  | "glassmorphism"
  | "aurora"
  | "matrix"
  | "cosmic"
  | "retro";

export type CheckboxStyle =
  | "default"
  | "modern"
  | "glass"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "elegant"
  | "organic"
  | "retro"
  | "matrix"
  | "diamond"
  | "liquid"
  | "crystal"
  | "plasma"
  | "quantum"
  | "holographic"
  | "stellar"
  | "vortex"
  | "phoenix";

export type RadioStyle =
  | "default"
  | "modern"
  | "glass"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "elegant"
  | "organic"
  | "retro"
  | "matrix"
  | "diamond"
  | "liquid"
  | "crystal"
  | "plasma"
  | "quantum"
  | "holographic"
  | "stellar"
  | "vortex"
  | "phoenix";

export type ToastStyle =
  | "classic"
  | "neon"
  | "glassmorphism"
  | "neumorphism"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "modern"
  | "gradient"
  | "outlined";

export type HoverEffectType =
  | "none"
  | "elevate"
  | "scale"
  | "glow"
  | "shimmer"
  | "rotate"
  | "slide";

export type HoverEffectIntensity = "none" | "small" | "medium" | "strong";

/**
 * Settings interface - all available settings
 */
export interface Settings {
  // Color and theme settings
  colorTheme: ColorTheme;
  lightBackgroundTheme: LightBackgroundTheme;
  darkBackgroundTheme: DarkBackgroundTheme;
  shadowIntensity: ShadowIntensity;
  secondaryColorTheme: SecondaryColorTheme;
  gradientDirection: GradientDirection;
  lightGradientTheme: LightGradientTheme;
  darkGradientTheme: DarkGradientTheme;
  customPrimaryColor: string;
  customSecondaryColor: string;
  customLightBgColor: string;
  customDarkBgColor: string;
  activePalette: string;
  backgroundMode: BackgroundMode;
  gradientStartColor: string;
  gradientEndColor: string;
  layoutTemplate: LayoutTemplate;
  cardStyle: CardStyle;
  animationLevel: AnimationLevel;
  fontSize: FontSize;
  showDetailPanel: boolean;
  borderRadius: BorderRadius;
  sidebarPosition: SidebarPosition;

  // Component style settings
  headerStyle: HeaderStyle;
  sidebarStyle: SidebarStyle;
  buttonStyle: ButtonStyle;
  navigationStyle: NavigationStyle;
  spacingSize: SpacingSize;
  iconStyle: IconStyle;
  inputStyle: InputStyle;
  tableStyle: TableStyle;
  badgeStyle: BadgeStyle;
  avatarStyle: AvatarStyle;

  // Logo settings
  logoType: LogoType;
  logoAnimation: LogoAnimation;
  logoSize: LogoSize;
  logoText: string;

  // App control settings
  showBreadcrumbs: boolean;
  showUserAvatar: boolean;
  showNotifications: boolean;
  compactMode: boolean;
  highContrast: boolean;
  reducedMotion: boolean;
  stickyHeader: boolean;
  collapsibleSidebar: boolean;
  showFooter: boolean;
  autoSave: boolean;
  showLogo: boolean;

  // Additional component styles
  formStyle: FormStyle;
  loadingStyle: LoadingStyle;
  tooltipStyle: TooltipStyle;
  modalStyle: ModalStyle;
  treeStyle: TreeStyle;
  datePickerStyle: DatePickerStyle;
  calendarStyle: CalendarStyle;
  selectStyle: SelectStyle;
  switchStyle: SwitchStyle;
  checkboxStyle: CheckboxStyle;
  radioStyle: RadioStyle;

  // Toast settings
  toastStyle: ToastStyle;
  showToastIcons: boolean;
  toastDuration: number;

  // Hover effect settings
  hoverEffectType: HoverEffectType;
  hoverEffectIntensity: HoverEffectIntensity;
}

/**
 * Settings context interface
 */
export interface SettingsContextType extends Settings {
  // Setters for all settings
  setColorTheme: (theme: ColorTheme) => void;
  setLightBackgroundTheme: (theme: LightBackgroundTheme) => void;
  setDarkBackgroundTheme: (theme: DarkBackgroundTheme) => void;
  setShadowIntensity: (intensity: ShadowIntensity) => void;
  setSecondaryColorTheme: (theme: SecondaryColorTheme) => void;
  setGradientDirection: (dir: GradientDirection) => void;
  setLightGradientTheme: (theme: LightGradientTheme) => void;
  setDarkGradientTheme: (theme: DarkGradientTheme) => void;
  setCustomPrimaryColor: (color: string) => void;
  setCustomSecondaryColor: (color: string) => void;
  setCustomLightBgColor: (color: string) => void;
  setCustomDarkBgColor: (color: string) => void;
  setActivePalette: (palette: string) => void;
  setBackgroundMode: (mode: BackgroundMode) => void;
  setGradientStartColor: (color: string) => void;
  setGradientEndColor: (color: string) => void;
  setLayoutTemplate: (template: LayoutTemplate) => void;
  setCardStyle: (style: CardStyle) => void;
  setAnimationLevel: (level: AnimationLevel) => void;
  setFontSize: (size: FontSize) => void;
  setShowDetailPanel: (show: boolean) => void;
  setBorderRadius: (radius: BorderRadius) => void;
  setSidebarPosition: (position: SidebarPosition) => void;
  setHeaderStyle: (style: HeaderStyle) => void;
  setSidebarStyle: (style: SidebarStyle) => void;
  setButtonStyle: (style: ButtonStyle) => void;
  setNavigationStyle: (style: NavigationStyle) => void;
  setSpacingSize: (size: SpacingSize) => void;
  setIconStyle: (style: IconStyle) => void;
  setInputStyle: (style: InputStyle) => void;
  setTableStyle: (style: TableStyle) => void;
  setBadgeStyle: (style: BadgeStyle) => void;
  setAvatarStyle: (style: AvatarStyle) => void;
  setLogoType: (type: LogoType) => void;
  setLogoAnimation: (animation: LogoAnimation) => void;
  setLogoSize: (size: LogoSize) => void;
  setLogoText: (text: string) => void;
  setShowBreadcrumbs: (show: boolean) => void;
  setShowUserAvatar: (show: boolean) => void;
  setShowNotifications: (show: boolean) => void;
  setCompactMode: (compact: boolean) => void;
  setHighContrast: (contrast: boolean) => void;
  setReducedMotion: (reduced: boolean) => void;
  setStickyHeader: (sticky: boolean) => void;
  setCollapsibleSidebar: (collapsible: boolean) => void;
  setShowFooter: (show: boolean) => void;
  setAutoSave: (autoSave: boolean) => void;
  setShowLogo: (show: boolean) => void;
  setFormStyle: (style: FormStyle) => void;
  setLoadingStyle: (style: LoadingStyle) => void;
  setTooltipStyle: (style: TooltipStyle) => void;
  setModalStyle: (style: ModalStyle) => void;
  setTreeStyle: (style: TreeStyle) => void;
  setDatePickerStyle: (style: DatePickerStyle) => void;
  setCalendarStyle: (style: CalendarStyle) => void;
  setSelectStyle: (style: SelectStyle) => void;
  setSwitchStyle: (style: SwitchStyle) => void;
  setCheckboxStyle: (style: CheckboxStyle) => void;
  setRadioStyle: (style: RadioStyle) => void;
  setToastStyle: (style: ToastStyle) => void;
  setShowToastIcons: (show: boolean) => void;
  setToastDuration: (duration: number) => void;
  setHoverEffectType: (type: HoverEffectType) => void;
  setHoverEffectIntensity: (intensity: HoverEffectIntensity) => void;

  // Utility functions
  resetSettings: () => void;
  exportSettings: () => string;
  importSettings: (settings: string) => boolean;

  // M11: Admin override control — exposes tenant-level override restrictions
  overrideControl: {
    /** Whether the tenant allows admins to override any settings at all */
    allowAdminOverride: boolean;
    /** If non-null, only these setting keys can be overridden by admins */
    allowedPaths: string[] | null;
    /** Check if a specific setting key is locked (admin cannot override) */
    isSettingLocked: (key: string) => boolean;
  };
}

/**
 * Default settings configuration
 */
const defaultSettings: Settings = {
  colorTheme: "blue",
  lightBackgroundTheme: "default",
  darkBackgroundTheme: "slate",
  shadowIntensity: "subtle",
  secondaryColorTheme: "slate",
  gradientDirection: "to-br",
  lightGradientTheme: "none",
  darkGradientTheme: "none",
  customPrimaryColor: "#3b82f6",
  customSecondaryColor: "#64748b",
  customLightBgColor: "#ffffff",
  customDarkBgColor: "#0f172a",
  activePalette: "corporate-classic",
  backgroundMode: "preset",
  gradientStartColor: "#3b82f6",
  gradientEndColor: "#8b5cf6",
  layoutTemplate: "navigation",
  cardStyle: "default",
  animationLevel: "minimal",
  fontSize: "default",
  showDetailPanel: true,
  borderRadius: "default",
  sidebarPosition: "left",
  headerStyle: "default",
  sidebarStyle: "default",
  buttonStyle: "default",
  navigationStyle: "sidebar",
  spacingSize: "default",
  iconStyle: "outline",
  inputStyle: "default",
  tableStyle: "default",
  badgeStyle: "outlined",
  avatarStyle: "default",
  logoType: "image",
  logoAnimation: "none",
  logoSize: "xl",
  logoText: "",
  showBreadcrumbs: true,
  showUserAvatar: true,
  showNotifications: true,
  compactMode: false,
  highContrast: false,
  reducedMotion: false,
  stickyHeader: true,
  collapsibleSidebar: true,
  showFooter: true,
  autoSave: true,
  showLogo: true,
  formStyle: "default",
  loadingStyle: "ripple",
  tooltipStyle: "default",
  modalStyle: "default",
  treeStyle: "lines",
  datePickerStyle: "default",
  calendarStyle: "default",
  selectStyle: "default",
  switchStyle: "default",
  checkboxStyle: "default",
  radioStyle: "default",
  toastStyle: "classic",
  showToastIcons: true,
  toastDuration: 5000,
  hoverEffectType: "none",
  hoverEffectIntensity: "none",
};

/**
 * Create fallback settings for SSR/hydration issues.
 * IMPORTANT: These values MUST be identical to defaultSettings to avoid
 * hydration mismatch flashes (SSR renders one value, client hydrates another).
 */
function createFallbackSettings(): Partial<SettingsContextType> {
  const noop = () => {};
  return {
    // ── Values must mirror defaultSettings exactly ──
    ...defaultSettings,

    // ── Setters (all no-ops during SSR/fallback) ──
    setColorTheme: noop,
    setLightBackgroundTheme: noop,
    setDarkBackgroundTheme: noop,
    setShadowIntensity: noop,
    setSecondaryColorTheme: noop,
    setGradientDirection: noop,
    setLightGradientTheme: noop,
    setDarkGradientTheme: noop,
    setCustomPrimaryColor: noop,
    setCustomSecondaryColor: noop,
    setCustomLightBgColor: noop,
    setCustomDarkBgColor: noop,
    setActivePalette: noop,
    setBackgroundMode: noop,
    setGradientStartColor: noop,
    setGradientEndColor: noop,
    setLayoutTemplate: noop,
    setCardStyle: noop,
    setAnimationLevel: noop,
    setFontSize: noop,
    setShowDetailPanel: noop,
    setBorderRadius: noop,
    setSidebarPosition: noop,
    setHeaderStyle: noop,
    setSidebarStyle: noop,
    setButtonStyle: noop,
    setNavigationStyle: noop,
    setSpacingSize: noop,
    setIconStyle: noop,
    setInputStyle: noop,
    setTableStyle: noop,
    setBadgeStyle: noop,
    setAvatarStyle: noop,
    setLogoType: noop,
    setLogoAnimation: noop,
    setLogoSize: noop,
    setLogoText: noop,
    setShowBreadcrumbs: noop,
    setShowUserAvatar: noop,
    setShowNotifications: noop,
    setCompactMode: noop,
    setHighContrast: noop,
    setReducedMotion: noop,
    setStickyHeader: noop,
    setCollapsibleSidebar: noop,
    setShowFooter: noop,
    setAutoSave: noop,
    setShowLogo: noop,
    setFormStyle: noop,
    setLoadingStyle: noop,
    setTooltipStyle: noop,
    setModalStyle: noop,
    setTreeStyle: noop,
    setDatePickerStyle: noop,
    setCalendarStyle: noop,
    setSelectStyle: noop,
    setSwitchStyle: noop,
    setCheckboxStyle: noop,
    setRadioStyle: noop,
    setToastStyle: noop,
    setShowToastIcons: noop,
    setToastDuration: noop,
    setHoverEffectType: noop,
    setHoverEffectIntensity: noop,

    // Utility functions
    resetSettings: noop,
    exportSettings: () => '{}',
    importSettings: () => false,

    // Override control (default: no restrictions)
    overrideControl: {
      allowAdminOverride: true,
      allowedPaths: null,
      isSettingLocked: () => false,
    },
  };
}

// Exported so SettingsOverrideProvider (used by DashboardPreviewShell) can create
// an isolated context scope without touching localStorage.
export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// Exported so preview shells and tests can reference the canonical defaults.
export { defaultSettings };

/**
 * Settings Provider Component
 *
 * Provides centralized settings management with localStorage persistence
 * and optimized performance through reduced re-renders.
 */
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [isHydrated, setIsHydrated] = useState(false);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);

  // Load settings with 4-layer merge (M11 Dashboard Builder):
  //   Layer 1: Platform defaults (defaultSettings — hardcoded above)
  //   Layer 3: Tenant defaults (PREF_DASHBOARD_SETTINGS — synced from DashboardThemeJson by TenantBrandingProvider)
  //   Layer 4: Admin overrides (DASHBOARD_SETTINGS — server-synced via useAdminSettingsSync → localStorage cache)
  // M11: Override control state — uses useState (not ref) so context re-computes when it changes (Gap #8 fix)
  const [overrideControl, setOverrideControl] = useState<{ allowAdminOverride: boolean; allowedPaths: string[] | null }>({
    allowAdminOverride: true,
    allowedPaths: null,
  });

  // Gap #2/#7 fix: Track whether we're inside a merge operation. When true, the auto-save
  // effect is suppressed to prevent merge-triggered state changes from writing back to
  // localStorage and syncing preview/reconciliation data to the server.
  const isMergingRef = useRef(false);

  const mergeAndApplySettings = () => {
    try {
      // Layer 3: Tenant defaults (from DashboardThemeJson via TenantBrandingProvider)
      let tenantDefaults: Partial<Settings> = {};
      let allowAdminOverride = true; // default true for backward compat
      let allowedPaths: string[] | null = null;
      let tenantVersion = 0; // Gap #10: tenant settings version for stale-cache detection

      const tenantSettingsRaw = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
      if (tenantSettingsRaw) {
        try {
          const parsed = JSON.parse(tenantSettingsRaw);
          // Extract only valid Settings keys (ignore basic prefs like theme/language/sidebarCollapsed)
          const { theme, language, sidebarCollapsed, _schemaVersion,
                  _allowAdminOverride, _allowedAdminPaths, _settingsVersion, ...dashboardSettings } = parsed;
          tenantDefaults = dashboardSettings;
          tenantVersion = _settingsVersion ?? 0;
          if (_allowAdminOverride !== undefined) allowAdminOverride = _allowAdminOverride;
          if (_allowedAdminPaths) allowedPaths = _allowedAdminPaths;
          // Persist to state so useMemo re-computes when override control changes (Gap #8)
          setOverrideControl({ allowAdminOverride, allowedPaths });
        } catch { /* invalid tenant JSON — skip */ }
      }

      // Layer 4: Admin overrides (server-synced, with path-level access control)
      let adminOverrides: Partial<Settings> = {};
      if (allowAdminOverride) {
        const adminSettingsRaw = localStorage.getItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
        if (adminSettingsRaw) {
          try {
            const fullOverrides = JSON.parse(adminSettingsRaw);
            // Gap #10: Version comparison — if tenant settings were republished
            // (version bumped), the admin cache is stale and should be discarded.
            const adminBasedOnVersion = fullOverrides._basedOnVersion ?? 0;
            if (tenantVersion > adminBasedOnVersion) {
              // Tenant settings are newer — clear stale admin cache
              appLogger.info(`[SettingsProvider] Tenant version ${tenantVersion} > admin cache version ${adminBasedOnVersion}, discarding stale admin overrides`);
              localStorage.removeItem(STORAGE_KEYS.DASHBOARD_SETTINGS);
            } else if (allowedPaths && allowedPaths.length > 0) {
              // FILTERED: only whitelisted paths can override
              for (const path of allowedPaths) {
                if (path in fullOverrides) {
                  (adminOverrides as Record<string, unknown>)[path] = fullOverrides[path];
                }
              }
            } else {
              // No path filter = all overrides allowed
              adminOverrides = fullOverrides;
            }
          } catch { /* invalid admin JSON — skip */ }
        }
      }

      // Final merge: Layer 1 → Layer 3 → Layer 4
      // Wrap in isMerging flag so auto-save effect ignores this state change
      isMergingRef.current = true;
      setSettings({ ...defaultSettings, ...tenantDefaults, ...adminOverrides });
    } catch (error) {
      appLogger.error("Failed to load settings:", error);
    } finally {
      setIsHydrated(true);
      // Clear merging flag on next microtask (after React batches the state update)
      queueMicrotask(() => { isMergingRef.current = false; });
    }
  };

  // Initial merge on mount
  useEffect(() => {
    mergeAndApplySettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // M11: Listen for admin-settings-loaded event to re-merge (server reconciliation)
  useEffect(() => {
    const handler = () => mergeAndApplySettings();
    window.addEventListener('admin-settings-loaded', handler);
    // Also re-merge when TenantBrandingProvider finishes fetching branding
    // This eliminates FOUC by re-merging after tenant defaults are written to localStorage
    window.addEventListener('tenant-branding-loaded', handler);
    return () => {
      window.removeEventListener('admin-settings-loaded', handler);
      window.removeEventListener('tenant-branding-loaded', handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fix #5: Reset settings to platform defaults when user logs out
  // This prevents stale tenant colors/layout from persisting after logout
  // Uses isMerging flag so the auto-save effect won't re-create the deleted localStorage key
  useEffect(() => {
    if (!isAuthenticated && isHydrated) {
      isMergingRef.current = true;
      setSettings(defaultSettings);
      queueMicrotask(() => { isMergingRef.current = false; });
    }
  }, [isAuthenticated, isHydrated]);

  // M11: Track which field was last changed (for sync hook's 409 field-level merge)
  const lastChangedFieldRef = useRef<string | null>(null);

  // Save settings to localStorage + dispatch change event for useAdminSettingsSync
  // Gap #2 fix: Suppressed during merges (isMergingRef) to prevent preview/reconciliation data from leaking
  // Gap #7 fix: Suppressed when not authenticated to prevent re-creating deleted localStorage keys after logout
  useEffect(() => {
    if (isHydrated && isAuthenticated && settings.autoSave && !isMergingRef.current) {
      try {
        // Gap #10: Stamp the admin cache with the tenant version it was based on
        // so future merges can detect stale caches after tenant republish.
        let basedOnVersion = 0;
        try {
          const prefRaw = localStorage.getItem(STORAGE_KEYS.PREF_DASHBOARD_SETTINGS);
          if (prefRaw) basedOnVersion = JSON.parse(prefRaw)?._settingsVersion ?? 0;
        } catch { /* ignore */ }
        const toSave = { ...settings, _basedOnVersion: basedOnVersion };
        localStorage.setItem(STORAGE_KEYS.DASHBOARD_SETTINGS, JSON.stringify(toSave));
        // M11: Include which specific field changed — used by useAdminSettingsSync for 409 field-level merge
        window.dispatchEvent(new CustomEvent('settings-changed', {
          detail: { changedField: lastChangedFieldRef.current }
        }));
        // Reset after dispatch
        lastChangedFieldRef.current = null;
      } catch (error) {
        appLogger.error("Failed to save settings:", error);
      }
    }
  }, [settings, isHydrated, isAuthenticated, settings.autoSave]);

  // Apply settings to document root
  useEffect(() => {
    if (isHydrated && typeof document !== "undefined") {
      // Batch all DOM mutations into a single paint cycle
      requestAnimationFrame(() => {
        const root = document.documentElement;

        // Apply all data attributes
        root.setAttribute("data-theme", settings.colorTheme);
        root.setAttribute("data-light-bg-theme", settings.lightBackgroundTheme);
        root.setAttribute("data-dark-bg-theme", settings.darkBackgroundTheme);
        root.setAttribute("data-shadow", settings.shadowIntensity);
        root.setAttribute("data-layout", settings.layoutTemplate);
        root.setAttribute("data-card-style", settings.cardStyle);
        root.setAttribute("data-animation", settings.animationLevel);
        root.setAttribute("data-font-size", settings.fontSize);
        root.setAttribute("data-radius", settings.borderRadius);
        root.setAttribute("data-sidebar-position", settings.sidebarPosition);
        root.setAttribute("data-header-style", settings.headerStyle);
        root.setAttribute("data-sidebar-style", settings.sidebarStyle);
        root.setAttribute("data-button-style", settings.buttonStyle);
        root.setAttribute("data-navigation-style", settings.navigationStyle);
        root.setAttribute("data-spacing", settings.spacingSize);
        root.setAttribute("data-icon-style", settings.iconStyle);
        root.setAttribute("data-input-style", settings.inputStyle);
        root.setAttribute("data-table-style", settings.tableStyle);
        root.setAttribute("data-badge-style", settings.badgeStyle);
        root.setAttribute("data-avatar-style", settings.avatarStyle);
        root.setAttribute("data-logo-type", settings.logoType);
        root.setAttribute("data-logo-animation", settings.logoAnimation);
        root.setAttribute("data-logo-size", settings.logoSize);
        root.setAttribute("data-compact-mode", settings.compactMode.toString());
        root.setAttribute("data-high-contrast", settings.highContrast.toString());
        root.setAttribute("data-reduced-motion", settings.reducedMotion.toString());
        root.setAttribute("data-sticky-header", settings.stickyHeader.toString());
        root.setAttribute("data-form-style", settings.formStyle);
        root.setAttribute("data-loading-style", settings.loadingStyle);
        root.setAttribute("data-tooltip-style", settings.tooltipStyle);
        root.setAttribute("data-modal-style", settings.modalStyle);
        root.setAttribute("data-tree-style", settings.treeStyle);
        root.setAttribute("data-checkbox-design", settings.checkboxStyle);
        root.setAttribute("data-radio-design", settings.radioStyle);
        root.setAttribute("data-hover-effect-type", settings.hoverEffectType);
        root.setAttribute("data-hover-effect-intensity", settings.hoverEffectIntensity);
        root.setAttribute("data-secondary-theme", settings.secondaryColorTheme);
        root.setAttribute("data-gradient-dir", settings.gradientDirection);
        root.setAttribute("data-light-gradient", settings.lightGradientTheme);
        root.setAttribute("data-dark-gradient", settings.darkGradientTheme);

        // Apply custom colors as CSS custom properties
        if (settings.customPrimaryColor) {
          root.style.setProperty("--custom-primary", settings.customPrimaryColor);
        } else {
          root.style.removeProperty("--custom-primary");
        }
        if (settings.customSecondaryColor) {
          root.style.setProperty("--custom-secondary", settings.customSecondaryColor);
        } else {
          root.style.removeProperty("--custom-secondary");
        }
        if (settings.customLightBgColor) {
          root.style.setProperty("--custom-light-bg", settings.customLightBgColor);
        } else {
          root.style.removeProperty("--custom-light-bg");
        }
        if (settings.customDarkBgColor) {
          root.style.setProperty("--custom-dark-bg", settings.customDarkBgColor);
        } else {
          root.style.removeProperty("--custom-dark-bg");
        }

        // Apply background based on mode via CSS custom properties
        const bgMode = settings.backgroundMode || "preset";
        root.setAttribute("data-bg-mode", bgMode);

        // Clear previous bg override
        root.style.removeProperty("--bg-override");

        if (bgMode === "gradient") {
          const dirMap: Record<string, string> = {
            "to-t": "0deg",
            "to-tr": "45deg",
            "to-r": "90deg",
            "to-br": "135deg",
            "to-b": "180deg",
            "to-bl": "225deg",
            "to-l": "270deg",
            "to-tl": "315deg",
          };
          const angle = dirMap[settings.gradientDirection] || "135deg";
          const isDark = root.classList.contains("dark");

          if (settings.gradientStartColor && settings.gradientEndColor) {
            root.style.setProperty(
              "--bg-override",
              `linear-gradient(${angle}, ${settings.gradientStartColor}, ${settings.gradientEndColor})`
            );
          } else if (isDark && settings.darkGradientTheme && settings.darkGradientTheme !== "none") {
            const fromStyle = getComputedStyle(root).getPropertyValue("--gradient-from").trim();
            const toStyle = getComputedStyle(root).getPropertyValue("--gradient-to").trim();
            if (fromStyle && toStyle) {
              root.style.setProperty(
                "--bg-override",
                `linear-gradient(${angle}, hsl(${fromStyle}), hsl(${toStyle}))`
              );
            }
          } else if (
            !isDark &&
            settings.lightGradientTheme &&
            settings.lightGradientTheme !== "none"
          ) {
            const fromStyle = getComputedStyle(root).getPropertyValue("--gradient-from").trim();
            const toStyle = getComputedStyle(root).getPropertyValue("--gradient-to").trim();
            if (fromStyle && toStyle) {
              root.style.setProperty(
                "--bg-override",
                `linear-gradient(${angle}, hsl(${fromStyle}), hsl(${toStyle}))`
              );
            }
          }
        } else if (bgMode === "custom") {
          const isDark = root.classList.contains("dark");
          const customBg = isDark ? settings.customDarkBgColor : settings.customLightBgColor;
          if (customBg) {
            root.style.setProperty("--bg-override", customBg);
          }
        }

        // Apply CSS custom properties for responsive design
        root.style.setProperty(
          "--font-size-base",
          settings.fontSize === "xs"
            ? "13px"
            : settings.fontSize === "small"
              ? "14px"
              : settings.fontSize === "medium"
                ? "16px"
                : settings.fontSize === "large"
                  ? "20px"
                  : settings.fontSize === "xl"
                    ? "22px"
                    : "18px"
        );

        root.style.setProperty(
          "--spacing-unit",
          settings.spacingSize === "compact"
            ? "0.5rem"
            : settings.spacingSize === "comfortable"
              ? "1.5rem"
              : settings.spacingSize === "spacious"
                ? "2rem"
                : "1rem"
        );

        root.style.setProperty(
          "--border-radius",
          settings.borderRadius === "none"
            ? "0"
            : settings.borderRadius === "small"
              ? "0.25rem"
              : settings.borderRadius === "large"
                ? "0.75rem"
                : settings.borderRadius === "full"
                  ? "9999px"
                  : "0.5rem"
        );

        root.style.setProperty(
          "--shadow-intensity",
          settings.shadowIntensity === "none"
            ? "none"
            : settings.shadowIntensity === "subtle"
              ? "0 1px 2px 0 rgb(0 0 0 / 0.05)"
              : settings.shadowIntensity === "strong"
                ? "0 25px 50px -12px rgb(0 0 0 / 0.25)"
                : "0 4px 6px -1px rgb(0 0 0 / 0.1)"
        );
      });
    }
  }, [settings, isHydrated]);

  // Generic update function — stable via useCallback (Gap #14)
  // M11: also tracks which field changed for 409 merge
  const updateSetting = useCallback(<K extends keyof Settings>(key: K, value: Settings[K]) => {
    lastChangedFieldRef.current = key;
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Gap #9 fix: resetSettings respects tenant locks — resets only unlocked fields
  const resetSettings = useCallback(() => {
    setSettings((prev) => {
      const reset = { ...defaultSettings };
      const { allowAdminOverride, allowedPaths } = overrideControl;
      if (!allowAdminOverride) return prev; // all locked, can't reset
      if (allowedPaths && allowedPaths.length > 0) {
        // Only reset fields in the whitelist; keep locked fields from prev
        const result = { ...prev };
        for (const path of allowedPaths) {
          if (path in reset) {
            (result as Record<string, unknown>)[path] = (reset as Record<string, unknown>)[path];
          }
        }
        return result;
      }
      return reset;
    });
  }, [overrideControl]);

  const exportSettings = useCallback(() => {
    return JSON.stringify(settings, null, 2);
  }, [settings]);

  // Gap #9 fix: importSettings filters out locked fields
  const importSettings = useCallback((settingsString: string): boolean => {
    try {
      const parsed = JSON.parse(settingsString);
      const { allowAdminOverride, allowedPaths } = overrideControl;
      if (!allowAdminOverride) return false; // all locked
      let filtered = parsed;
      if (allowedPaths && allowedPaths.length > 0) {
        filtered = Object.fromEntries(
          Object.entries(parsed).filter(([k]) => allowedPaths.includes(k))
        );
      }
      setSettings((prev) => ({ ...prev, ...defaultSettings, ...filtered }));
      return true;
    } catch {
      return false;
    }
  }, [overrideControl]);

  // Memoize context value to prevent unnecessary re-renders of all consumers
  const contextValue = useMemo<SettingsContextType>(() => ({
    ...settings,
    setColorTheme: (theme) => updateSetting("colorTheme", theme),
    setLightBackgroundTheme: (theme) => updateSetting("lightBackgroundTheme", theme),
    setDarkBackgroundTheme: (theme) => updateSetting("darkBackgroundTheme", theme),
    setShadowIntensity: (intensity) => updateSetting("shadowIntensity", intensity),
    setSecondaryColorTheme: (theme) => updateSetting("secondaryColorTheme", theme),
    setGradientDirection: (dir) => updateSetting("gradientDirection", dir),
    setLightGradientTheme: (theme) => updateSetting("lightGradientTheme", theme),
    setDarkGradientTheme: (theme) => updateSetting("darkGradientTheme", theme),
    setCustomPrimaryColor: (color) => updateSetting("customPrimaryColor", color),
    setCustomSecondaryColor: (color) => updateSetting("customSecondaryColor", color),
    setCustomLightBgColor: (color) => updateSetting("customLightBgColor", color),
    setCustomDarkBgColor: (color) => updateSetting("customDarkBgColor", color),
    setActivePalette: (palette) => updateSetting("activePalette", palette),
    setBackgroundMode: (mode) => updateSetting("backgroundMode", mode),
    setGradientStartColor: (color) => updateSetting("gradientStartColor", color),
    setGradientEndColor: (color) => updateSetting("gradientEndColor", color),
    setLayoutTemplate: (template) => updateSetting("layoutTemplate", template),
    setCardStyle: (style) => updateSetting("cardStyle", style),
    setAnimationLevel: (level) => updateSetting("animationLevel", level),
    setFontSize: (size) => updateSetting("fontSize", size),
    setShowDetailPanel: (show) => updateSetting("showDetailPanel", show),
    setBorderRadius: (radius) => updateSetting("borderRadius", radius),
    setSidebarPosition: (position) => updateSetting("sidebarPosition", position),
    setHeaderStyle: (style) => updateSetting("headerStyle", style),
    setSidebarStyle: (style) => updateSetting("sidebarStyle", style),
    setButtonStyle: (style) => updateSetting("buttonStyle", style),
    setNavigationStyle: (style) => updateSetting("navigationStyle", style),
    setSpacingSize: (size) => updateSetting("spacingSize", size),
    setIconStyle: (style) => updateSetting("iconStyle", style),
    setInputStyle: (style) => updateSetting("inputStyle", style),
    setTableStyle: (style) => updateSetting("tableStyle", style),
    setBadgeStyle: (style) => updateSetting("badgeStyle", style),
    setAvatarStyle: (style) => updateSetting("avatarStyle", style),
    setLogoType: (type) => updateSetting("logoType", type),
    setLogoAnimation: (animation) => updateSetting("logoAnimation", animation),
    setLogoSize: (size) => updateSetting("logoSize", size),
    setLogoText: (text) => updateSetting("logoText", text),
    setShowBreadcrumbs: (show) => updateSetting("showBreadcrumbs", show),
    setShowUserAvatar: (show) => updateSetting("showUserAvatar", show),
    setShowNotifications: (show) => updateSetting("showNotifications", show),
    setCompactMode: (compact) => updateSetting("compactMode", compact),
    setHighContrast: (contrast) => updateSetting("highContrast", contrast),
    setReducedMotion: (reduced) => updateSetting("reducedMotion", reduced),
    setStickyHeader: (sticky) => updateSetting("stickyHeader", sticky),
    setCollapsibleSidebar: (collapsible) => updateSetting("collapsibleSidebar", collapsible),
    setShowFooter: (show) => updateSetting("showFooter", show),
    setAutoSave: (autoSave) => updateSetting("autoSave", autoSave),
    setShowLogo: (show) => updateSetting("showLogo", show),
    setFormStyle: (style) => updateSetting("formStyle", style),
    setLoadingStyle: (style) => updateSetting("loadingStyle", style),
    setTooltipStyle: (style) => updateSetting("tooltipStyle", style),
    setModalStyle: (style) => updateSetting("modalStyle", style),
    setTreeStyle: (style) => updateSetting("treeStyle", style),
    setDatePickerStyle: (style) => updateSetting("datePickerStyle", style),
    setCalendarStyle: (style) => updateSetting("calendarStyle", style),
    setSelectStyle: (style) => updateSetting("selectStyle", style),
    setSwitchStyle: (style) => updateSetting("switchStyle", style),
    setCheckboxStyle: (style) => updateSetting("checkboxStyle", style),
    setRadioStyle: (style) => updateSetting("radioStyle", style),
    setToastStyle: (style) => updateSetting("toastStyle", style),
    setShowToastIcons: (show) => updateSetting("showToastIcons", show),
    setToastDuration: (duration) => updateSetting("toastDuration", duration),
    setHoverEffectType: (type) => updateSetting("hoverEffectType", type),
    setHoverEffectIntensity: (intensity) => updateSetting("hoverEffectIntensity", intensity),
    resetSettings,
    exportSettings,
    importSettings,
    overrideControl: {
      allowAdminOverride: overrideControl.allowAdminOverride,
      allowedPaths: overrideControl.allowedPaths,
      isSettingLocked: (key: string) => {
        if (!overrideControl.allowAdminOverride) return true;
        if (overrideControl.allowedPaths && overrideControl.allowedPaths.length > 0) {
          return !overrideControl.allowedPaths.includes(key);
        }
        return false;
      },
    },
  }), [settings, overrideControl, resetSettings, exportSettings, importSettings, updateSetting]);

  // Don't render until hydrated to prevent hydration mismatches
  if (!isHydrated) {
    return <div className="min-h-screen animate-pulse bg-background" suppressHydrationWarning />;
  }

  return <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>;
}

/**
 * Hook to access settings context
 *
 * @returns Settings context with all settings and setters
 * @throws Error if used outside of SettingsProvider
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    // During SSR/prerendering or hydration issues, provide fallback values
    if (typeof window === "undefined") {
      return createFallbackSettings() as SettingsContextType;
    }
    // Client-side fallback for hydration issues
    return createFallbackSettings() as SettingsContextType;
  }
  return context;
}
