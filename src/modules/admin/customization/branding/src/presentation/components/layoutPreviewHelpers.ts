/**
 * @file layoutPreviewHelpers.ts
 * @description Layout coordinate mapping, dimension scaling, and luminance calculation
 * helpers for the login layout thumbnail preview component.
 */

/**
 * Visual dimension specification for layout thumbnail container.
 */
export interface ThumbnailDimensions {
  /** Width in pixels. */
  w: number;
  /** Height in pixels. */
  h: number;
}

/**
 * Geometric bounding coordinates expressed as CSS percentages.
 */
export interface LayoutPanelBounds {
  /** Horizontal offset percentage. */
  x: string;
  /** Vertical offset percentage. */
  y: string;
  /** Width percentage. */
  w: string;
  /** Height percentage. */
  h: string;
}

/**
 * Structural arrangement definition for layout thumbnail components.
 */
export interface LayoutStructureDefinition {
  /** Optional bounding box for the decorative branding section. */
  brandingPanel?: LayoutPanelBounds;
  /** Bounding box for the interactive login form section. */
  formPanel: LayoutPanelBounds;
  /** Overall composition style category. */
  style: "split" | "centered" | "overlay" | "full";
}

/**
 * Supported thumbnail sizing options.
 */
export type LayoutThumbnailSize = "sm" | "md" | "lg";

/**
 * Resolves thumbnail dimensions based on the requested size tier.
 *
 * @param size The size variant tier.
 * @returns Width and height in pixels.
 */
export function getThumbnailDimensions(size: LayoutThumbnailSize): ThumbnailDimensions {
  switch (size) {
    case "sm":
      return { w: 80, h: 56 };
    case "md":
      return { w: 120, h: 80 };
    case "lg":
      return { w: 180, h: 120 };
  }
}

/**
 * Maps layout identifiers to geometric panel coordinate configurations.
 *
 * @param layout The layout identifier string.
 * @returns Position specifications for form and branding sections.
 */
export function getLayoutStructure(layout: string): LayoutStructureDefinition {
  switch (layout) {
    case "split-right":
      return {
        brandingPanel: { x: "0%", y: "0%", w: "50%", h: "100%" },
        formPanel: { x: "55%", y: "20%", w: "40%", h: "60%" },
        style: "split",
      };
    case "split-left":
      return {
        brandingPanel: { x: "50%", y: "0%", w: "50%", h: "100%" },
        formPanel: { x: "5%", y: "20%", w: "40%", h: "60%" },
        style: "split",
      };
    case "split-diagonal":
      return {
        brandingPanel: { x: "0%", y: "0%", w: "55%", h: "100%" },
        formPanel: { x: "50%", y: "15%", w: "45%", h: "70%" },
        style: "split",
      };
    case "centered":
    case "minimal":
      return {
        formPanel: { x: "25%", y: "20%", w: "50%", h: "65%" },
        style: "centered",
      };
    case "glass-morphism":
      return {
        formPanel: { x: "20%", y: "15%", w: "60%", h: "70%" },
        style: "overlay",
      };
    case "magazine":
      return {
        brandingPanel: { x: "0%", y: "0%", w: "60%", h: "100%" },
        formPanel: { x: "62%", y: "10%", w: "35%", h: "80%" },
        style: "split",
      };
    case "spotlight":
      return {
        formPanel: { x: "30%", y: "25%", w: "40%", h: "55%" },
        style: "centered",
      };
    case "stacked":
      return {
        formPanel: { x: "20%", y: "30%", w: "60%", h: "65%" },
        style: "centered",
      };
    case "overlay":
      return {
        formPanel: { x: "15%", y: "10%", w: "70%", h: "80%" },
        style: "overlay",
      };
    case "floating":
      return {
        formPanel: { x: "25%", y: "15%", w: "50%", h: "70%" },
        style: "centered",
      };
    case "immersive":
      return {
        formPanel: { x: "25%", y: "20%", w: "50%", h: "60%" },
        style: "full",
      };
    default:
      return {
        formPanel: { x: "25%", y: "20%", w: "50%", h: "60%" },
        style: "centered",
      };
  }
}

/**
 * Calculates the relative perceived luminance of a hex color according to WCAG 2.1 guidelines.
 * Returns a value ranging from 0.0 (deepest black) to 1.0 (pure white).
 * Invalid or unparseable input defaults to 1.0 to ensure readable contrast fallbacks.
 *
 * @param hex The hexadecimal color string (with or without leading hash).
 * @returns Perceived relative luminance scalar.
 */
export function calculateRelativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean;

  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return 1;

  const channel = (start: number) => {
    const c = parseInt(full.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };

  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/**
 * Determines whether light or dark foreground marks should render on the given background color.
 *
 * @param bgHex The background hexadecimal color.
 * @returns The appropriate base ink color value ("black" or "white").
 */
export function getContrastingInkBase(bgHex: string): "white" | "black" {
  return calculateRelativeLuminance(bgHex) > 0.5 ? "black" : "white";
}
