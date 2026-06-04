"use client";

/**
 * HubModuleTile — The heart of the Hub page.
 *
 * Vibrant gradient tile matching the Claude Design spec exactly:
 * - 3-stop 135° gradient derived from workspace colorHue/chroma
 * - 20px border-radius, 18px padding (lg) / 14px (md)
 * - Hover: -4px translateY lift, glow shadow at 0.45 opacity, icon 1.08× scale
 * - Easing: cubic-bezier(0.16, 1, 0.3, 1) 280ms
 * - Inner effects: top-right highlight orb, bottom-left vignette, noise grain
 * - Pin star: filled ⭐ top-right
 * - Locked: frosted overlay + lock circle + amber "Upgrade" pill
 */

import React, { useState, useCallback } from "react";
import { Star, Lock } from "lucide-react";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";

// ── Gradient helpers ──────────────────────────────────────────────────────────

/** Derive a 3-stop vibrant gradient from OKLCH hue + chroma. */
function deriveGradient(hue: number, chroma: number): string {
  const c = Math.min(chroma, 0.35);
  return `linear-gradient(135deg, oklch(0.72 ${c} ${hue}) 0%, oklch(0.55 ${c} ${hue}) 55%, oklch(0.38 ${c} ${hue}) 100%)`;
}

/** Derive an RGB glow color string for box-shadow from OKLCH. */
function deriveGlowRgb(hue: number): string {
  // Convert oklch hue to rough RGB for box-shadow rgba()
  // This is an approximation — works well enough for glow effects
  const h = hue * (Math.PI / 180);
  const r = Math.round(128 + 80 * Math.cos(h));
  const g = Math.round(128 + 80 * Math.cos(h - 2.094));
  const b = Math.round(128 + 80 * Math.cos(h + 2.094));
  return `${r}, ${g}, ${b}`;
}

/** Muted admin gradient for workspaces without custom colors. */
const ADMIN_GRADIENTS: Record<string, { grad: string; glow: string }> = {
  admin: {
    grad: "linear-gradient(135deg, #3A4156 0%, #2A2F44 55%, #161A2A 100%)",
    glow: "58, 65, 86",
  },
  _default: {
    grad: "linear-gradient(135deg, #3B4661 0%, #283455 55%, #131A2E 100%)",
    glow: "59, 70, 97",
  },
};

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HubModuleTileProps {
  name: string;
  icon: string;
  colorHue: number | null;
  colorChroma: number | null;
  isLocked: boolean;
  isPinned: boolean;
  isPinLoading?: boolean;
  accessibleItemCount: number;
  itemLabel: string;
  size?: "lg" | "md";
  onClick: () => void;
  onTogglePin?: (e: React.MouseEvent) => void;
  upgradeBadgeText?: string;
}

// ── Tile dimensions per size ──────────────────────────────────────────────────

const DIMS = {
  lg: {
    w: 158,
    h: 158,
    iconSize: 30,
    nameSize: 14,
    countSize: 11.5,
    pad: 18,
    iconChip: 42,
    chipRadius: 12,
  },
  md: {
    w: 124,
    h: 124,
    iconSize: 24,
    nameSize: 12.5,
    countSize: 10.5,
    pad: 14,
    iconChip: 36,
    chipRadius: 10,
  },
} as const;

// ── Component ─────────────────────────────────────────────────────────────────

