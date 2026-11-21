"use client";

import React, { useId } from "react";
import { Lock, Star } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { DynamicIcon } from "@core/ui/layout/shared";

/** Props for {@link HubAppSquircle}. */
export interface HubAppSquircleProps {
  /** Localized display name of the workspace. */
  name: string;
  /** Lucide icon name. */
  icon: string;
  /** Optional OKLCH hue (0-360). */
  colorHue: number | null;
  /** Optional OKLCH chroma (0-0.4). */
  colorChroma: number | null;
  /** Whether the workspace is locked behind billing or context requirements. */
  isLocked: boolean;
  /** Whether the workspace is pinned by the current administrator. */
  isPinned: boolean;
  /** True while a pin mutation for this workspace is in flight. */
  isPinLoading?: boolean;
  /** True during impersonation sessions where personal pin edits are disabled. */
  isPinDisabled?: boolean;
  /** Callback fired when clicking the primary workspace squircle. */
  onClick: () => void;
  /** Callback fired when clicking the sibling pin star button. */
  onTogglePin?: (e: React.MouseEvent) => void;
  /** Optional lock badge text (`Upgrade` or `Select a Tenant`). */
  upgradeBadgeText?: string;
}

function deriveVesselTone(
  hue: number | null,
  chroma: number | null
): { vesselBg: string; vesselBorder: string; iconColor: string } {
  const safeHue = hue ?? 262;
  const safeChroma = Math.min(chroma ?? (hue !== null ? 0.16 : 0.05), 0.24);
  const accent = `oklch(0.64 ${safeChroma} ${safeHue})`;
  return {
    vesselBg: `color-mix(in srgb, var(--nx-raised) 82%, ${accent})`,
    vesselBorder: `color-mix(in srgb, var(--nx-line-hi) 68%, ${accent})`,
    iconColor: `color-mix(in srgb, var(--nx-ink) 38%, ${accent})`,
  };
}

/**
 * Odoo-inspired 72x72px Nexus Framed Squircle App Vessel for `/hub`. Uses a stretched
 * primary `<Button>` sibling to an independent top-end pin star `<Button>` (zero nested
 * interactive buttons), OKLCH-tinted 44x44px icon geometry, and flat matte surfaces.
 */
export function HubAppSquircle({
  name,
  icon,
  colorHue,
  colorChroma,
  isLocked,
  isPinned,
  isPinLoading = false,
  isPinDisabled = false,
  onClick,
  onTogglePin,
  upgradeBadgeText,
}: HubAppSquircleProps) {
  const { t } = useI18n();
  const titleId = useId();
  const descId = useId();
  const tone = deriveVesselTone(colorHue, colorChroma);

  const showPinButton = !isLocked && Boolean(onTogglePin || isPinDisabled);
  const pinAriaLabel = isPinned
    ? t("workspaceHub.pin.unpinWorkspace", { name })
    : t("workspaceHub.pin.pinWorkspace", { name });

  return (
    <div
      data-testid="hub-app-squircle"
      className="group relative flex w-full max-w-[112px] flex-col items-center rounded-nx-lg p-1.5"
    >
      {/* Stretched primary trigger — sibling to pin control (zero nested buttons) */}
      <Button
        type="button"
        variant="ghost"
        onClick={onClick}
        aria-disabled={isLocked}
        aria-labelledby={titleId}
        aria-describedby={isLocked && upgradeBadgeText ? descId : undefined}
        className={cn(
          "absolute inset-0 z-0 h-full w-full cursor-pointer rounded-nx-lg border-0 bg-transparent p-0 hover:bg-transparent focus-visible:outline-none focus-visible:shadow-nx-focus",
          isLocked && "aria-disabled:pointer-events-auto"
        )}
      />

      {/* Sibling pin star control */}
      {showPinButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            if (!isPinDisabled) onTogglePin?.(e);
          }}
          disabled={isPinLoading || isPinDisabled}
          aria-label={pinAriaLabel}
          className={cn(
            "absolute end-1 top-0.5 z-20 h-7 w-7 rounded-full border border-nx-line/80 bg-nx-surface/95 p-0 transition-opacity duration-nx-micro hover:border-nx-line-hi hover:bg-nx-raised focus-visible:outline-none focus-visible:shadow-nx-focus [@media(pointer:coarse)]:h-9 [@media(pointer:coarse)]:w-9 motion-reduce:transition-none",
            isPinned
              ? "opacity-100 text-nx-accent"
              : "text-nx-ink-3 opacity-100 hover:text-nx-ink sm:opacity-0 sm:focus-visible:opacity-100 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 [@media(pointer:coarse)]:opacity-100",
            isPinDisabled && "cursor-not-allowed opacity-60"
          )}
        >
          <Star
            size={12}
            fill={isPinned ? "currentColor" : "none"}
            strokeWidth={isPinned ? 0 : 1.75}
            aria-hidden="true"
          />
        </Button>
      )}

      {/* 72x72px framed matte squircle */}
      <div
        className={cn(
          "pointer-events-none relative z-10 flex h-[72px] w-[72px] items-center justify-center rounded-[18px] border border-nx-line bg-nx-surface transition-[border-color,background-color,transform] duration-nx-micro ease-nx-enter group-hover:border-nx-line-hi group-hover:bg-nx-raised group-active:scale-[0.97] motion-reduce:transition-none motion-reduce:group-active:scale-100",
          isLocked && "opacity-75"
        )}
      >
        {/* 44x44px OKLCH-tinted geometric icon vessel */}
        <div
          className="flex h-[44px] w-[44px] items-center justify-center rounded-[12px]"
          style={{
            background: tone.vesselBg,
            border: `1px solid ${tone.vesselBorder}`,
            color: tone.iconColor,
          }}
        >
          <DynamicIcon name={icon || "Layers"} size={22} strokeWidth={1.85} />
        </div>

        {isLocked && (
          <span
            aria-hidden="true"
            className="absolute -bottom-1 -end-1 flex h-5 w-5 items-center justify-center rounded-full border border-nx-line bg-nx-raised text-nx-warning-strong"
          >
            <Lock className="h-2.5 w-2.5" aria-hidden="true" />
          </span>
        )}
      </div>

      {/* Centered 13px label */}
      <span
        id={titleId}
        className="pointer-events-none relative z-10 mt-2.5 line-clamp-2 w-full text-center text-[13px] font-medium leading-snug text-nx-ink"
      >
        <bdi>{name}</bdi>
      </span>

      {isLocked && upgradeBadgeText && (
        <Badge
          id={descId}
          variant="warning"
          className="pointer-events-none relative z-10 mt-1 px-2 py-0 text-[10px]"
        >
          {upgradeBadgeText}
        </Badge>
      )}
    </div>
  );
}
