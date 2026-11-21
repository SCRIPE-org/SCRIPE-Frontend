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
 * Motion: a calm hairline brighten (rest → hover) with a flat matte card slab —
 * zero resting box shadows or colored glows.
 * Accessibility: uses a non-interactive card wrapper + stretched primary trigger
 * button + sibling pin button at higher z-index (zero nested interactive controls).
 * Focus: the shared nx lit-edge ring (:focus-visible only).
 * Pin star: filled star top-end when pinned; a hover/focus-revealed outline
 * star otherwise.
 * Locked: the shared --nx-scrim overlay + lock glyph + a warning "Upgrade" pill.
 */

import React, { useCallback, useId } from "react";
import { Star, Lock } from "lucide-react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";

// ── Accent helpers ───────────────────────────────────────────────────────────

/** Derive subtle Nexus-safe icon chip tint and accent marker from an OKLCH hue + chroma.
 *  Keeps tile slabs 100% flat matte (`--nx-surface`) with `--nx-ink` / `--nx-ink-2`
 *  foregrounds while preserving workspace color identity in both Dark & Light modes. */
function deriveAccentTone(hue: number, chroma: number): {
  chipSurface: string;
  chipBorder: string;
  dotColor: string;
} {
  const c = Math.min(chroma, 0.28);
  const accent = `oklch(0.66 ${c} ${hue})`;
  return {
    chipSurface: `color-mix(in srgb, var(--nx-raised) 82%, ${accent})`,
    chipBorder: `color-mix(in srgb, var(--nx-line-hi) 62%, ${accent})`,
    dotColor: accent,
  };
}

/** Muted tone for workspaces without a custom colour. */
const ADMIN_TONES: Record<string, { hue: number; chroma: number }> = {
  admin: { hue: 265, chroma: 0.04 },
  _default: { hue: 262, chroma: 0.06 },
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
  isPinDisabled?: boolean;
  accessibleItemCount: number;
  itemLabel: string;
  size?: "lg" | "md";
  onClick: () => void;
  onTogglePin?: (e: React.MouseEvent) => void;
  upgradeBadgeText?: string;
}

// ── Tile dimensions per size ──────────────────────────────────────────────────

const DIMS = {
  lg: { iconSize: 30, nameSize: 14, countSize: 11.5, iconChip: 42 },
  md: { iconSize: 24, nameSize: 12.5, countSize: 10.5, iconChip: 36 },
} as const;

