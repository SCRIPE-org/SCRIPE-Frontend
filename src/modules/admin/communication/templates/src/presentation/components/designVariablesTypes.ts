/**
 * designVariablesTypes — Configuration types, default values, and color contrast calculations for template styling.
 *
 * @module templates/presentation
 */

/**
 * Palette, typography, and geometry variables customizable on communication templates.
 */
export interface DesignVariables {
  /** Main accent color hex */
  primaryColor: string;
  /** Foreground text color applied over primary color fills */
  primaryForeground: string;
  /** Secondary highlight color hex */
  secondaryColor: string;
  /** Page/canvas background color hex */
  backgroundColor: string;
  /** Body typography text color hex */
  textColor: string;
  /** Font family declaration string */
  fontFamily: string;
  /** Header font size in pixels */
  headerFontSize: string;
  /** Body font size in pixels */
  bodyFontSize: string;
  /** Outer corner border radius in pixels */
  borderRadius: string;
  /** Hosted image URL for organization logo */
  logoUrl: string;
  /** Standard footer copyright and disclaimer text */
  footerText: string;
}

/**
 * Properties passed to the DesignVariablesPanel component.
 */
export interface DesignVariablesPanelProps {
  /** Active design variables state */
  value: DesignVariables;
  /** Change notification callback */
  onChange: (v: DesignVariables) => void;
}

/**
 * Standard default theme variables used when initializing or resetting template design.
 */
export const DEFAULT_DESIGN: DesignVariables = {
  primaryColor: "#C6FF00",
  primaryForeground: "#0D0D0E",
  secondaryColor: "#3F4347",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
  fontFamily: "Inter, sans-serif",
  headerFontSize: "24",
  bodyFontSize: "14",
  borderRadius: "8",
  logoUrl: "",
  footerText: "© {{currentYear}} {{companyName}}. All rights reserved.",
};

/**
 * Calculates WCAG relative-luminance to determine optimal contrasting text foreground (black or white)
 * for an arbitrary background fill color.
 *
 * @param hex Hex color code string (3 or 6 characters, with or without leading #).
 * @returns Contrasting dark (#0D0D0E) or light (#ffffff) hex color string.
 */
export function getReadableForeground(hex: string): string {
  const normalized = hex.trim().replace(/^#/, "");
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return "#0D0D0E";
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const luminance = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
  return luminance > 0.5 ? "#0D0D0E" : "#ffffff";
}

/**
 * Available font choices for template typography.
 */
export const FONT_OPTIONS = [
  { value: "Inter, sans-serif", label: "Inter" },
  { value: "Roboto, sans-serif", label: "Roboto" },
  { value: "'Segoe UI', sans-serif", label: "Segoe UI" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "'Courier New', monospace", label: "Courier New" },
  { value: "Cairo, sans-serif", label: "Cairo (Arabic)" },
];
