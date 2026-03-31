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
    case "sm": return { w: 80, h: 56 };
    case "md": return { w: 120, h: 80 };
    case "lg": return { w: 180, h: 120 };
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

export function LayoutPreviewThumbnail({
  layout,
  accentColor,
  surfaceColor = "#ffffff",
  className,
  size = "md",
}: LayoutPreviewThumbnailProps) {
  const dims = getDimensions(size);
  const structure = getLayoutStructure(layout);
  const lineSize = size === "sm" ? "2px" : size === "md" ? "3px" : "4px";
  const smallLineSize = size === "sm" ? "1.5px" : size === "md" ? "2px" : "3px";
  const gap = size === "sm" ? "2px" : size === "md" ? "3px" : "4px";

  return (
    <div
      className={cn(
        "relative rounded-md overflow-hidden border border-border/40 shrink-0",
        className,
      )}
      style={{
        width: dims.w,
        height: dims.h,
        background: structure.style === "split" || structure.style === "full"
          ? accentColor
          : surfaceColor,
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
            className="absolute rounded-sm"
            style={{
              left: "20%",
              top: "35%",
              width: "60%",
              height: lineSize,
              background: `rgba(255,255,255,0.6)`,
            }}
          />
          {/* Mock tagline */}
          <div
            className="absolute rounded-sm"
            style={{
              left: "30%",
              top: "45%",
              width: "40%",
              height: smallLineSize,
              background: `rgba(255,255,255,0.3)`,
            }}
          />
        </div>
      )}

      {/* Form panel */}
      <div
        className="absolute rounded-sm"
        style={{
          left: structure.formPanel.x,
          top: structure.formPanel.y,
          width: structure.formPanel.w,
          height: structure.formPanel.h,
          background: structure.style === "overlay"
            ? `rgba(255,255,255,0.85)`
            : surfaceColor,
          border: `1px solid rgba(0,0,0,0.06)`,
          boxShadow: structure.style === "overlay" || structure.style === "centered"
            ? "0 2px 8px rgba(0,0,0,0.08)"
            : "none",
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
              background: "rgba(0,0,0,0.2)",
              marginBottom: gap,
            }}
          />
          {/* Input field 1 */}
          <div
            className="rounded-sm"
            style={{
              width: "100%",
              height: lineSize,
              background: "rgba(0,0,0,0.08)",
              border: "0.5px solid rgba(0,0,0,0.05)",
            }}
          />
          {/* Input field 2 */}
          <div
            className="rounded-sm"
            style={{
              width: "100%",
              height: lineSize,
              background: "rgba(0,0,0,0.08)",
              border: "0.5px solid rgba(0,0,0,0.05)",
            }}
          />
          {/* Button */}
          <div
            className="rounded-sm"
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
              background: "rgba(0,0,0,0.1)",
            }}
          />
        </div>
      </div>

      {/* Glass effect for glassmorphism layout */}
      {structure.style === "overlay" && (
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${accentColor}22, transparent 60%)`,
          }}
        />
      )}
    </div>
  );
}
