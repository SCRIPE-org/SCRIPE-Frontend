/**
 * LayoutPreviewThumbnail -- Reusable mini-preview for login page layouts
 *
 * Renders a tiny CSS structural diagram showing the login page structure.
 * Shows: form position, branding panel position, background color.
 * Used on marketplace cards, detail modals, and layout selection panel.
 *
 * @module customization/presentation/components
 */
"use client";

import { cn } from "@/core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

interface LayoutPreviewThumbnailProps {
  layout: string;
  accentColor: string;
  surfaceColor?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/** Get thumbnail dimensions based on size variant */
function getDimensions(size: "sm" | "md" | "lg") {
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
 * Maps layout names to structural configurations for the thumbnail.
 * Each returns positions for the branding panel and form panel.
 */
function getLayoutStructure(layout: string): {
  brandingPanel?: { x: string; y: string; w: string; h: string };
  formPanel: { x: string; y: string; w: string; h: string };
  style: "split" | "centered" | "overlay" | "full";
} {
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
 * Perceived (WCAG relative) luminance of a hex colour, 0 (black) - 1 (white).
 * Unparseable input is treated as light so callers fall back to dark ink —
 * the safer default when a tenant-supplied value can't be read.
 */
function relativeLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  const full = clean.length === 3
    ? clean.split("").map((c) => c + c).join("")
    : clean;
  if (full.length !== 6 || /[^0-9a-fA-F]/.test(full)) return 1;
  const channel = (start: number) => {
    const c = parseInt(full.slice(start, start + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}

/**
 * This thumbnail draws structural "ink" (mock text/lines) directly over
 * arbitrary tenant colours (accent / surface). A fixed white or black mark
 * would vanish whenever that colour happens to be near-white or near-black,
 * so the ink shade is derived from the actual colour it sits on.
 */
function inkBaseFor(bgHex: string): "white" | "black" {
  return relativeLuminance(bgHex) > 0.5 ? "black" : "white";
}

/**
 * Presentation UI component rendering the layout preview thumbnail.
 * Purely decorative structure — the only visual indicator of which login
 * layout a theme/bundle uses, so it carries a real accessible name rather
 * than being hidden from assistive tech.
 */
export function LayoutPreviewThumbnail({
  layout,
  accentColor,
  surfaceColor = "#ffffff",
  className,
  size = "md",
}: LayoutPreviewThumbnailProps) {
  const { t } = useI18n();
  const dims = getDimensions(size);
  const structure = getLayoutStructure(layout);
  const lineSize = size === "sm" ? "2px" : size === "md" ? "3px" : "4px";
  const smallLineSize = size === "sm" ? "1.5px" : size === "md" ? "2px" : "3px";
  const gap = size === "sm" ? "2px" : size === "md" ? "3px" : "4px";

  const brandingInk = inkBaseFor(accentColor);
  const surfaceInk = inkBaseFor(surfaceColor);

  return (
    <div
      role="img"
      aria-label={t("studio.layoutPreview.ariaLabel", { layout })}
      className={cn(
        "relative shrink-0 overflow-hidden rounded-nx-sm border border-nx-line",
        className
      )}
      style={{
        width: dims.w,
        height: dims.h,
        background:
          structure.style === "split" || structure.style === "full" ? accentColor : surfaceColor,
      }}
    >
      {/* Branding panel (for split layouts) */}
      {structure.brandingPanel && (
        <div
          className="absolute"
          style={{
            left: structure.brandingPanel.x,
            top: structure.brandingPanel.y,
            width: structure.brandingPanel.w,
            height: structure.brandingPanel.h,
            background: accentColor,
          }}
        >
          {/* Mock logo */}
          <div
            className="absolute rounded-nx-sm"
            style={{
              left: "20%",
              top: "35%",
              width: "60%",
              height: lineSize,
              background: `color-mix(in srgb, ${brandingInk} 60%, transparent)`,
            }}
          />
          {/* Mock tagline */}
          <div
            className="absolute rounded-nx-sm"
            style={{
              left: "30%",
              top: "45%",
              width: "40%",
              height: smallLineSize,
              background: `color-mix(in srgb, ${brandingInk} 30%, transparent)`,
            }}
          />
        </div>
      )}

      {/* Form panel */}
      <div
        className="absolute rounded-nx-sm border border-nx-line shadow-nx-sm"
        style={{
          left: structure.formPanel.x,
          top: structure.formPanel.y,
          width: structure.formPanel.w,
          height: structure.formPanel.h,
          background:
            structure.style === "overlay"
              ? `color-mix(in srgb, white 85%, transparent)`
              : surfaceColor,
        }}
      >
        {/* Mock form elements */}
        <div
          className="absolute flex flex-col items-center"
          style={{
            left: "15%",
            top: "10%",
            right: "15%",
            bottom: "15%",
            gap,
          }}
        >
          {/* Title line */}
          <div
            className="rounded-full"
            style={{
              width: "60%",
              height: lineSize,
              background: `color-mix(in srgb, ${surfaceInk} 20%, transparent)`,
              marginBottom: gap,
            }}
          />
          {/* Input field 1 */}
          <div
            className="rounded-nx-sm border"
            style={{
              width: "100%",
              height: lineSize,
              background: `color-mix(in srgb, ${surfaceInk} 8%, transparent)`,
              borderColor: `color-mix(in srgb, ${surfaceInk} 5%, transparent)`,
            }}
          />
          {/* Input field 2 */}
          <div
            className="rounded-nx-sm border"
            style={{
              width: "100%",
              height: lineSize,
              background: `color-mix(in srgb, ${surfaceInk} 8%, transparent)`,
              borderColor: `color-mix(in srgb, ${surfaceInk} 5%, transparent)`,
            }}
          />
          {/* Button */}
          <div
            className="rounded-nx-sm"
            style={{
              width: "100%",
              height: lineSize,
              background: accentColor,
              marginTop: gap,
            }}
          />
          {/* Footer link */}
          <div
            className="rounded-full"
            style={{
              width: "40%",
              height: smallLineSize,
              background: `color-mix(in srgb, ${surfaceInk} 10%, transparent)`,
            }}
          />
        </div>
      </div>

      {/* Glass effect for glassmorphism layout */}
      {structure.style === "overlay" && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, color-mix(in oklch, ${accentColor} 13%, transparent), transparent 60%)`,
          }}
        />
      )}
    </div>
  );
}