export function HubModuleTile({
  name,
  icon,
  colorHue,
  colorChroma,
  isLocked,
  isPinned,
  isPinLoading = false,
  accessibleItemCount,
  itemLabel,
  size = "lg",
  onClick,
  onTogglePin,
  upgradeBadgeText = "Upgrade",
}: HubModuleTileProps) {
  const [hover, setHover] = useState(false);
  const dims = DIMS[size];

  // Derive gradient + glow from workspace color data
  const hasCustomColor = colorHue !== null;
  const chroma = colorChroma ?? 0.18;
  const hue = colorHue ?? 270;

  const gradient = hasCustomColor
    ? deriveGradient(hue, chroma)
    : (ADMIN_GRADIENTS[name.toLowerCase()] ?? ADMIN_GRADIENTS._default).grad;

  const glowRgb = hasCustomColor
    ? deriveGlowRgb(hue)
    : (ADMIN_GRADIENTS[name.toLowerCase()] ?? ADMIN_GRADIENTS._default).glow;

  // Hover state
  const isHover = hover && !isLocked;
  const lift = isHover ? -4 : 0;
  const glowOpacity = isHover ? 0.45 : 0.18;
  const innerShine = isHover ? 0.32 : 0.18;

  const handleClick = useCallback(() => {
    if (!isLocked || onClick) onClick();
  }, [isLocked, onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      aria-disabled={isLocked}
      style={{
        position: "relative",
        width: dims.w,
        height: dims.h,
        padding: dims.pad,
        borderRadius: 20,
        border: "none",
        cursor: isLocked ? "not-allowed" : "pointer",
        background: gradient,
        color: "#fff",
        textAlign: "start",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        transform: `translateY(${lift}px)`,
        transition:
          "transform 280ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 280ms cubic-bezier(0.16, 1, 0.3, 1), filter 240ms ease",
        boxShadow: isLocked
          ? "0 6px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)"
          : `0 ${isHover ? 22 : 10}px ${isHover ? 44 : 24}px -${isHover ? 8 : 12}px rgba(${glowRgb}, ${glowOpacity}),
             0 2px 0 rgba(255,255,255,0.05) inset,
             inset 0 1px 0 rgba(255,255,255, ${innerShine})`,
        filter: isLocked ? "saturate(0.25) brightness(0.85)" : "none",
        overflow: "hidden",
        font: "inherit",
        outline: "none",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Top-right highlight orb */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 80% at 100% 0%, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0) 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom-left vignette */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 100% at 0% 110%, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 55%)",
          pointerEvents: "none",
        }}
      />

      {/* Noise grain */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          mixBlendMode: "overlay",
          backgroundImage:
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.02) 0 1px, transparent 1px 2px), repeating-linear-gradient(90deg, rgba(0,0,0,0.02) 0 1px, transparent 1px 2px)",
          pointerEvents: "none",
        }}
      />

      {/* Pin star (top-right) */}
      {isPinned && !isLocked && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin?.(e);
          }}
          disabled={isPinLoading}
          aria-label="Unpin"
          style={{
            position: "absolute",
            top: 12,
            insetInlineEnd: 12,
            color: "rgba(255,255,255,0.95)",
            filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.4))",
            background: "none",
            border: "none",
            cursor: isPinLoading ? "wait" : "pointer",
            padding: 0,
            zIndex: 2,
          }}
        >
          <Star size={13} fill="currentColor" strokeWidth={0} />
        </button>
      )}

      {/* Unpin star on hover (when not pinned) */}
      {!isPinned && !isLocked && onTogglePin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin?.(e);
          }}
          disabled={isPinLoading}
          aria-label="Pin"
          style={{
            position: "absolute",
            top: 12,
            insetInlineEnd: 12,
            color: "rgba(255,255,255,0.5)",
            background: "none",
            border: "none",
            cursor: isPinLoading ? "wait" : "pointer",
            padding: 0,
            zIndex: 2,
            opacity: hover ? 1 : 0,
            transition: "opacity 200ms ease",
          }}
        >
          <Star size={13} strokeWidth={1.75} />
        </button>
      )}

      {/* Icon chip */}
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          color: "#fff",
          transform: isHover ? "scale(1.08)" : "scale(1)",
          transformOrigin: "top start",
          transition: "transform 280ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: dims.iconChip,
            height: dims.iconChip,
            borderRadius: dims.chipRadius,
            background: "rgba(255,255,255,0.12)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.18)",
          }}
        >
          <DynamicIcon name={icon || "Layers"} size={dims.iconSize} />
        </div>
      </div>

      {/* Name + item count */}
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 2 }}>
        <span
          style={{
            fontSize: dims.nameSize,
            fontWeight: 600,
            letterSpacing: "-0.005em",
            color: "#fff",
            lineHeight: 1.2,
            textShadow: "0 1px 1px rgba(0,0,0,0.18)",
          }}
        >
          {name}
        </span>
        {accessibleItemCount > 0 && !isLocked && (
          <span
            style={{
              fontSize: dims.countSize,
              fontWeight: 500,
              color: "rgba(255,255,255,0.74)",
              letterSpacing: "0.005em",
            }}
          >
            {itemLabel}
          </span>
        )}
      </div>

      {/* Locked overlay */}
      {isLocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 20,
            background: "linear-gradient(160deg, rgba(10,14,26,0.55), rgba(10,14,26,0.78))",
            backdropFilter: "blur(6px) saturate(120%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            color: "#e6e9f5",
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 999,
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.14)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Lock size={18} strokeWidth={1.75} />
          </div>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 600,
              padding: "4px 10px",
              borderRadius: 999,
              background: "linear-gradient(135deg, #FFC25E 0%, #F18A1A 100%)",
              color: "#1a0e02",
              letterSpacing: "0.02em",
              boxShadow: "0 4px 10px rgba(241,138,26,0.45)",
            }}
          >
            {upgradeBadgeText}
          </div>
        </div>
      )}
    </button>
  );
}
