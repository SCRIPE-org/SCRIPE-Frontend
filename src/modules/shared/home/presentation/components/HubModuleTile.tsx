"use client";

/**
 * HubModuleTile — The heart of the Hub page.
 *
 * Vibrant gradient tile matching the Claude Design spec exactly:
 * - 3-stop 135° gradient derived from workspace colorHue/chroma
 * - 20px border-radius, 18px padding (lg) / 14px (md)
 * - Hover: -4px translateY lift, glow shadow at 0.45 opacity, icon 1.08× scale
 * - Motion: nx standard duration/easing, with the reduced-motion path
 * - Focus: the shared nx lit-edge ring (:focus-visible only — hover stays
 *   a pointer affordance, keyboard gets the ring)
 * - Inner effects: top-right highlight orb, bottom-left vignette, noise grain
 * - Pin star: filled ⭐ top-right
 * - Locked: frosted overlay + lock circle + amber "Upgrade" pill
 */

import React, { useState, useCallback } from "react";
import { Star, Lock } from "lucide-react";
import { cn } from "@core/common/utils";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";

// ── Gradient helpers ──────────────────────────────────────────────────────────

/** Derive a 3-stop vibrant gradient from OKLCH hue + chroma. */
function deriveGradient(hue: number, chroma: number): string {
  const c = Math.min(chroma, 0.35);
  return `linear-gradient(135deg, oklch(0.72 ${c} ${hue}) 0%, oklch(0.55 ${c} ${hue}) 55%, oklch(0.38 ${c} ${hue}) 100%)`;
}

/** Muted admin gradient for workspaces without custom colors. The glow hue and
 *  chroma feed the same OKLCH shadow derivation the custom tiles use. */
const ADMIN_GRADIENTS: Record<string, { grad: string; glowHue: number; glowChroma: number }> = {
  admin: {
    grad: "linear-gradient(135deg, #3A4156 0%, #2A2F44 55%, #161A2A 100%)",
    glowHue: 265,
    glowChroma: 0.03,
  },
  _default: {
    grad: "linear-gradient(135deg, #3B4661 0%, #283455 55%, #131A2E 100%)",
    glowHue: 262,
    glowChroma: 0.05,
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
  const adminEntry = ADMIN_GRADIENTS[name.toLowerCase()] ?? ADMIN_GRADIENTS._default;

  const gradient = hasCustomColor ? deriveGradient(hue, chroma) : adminEntry.grad;
  const glowHue = hasCustomColor ? hue : adminEntry.glowHue;
  const glowChroma = hasCustomColor ? Math.min(chroma, 0.35) : adminEntry.glowChroma;

  // Hover state — pointer only; keyboard focus gets the lit-edge ring instead.
  const isHover = hover && !isLocked;
  const glow = `oklch(0.62 ${glowChroma} ${glowHue} / ${isHover ? 0.45 : 0.18})`;
  const innerShine = isHover ? 0.32 : 0.18;

  // The shadow lives in a CSS variable so the class ladder stays in charge:
  // shadow-[var(--hub-tile-shadow)] draws the glow, focus-visible:shadow-nx-focus
  // replaces it with the shared ring. Locked tiles fall back to the calm token
  // shadow instead of a glow.
  const tileShadow = isLocked
    ? "var(--nx-shadow-sm)"
    : `0 ${isHover ? 22 : 10}px ${isHover ? 44 : 24}px -${isHover ? 8 : 12}px ${glow}, inset 0 1px 0 oklch(1 0 0 / ${innerShine})`;

  const handleClick = useCallback(() => {
    if (!isLocked || onClick) onClick();
  }, [isLocked, onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-disabled={isLocked}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden border-0 text-start",
        "shadow-[var(--hub-tile-shadow)] transition-[transform,box-shadow] duration-nx-standard ease-nx-enter",
        "outline-none focus-visible:shadow-nx-focus",
        "motion-reduce:transform-none motion-reduce:transition-none",
        isLocked ? "cursor-not-allowed" : "cursor-pointer hover:-translate-y-1"
      )}
      style={
        {
          width: dims.w,
          height: dims.h,
          padding: dims.pad,
          borderRadius: 20,
          background: gradient,
          color: "#fff",
          filter: isLocked ? "saturate(0.25) brightness(0.85)" : "none",
          font: "inherit",
          "--hub-tile-shadow": tileShadow,
        } as React.CSSProperties
      }
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
          className="rounded-nx-sm focus-visible:outline-none focus-visible:shadow-nx-focus"
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

      {/* Unpin star on hover (when not pinned) — keyboard focus reveals it too */}
      {!isPinned && !isLocked && onTogglePin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin?.(e);
          }}
          disabled={isPinLoading}
          aria-label="Pin"
          className="rounded-nx-sm opacity-0 transition-opacity duration-nx-micro ease-nx-enter group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none"
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
          }}
        >
          <Star size={13} strokeWidth={1.75} />
        </button>
      )}

      {/* Icon chip */}
      <div
        className={cn(
          "relative flex origin-top items-start",
          !isLocked &&
            "transition-transform duration-nx-standard ease-nx-enter group-hover:scale-[1.08] motion-reduce:transform-none motion-reduce:transition-none"
        )}
        style={{ color: "#fff" }}
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
