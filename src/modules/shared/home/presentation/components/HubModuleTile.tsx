"use client";

/**
 * HubModuleTile — The heart of the Hub page.
 *
 * A 3-stop gradient tile derived from the workspace's own OKLCH hue/chroma —
 * every custom-coloured tile keeps its own identity in both themes, the same
 * way an app icon does. Admin/uncustomised workspaces fall back to a
 * low-chroma neutral tone through the SAME formula, so the file carries one
 * gradient function, not a second hardcoded map.
 *
 * Motion: a calm hairline brighten (rest → hover) plus the tile's own
 * shadow-nx-sm lift — the design bar's whole glow budget is ONE element per
 * screen, and a 20-tile grid cannot each carry its own coloured glow, so
 * there is no glow and no scale here at all.
 * Focus: the shared nx lit-edge ring (:focus-visible only — hover stays a
 * pointer affordance, keyboard gets the ring).
 * Pin star: filled star top-end when pinned; a hover/focus-revealed outline
 * star otherwise.
 * Locked: the shared --nx-scrim overlay + lock glyph + a warning "Upgrade" pill.
 */

import React, { useCallback } from "react";
import { Star, Lock } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";

// ── Gradient helper ────────────────────────────────────────────────────────

/** Derive a 3-stop tile gradient from an OKLCH hue + chroma. Used for both a
 *  workspace's custom colour and the muted admin/default tone below, so the
 *  tile never needs a second, hardcoded gradient. */
function deriveGradient(hue: number, chroma: number): string {
  const c = Math.min(chroma, 0.35);
  return `linear-gradient(135deg, oklch(0.72 ${c} ${hue}) 0%, oklch(0.55 ${c} ${hue}) 55%, oklch(0.38 ${c} ${hue}) 100%)`;
}

/** Muted tone for workspaces without a custom colour — same formula, just a
 *  near-neutral hue/chroma pair instead of the workspace's own. */
const ADMIN_TONES: Record<string, { hue: number; chroma: number }> = {
  admin: { hue: 265, chroma: 0.03 },
  _default: { hue: 262, chroma: 0.05 },
};

// The icon chip and locked glyph sit on top of a dynamic, data-owned
// gradient of unknown lightness, so their fill/border tint the one ink token
// legal atop a filled surface (--nx-on-fill) rather than a literal white.
const CHIP_FILL = "color-mix(in srgb, var(--nx-on-fill) 15%, transparent)";
const CHIP_BORDER = "color-mix(in srgb, var(--nx-on-fill) 22%, transparent)";

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
  lg: { w: 158, h: 158, iconSize: 30, nameSize: 14, countSize: 11.5, pad: 18, iconChip: 42 },
  md: { w: 124, h: 124, iconSize: 24, nameSize: 12.5, countSize: 10.5, pad: 14, iconChip: 36 },
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
  upgradeBadgeText,
}: HubModuleTileProps) {
  const { t } = useI18n();
  const dims = DIMS[size];

  // Derive the gradient from workspace colour data — the same formula
  // whether the hue is real (a customised workspace) or the muted fallback.
  const hasCustomColor = colorHue !== null;
  const chroma = colorChroma ?? 0.18;
  const hue = colorHue ?? 270;
  const adminTone = ADMIN_TONES[name.toLowerCase()] ?? ADMIN_TONES._default;
  const gradient = hasCustomColor
    ? deriveGradient(hue, chroma)
    : deriveGradient(adminTone.hue, adminTone.chroma);

  const handleClick = useCallback(() => {
    if (!isLocked || onClick) onClick();
  }, [isLocked, onClick]);

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-disabled={isLocked}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-nx-lg text-start",
        "border shadow-nx-sm transition-[border-color] duration-nx-standard ease-nx-enter",
        "outline-none focus-visible:shadow-nx-focus motion-reduce:transition-none",
        isLocked
          ? "cursor-not-allowed border-[color:color-mix(in_srgb,var(--nx-on-fill)_10%,transparent)]"
          : "cursor-pointer border-[color:color-mix(in_srgb,var(--nx-on-fill)_14%,transparent)] hover:border-[color:color-mix(in_srgb,var(--nx-on-fill)_28%,transparent)]"
      )}
      style={{
        width: dims.w,
        height: dims.h,
        padding: dims.pad,
        background: gradient,
        color: "var(--nx-on-fill)",
        filter: isLocked ? "saturate(0.25) brightness(0.85)" : "none",
      }}
    >
      {/* Pin star (top corner, pinned state) */}
      {isPinned && !isLocked && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin?.(e);
          }}
          disabled={isPinLoading}
          aria-label={t("workspaceHub.pin.unpin")}
          className="absolute end-3 top-3 z-raised rounded-nx-sm p-0 text-nx-on-fill focus-visible:shadow-nx-focus focus-visible:outline-none"
          style={{ cursor: isPinLoading ? "wait" : "pointer" }}
        >
          <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
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
          aria-label={t("workspaceHub.pin.pin")}
          className="absolute end-3 top-3 z-raised rounded-nx-sm p-0 text-nx-on-fill opacity-0 transition-opacity duration-nx-micro ease-nx-enter focus-visible:opacity-100 focus-visible:shadow-nx-focus focus-visible:outline-none group-hover:opacity-100 motion-reduce:transition-none"
          style={{ cursor: isPinLoading ? "wait" : "pointer" }}
        >
          <Star size={13} strokeWidth={1.75} aria-hidden="true" />
        </button>
      )}

      {/* Icon chip */}
      <div className="relative flex items-start">
        <div
          className="inline-flex items-center justify-center rounded-nx-md text-nx-on-fill"
          style={{
            width: dims.iconChip,
            height: dims.iconChip,
            background: CHIP_FILL,
            border: `1px solid ${CHIP_BORDER}`,
          }}
        >
          <DynamicIcon name={icon || "Layers"} size={dims.iconSize} />
        </div>
      </div>

      {/* Name + item count */}
      <div className="relative flex flex-col gap-0.5">
        <span
          className="font-semibold leading-tight tracking-tight text-nx-on-fill"
          style={{ fontSize: dims.nameSize }}
        >
          {name}
        </span>
        {accessibleItemCount > 0 && !isLocked && (
          <span
            className="font-medium"
            style={{
              fontSize: dims.countSize,
              color: "color-mix(in srgb, var(--nx-on-fill) 74%, transparent)",
            }}
          >
            {itemLabel}
          </span>
        )}
      </div>

      {/* Locked overlay — the shared scrim, clipped by the tile's own rounding */}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-scrim text-nx-on-fill">
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 38,
              height: 38,
              background: CHIP_FILL,
              border: `1px solid ${CHIP_BORDER}`,
            }}
          >
            <Lock size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="rounded-full bg-warning px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-warning-foreground">
            {upgradeBadgeText ?? t("workspaceHub.upgradeBadge")}
          </div>
        </div>
      )}
    </button>
  );
}
