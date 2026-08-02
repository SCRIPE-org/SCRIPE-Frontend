/**
 * Settings DOM Applicator
 *
 * Pure function that applies Settings to the document root element.
 * Writes data-attributes and CSS custom properties.
 * Extracted so it can be tested independently and reused by DashboardPreviewShell.
 *
 * Wave C contract: every attribute written here has a consumer — a CSS
 * selector in globals.css or a declared downstream reader (data-table-style
 * and the hover-effect pair are consumed by the Wave-D container work).
 * Attribute writes with no CSS and no JS reader were dropped (data-logo-*,
 * data-form/loading/tooltip/modal/tree-style, data-checkbox/radio-design,
 * data-sticky-header, data-font-size) along with the culled fields' writes.
 */

import type { Settings } from "./types";

// ── Setting key → data-attribute mapping ──────────────────

const DATA_ATTR_MAP: Partial<Record<keyof Settings, string>> = {
  lightBackgroundTheme: "data-light-bg-theme",
  darkBackgroundTheme: "data-dark-bg-theme",
  shadowIntensity: "data-shadow",
  // layoutTemplate is intentionally NOT mapped here — data-layout is written
  // unconditionally as "nexus" below (belt-and-suspenders, see applySettingsToDOM).
  cardStyle: "data-card-style",
  animationLevel: "data-animation",
  borderRadius: "data-radius",
  buttonStyle: "data-button-style",
  navigationStyle: "data-navigation-style",
  spacingSize: "data-spacing",
  iconStyle: "data-icon-style",
  inputStyle: "data-input-style",
  tableStyle: "data-table-style",
  badgeStyle: "data-badge-style",
  avatarStyle: "data-avatar-style",
  highContrast: "data-high-contrast",
  reducedMotion: "data-reduced-motion",
  hoverEffectType: "data-hover-effect-type",
  hoverEffectIntensity: "data-hover-effect-intensity",
  secondaryColorTheme: "data-secondary-theme",
  gradientDirection: "data-gradient-dir",
  lightGradientTheme: "data-light-gradient",
  darkGradientTheme: "data-dark-gradient",
};

// ── Computed CSS values ───────────────────────────────────

// The ONE font-size mechanism: html { font-size: var(--font-size-base) } in
// globals.css. All six FontSize values land here; the three former
// :root[data-font-size] px rules that fought this var are deleted.
const FONT_SIZE_MAP: Record<string, string> = {
  xs: "13px",
  small: "14px",
  medium: "16px",
  default: "18px",
  large: "20px",
  xl: "22px",
};

// The ONE --spacing-unit writer. The compact-mode CSS rule that competed
// with it died with the culled flag — "compact" here covers that use.
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

    // 1b. Layout is now nexus-only. The multi-layout system was retired, so
    //     data-layout is written unconditionally as "nexus" rather than echoing
    //     settings.layoutTemplate — even a corrupt stored value that somehow
    //     bypassed the merge-engine migration lands on the one real shell. The
    //     --nx- tokens are global, so this is defence in depth.
    root.setAttribute("data-layout", "nexus");

    // 1c. Personal colour theme — opt-in only. --nx-accent (every button,
    //     active state, focus ring app-wide) derives from --workspace-hue/
    //     --workspace-chroma, which WorkspaceProvider sets from the ACTIVE
    //     WORKSPACE's own brand colour. data-theme flips the legacy --primary
    //     var, which now has exactly one live reader (nav-icons.tsx's topbar
    //     toggle glyphs). Stamping data-theme unconditionally would silently
    //     fight the tenant/workspace brand for every user who has never
    //     opened Appearance settings — colorTheme defaults to "blue" out of
    //     the box, not "unset". So: only write data-theme once the user has
    //     actively picked a swatch (colorThemeCustomized), and otherwise strip
    //     the attribute so no :root[data-theme] rule from a previous session
    //     lingers and no --primary override survives to unrelated readers.
    if (settings.colorThemeCustomized) {
      root.setAttribute("data-theme", settings.colorTheme);
    } else {
      root.removeAttribute("data-theme");
    }

    // 2. Background mode ("custom" was culled — preset and gradient remain)
    const bgMode = settings.backgroundMode || "preset";
    root.setAttribute("data-bg-mode", bgMode);
    root.style.removeProperty("--bg-override");

    if (bgMode === "gradient") {
      const angle = GRADIENT_DIR_MAP[settings.gradientDirection] || "135deg";
      const start = settings.gradientStartColor || "#3b82f6";
      const end = settings.gradientEndColor || "#8b5cf6";
      root.style.setProperty("--bg-override", `linear-gradient(${angle}, ${start}, ${end})`);
    }

    // 3. Computed CSS values (unknown stored values fall back to the
    //    platform-default value of each map)
    root.style.setProperty("--font-size-base", FONT_SIZE_MAP[settings.fontSize] || "16px");
    root.style.setProperty("--spacing-unit", SPACING_MAP[settings.spacingSize] || "1rem");
    root.style.setProperty("--border-radius", BORDER_RADIUS_MAP[settings.borderRadius] || "0.5rem");
    root.style.setProperty(
      "--shadow-intensity",
      SHADOW_MAP[settings.shadowIntensity] || "0 4px 6px -1px rgb(0 0 0 / 0.1)"
    );
  });
}
