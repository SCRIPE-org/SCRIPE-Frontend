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

import React from "react";
import { cn } from "@/core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import {
  type LayoutThumbnailSize,
  getThumbnailDimensions,
  getLayoutStructure,
  getContrastingInkBase,
} from "./layoutPreviewHelpers";

/**
 * Documentation for module export
 */
export interface LayoutPreviewThumbnailProps {
  /** The layout configuration identifier. */
  layout: string;
  /** Primary accent color token in hex format. */
  accentColor: string;
  /** Surface background color in hex format (defaults to #ffffff). */
  surfaceColor?: string;
  /** Optional additional CSS class names. */
  className?: string;
  /** Size variant tier (defaults to "md"). */
  size?: LayoutThumbnailSize;
}

/**
 * Presentation UI component rendering the layout preview thumbnail.
 * Renders a structural miniature representation of a login page layout
 * with accurate contrast-adjusted ink marks and accessible image semantics.
 *
 * @param props Layout and color configuration properties.
 * @returns A scaled structural preview widget.
 */
export function LayoutPreviewThumbnail({
  layout,
  accentColor,
  surfaceColor = "#ffffff",
  className,
  size = "md",
}: LayoutPreviewThumbnailProps): React.JSX.Element {
  const { t } = useI18n();
  const dims = getThumbnailDimensions(size);
  const structure = getLayoutStructure(layout);
  const lineSize = size === "sm" ? "2px" : size === "md" ? "3px" : "4px";
  const smallLineSize = size === "sm" ? "1.5px" : size === "md" ? "2px" : "3px";
  const gap = size === "sm" ? "2px" : size === "md" ? "3px" : "4px";

  const brandingInk = getContrastingInkBase(accentColor);
  const surfaceInk = getContrastingInkBase(surfaceColor);

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
          {/* Mock logo indicator */}
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
          {/* Mock tagline indicator */}
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

      {/* Form panel representation */}
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

      {/* Glass overlay effect for glassmorphism layout */}
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