const TILE_SIZE_CLASSES = {
  lg: "w-full min-w-0 min-h-[144px] sm:h-[158px] p-4 sm:p-[18px]",
  md: "h-[124px] w-[124px] shrink-0 p-3.5",
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
  isPinDisabled = false,
  accessibleItemCount,
  itemLabel,
  size = "lg",
  onClick,
  onTogglePin,
  upgradeBadgeText,
}: HubModuleTileProps) {
  const { t } = useI18n();
  const baseId = useId();
  const titleId = `${baseId}-title`;
  const metaId = `${baseId}-meta`;
  const dims = DIMS[size];

  const hasCustomColor = colorHue !== null;
  const chroma = colorChroma ?? 0.18;
  const hue = colorHue ?? 270;
  const adminTone = ADMIN_TONES[name.toLowerCase()] ?? ADMIN_TONES._default;
  const accentTone = hasCustomColor
    ? deriveAccentTone(hue, chroma)
    : deriveAccentTone(adminTone.hue, adminTone.chroma);

  const handleClick = useCallback(() => {
    onClick?.();
  }, [onClick]);

  const pinOverlayClass = cn(
    "absolute end-2.5 top-2.5 z-20 h-7 w-7 [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-9 rounded-nx-sm p-0 transition-colors focus-visible:shadow-nx-focus focus-visible:outline-none hover:bg-nx-hover",
    isPinned ? "text-nx-accent" : "text-nx-ink-3 hover:text-nx-ink"
  );

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between rounded-nx-lg text-start",
        "border bg-nx-surface text-nx-ink transition-[border-color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
        TILE_SIZE_CLASSES[size],
        isLocked
          ? "border-nx-line opacity-90 hover:border-nx-line-hi"
          : "border-nx-line hover:border-nx-line-hi"
      )}
    >
      {/* Stretched primary trigger — sibling to pin control (zero nested buttons) */}
      <Button
        type="button"
        variant="ghost"
        onClick={handleClick}
        aria-disabled={isLocked}
        aria-labelledby={titleId}
        aria-describedby={accessibleItemCount > 0 && !isLocked ? metaId : undefined}
        className="absolute inset-0 z-0 h-full w-full cursor-pointer rounded-nx-lg border-0 bg-transparent p-0 hover:bg-transparent focus-visible:shadow-nx-focus focus-visible:outline-none"
      />

      {/* Pin star (top corner, pinned state) */}
      {isPinned && !isLocked && (onTogglePin || isPinDisabled) && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (!isPinDisabled) onTogglePin?.(e);
          }}
          disabled={isPinLoading || isPinDisabled}
          aria-label={t("workspaceHub.pin.unpinWorkspace", { name })}
          className={cn(pinOverlayClass, isPinDisabled && "cursor-not-allowed opacity-60")}
          style={{ cursor: isPinLoading ? "wait" : isPinDisabled ? "not-allowed" : "pointer" }}
        >
          <Star size={13} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        </Button>
      )}

      {/* Unpin star on hover/touch/focus-within (when not pinned and not read-only) */}
      {!isPinned && !isLocked && onTogglePin && !isPinDisabled && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(e);
          }}
          disabled={isPinLoading}
          aria-label={t("workspaceHub.pin.pinWorkspace", { name })}
          className={cn(
            pinOverlayClass,
            "opacity-100 sm:opacity-0 sm:transition-opacity sm:duration-nx-micro sm:ease-nx-enter sm:focus-visible:opacity-100 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 [@media(pointer:coarse)]:opacity-100 motion-reduce:transition-none"
          )}
          style={{ cursor: isPinLoading ? "wait" : "pointer" }}
        >
          <Star size={13} strokeWidth={1.75} aria-hidden="true" />
        </Button>
      )}

      {/* Icon chip + subtle category marker */}
      <div className="pointer-events-none relative z-10 flex items-start justify-between gap-2">
        <div
          className="inline-flex items-center justify-center rounded-nx-md text-nx-ink"
          style={{
            width: dims.iconChip,
            height: dims.iconChip,
            background: accentTone.chipSurface,
            border: `1px solid ${accentTone.chipBorder}`,
          }}
        >
          <DynamicIcon name={icon || "Layers"} size={dims.iconSize} />
        </div>
        {!isLocked && !onTogglePin && (
          <span
            className="mt-1 h-2 w-2 rounded-full shrink-0"
            style={{ backgroundColor: accentTone.dotColor }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Name + item count */}
      <div className="pointer-events-none relative z-10 flex min-w-0 flex-col gap-0.5">
        <span
          id={titleId}
          className="line-clamp-2 font-semibold leading-tight tracking-tight text-nx-ink"
          style={{ fontSize: dims.nameSize }}
        >
          <bdi>{name}</bdi>
        </span>
        {accessibleItemCount > 0 && !isLocked && (
          <span
            id={metaId}
            className="truncate font-medium tabular-nums text-nx-ink-2"
            style={{ fontSize: dims.countSize }}
          >
            {itemLabel}
          </span>
        )}
      </div>

      {/* Locked overlay — high-contrast Nexus matte veil */}
      {isLocked && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 rounded-nx-lg bg-nx-surface/85 backdrop-blur-[2px] text-nx-ink">
          <div className="flex h-[38px] w-[38px] items-center justify-center rounded-full border border-nx-line-hi bg-nx-raised text-nx-ink">
            <Lock size={18} strokeWidth={1.75} aria-hidden="true" />
          </div>
          <div className="rounded-full bg-warning px-2.5 py-1 text-[10.5px] font-semibold tracking-wide text-warning-foreground">
            {upgradeBadgeText ?? t("workspaceHub.upgradeBadge")}
          </div>
        </div>
      )}
    </div>
  );
}
