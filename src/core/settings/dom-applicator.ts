/**
 * Settings DOM Applicator
 *
 * Pure function that applies Settings to the document root element.
 * Writes data-attributes and CSS custom properties.
 * Extracted so it can be tested independently and reused by DashboardPreviewShell.
 */

import type { Settings } from "./types";

// ── Setting key → data-attribute mapping ──────────────────

const DATA_ATTR_MAP: Partial<Record<keyof Settings, string>> = {
  colorTheme: "data-theme",
  lightBackgroundTheme: "data-light-bg-theme",
  darkBackgroundTheme: "data-dark-bg-theme",
  shadowIntensity: "data-shadow",
  layoutTemplate: "data-layout",
  cardStyle: "data-card-style",
  animationLevel: "data-animation",
  fontSize: "data-font-size",
  borderRadius: "data-radius",
  sidebarPosition: "data-sidebar-position",
  headerStyle: "data-header-style",
  sidebarStyle: "data-sidebar-style",
  buttonStyle: "data-button-style",
  navigationStyle: "data-navigation-style",
  spacingSize: "data-spacing",
  iconStyle: "data-icon-style",
  inputStyle: "data-input-style",
  tableStyle: "data-table-style",
  badgeStyle: "data-badge-style",
  avatarStyle: "data-avatar-style",
  logoType: "data-logo-type",
  logoAnimation: "data-logo-animation",
  logoSize: "data-logo-size",
  compactMode: "data-compact-mode",
  highContrast: "data-high-contrast",
  reducedMotion: "data-reduced-motion",
  stickyHeader: "data-sticky-header",
  formStyle: "data-form-style",
  loadingStyle: "data-loading-style",
  tooltipStyle: "data-tooltip-style",
  modalStyle: "data-modal-style",
  treeStyle: "data-tree-style",
  checkboxStyle: "data-checkbox-design",
  radioStyle: "data-radio-design",
  hoverEffectType: "data-hover-effect-type",
  hoverEffectIntensity: "data-hover-effect-intensity",
  secondaryColorTheme: "data-secondary-theme",
  gradientDirection: "data-gradient-dir",
  lightGradientTheme: "data-light-gradient",
  darkGradientTheme: "data-dark-gradient",
};

// ── CSS custom property mapping ───────────────────────────

const CSS_VAR_MAP: Partial<Record<keyof Settings, string>> = {
  customPrimaryColor: "--custom-primary",
  customSecondaryColor: "--custom-secondary",
  customLightBgColor: "--custom-light-bg",
  customDarkBgColor: "--custom-dark-bg",
};

// ── Computed CSS values ───────────────────────────────────

const FONT_SIZE_MAP: Record<string, string> = {
  xs: "13px",
  small: "14px",
  medium: "16px",
  default: "18px",
  large: "20px",
  xl: "22px",
};

const SPACING_MAP: Record<string, string> = {
  compact: "0.5rem",
  default: "1rem",
  comfortable: "1.5rem",
  spacious: "2rem",
};

const BORDER_RADIUS_MAP: Record<string, string> = {
  none: "0",
  small: "0.25rem",
  default: "0.5rem",
  large: "0.75rem",
  full: "9999px",
};

const SHADOW_MAP: Record<string, string> = {
  none: "none",
  subtle: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  moderate: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
  strong: "0 25px 50px -12px rgb(0 0 0 / 0.25)",
};

const GRADIENT_DIR_MAP: Record<string, string> = {
  "to-t": "0deg",
  "to-tr": "45deg",
  "to-r": "90deg",
  "to-br": "135deg",
  "to-b": "180deg",
  "to-bl": "225deg",
  "to-l": "270deg",
  "to-tl": "315deg",
};

/**
 * Apply all settings to the document root element.
 * Batches DOM mutations into a single rAF for performance.
 */
export function applySettingsToDOM(settings: Settings): void {
  if (typeof document === "undefined") return;

  requestAnimationFrame(() => {
    const root = document.documentElement;

    // 1. Data attributes (string + boolean settings)
    for (const [key, attr] of Object.entries(DATA_ATTR_MAP)) {
      const value = settings[key as keyof Settings];
      root.setAttribute(attr, typeof value === "boolean" ? value.toString() : String(value));
    }

    // 2. CSS custom properties (conditional set/remove)
    for (const [key, prop] of Object.entries(CSS_VAR_MAP)) {
      const value = settings[key as keyof Settings] as string;
      if (value) root.style.setProperty(prop, value);
      else root.style.removeProperty(prop);
    }

    // 3. Background mode
    const bgMode = settings.backgroundMode || "preset";
    root.setAttribute("data-bg-mode", bgMode);
    root.style.removeProperty("--bg-override");

    if (bgMode === "gradient") {
      const angle = GRADIENT_DIR_MAP[settings.gradientDirection] || "135deg";
      const start = settings.gradientStartColor || "#3b82f6";
      const end = settings.gradientEndColor || "#8b5cf6";
      root.style.setProperty("--bg-override", `linear-gradient(${angle}, ${start}, ${end})`);
    } else if (bgMode === "custom") {
      // Custom colors are handled by --custom-light-bg / --custom-dark-bg above
    }

    // 4. Computed CSS values
    root.style.setProperty("--font-size-base", FONT_SIZE_MAP[settings.fontSize] || "18px");
    root.style.setProperty("--spacing-unit", SPACING_MAP[settings.spacingSize] || "1rem");
    root.style.setProperty("--border-radius", BORDER_RADIUS_MAP[settings.borderRadius] || "0.5rem");
    root.style.setProperty("--shadow-intensity", SHADOW_MAP[settings.shadowIntensity] || "0 4px 6px -1px rgb(0 0 0 / 0.1)");
  });
}
