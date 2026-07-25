"use client";

/**
 * WorkspaceHubCard — A single workspace card in the Workspace Hub.
 *
 * Accent colour derives from the workspace's own OKLCH hue/chroma, the same
 * data-owned pattern HubModuleTile uses. The card itself stays a plain nx
 * surface with that colour only on the border and the bottom accent line —
 * one glow-carrying element per screen means a card grid cannot each cast
 * its own coloured shadow, so there is no glow and no hover lift here.
 */

import { cn } from "@core/common/utils";
import { Lock, ChevronRight } from "lucide-react";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";
import { useI18n } from "@core/providers/i18n-provider";

export interface WorkspaceHubCardProps {
  workspaceKey: string;
  nameEn: string;
  nameAr: string;
  icon: string;
  colorHue: number | null;
  colorChroma: number | null;
  isLocked: boolean;
  accessibleItemCount: number;
  language: string;
  lastAccessed: string | null;
  onClick: () => void;
  lockReason?: string;
}

export function WorkspaceHubCard({
  nameEn,
  nameAr,
  icon,
  colorHue,
  colorChroma,
  isLocked,
  accessibleItemCount,
  language,
  lastAccessed,
  onClick,
  lockReason,
}: WorkspaceHubCardProps) {
  const { t } = useI18n();
  const name = language === "ar" ? nameAr || nameEn : nameEn || nameAr;
  const chroma = colorChroma ?? 0.18;
  const hue = colorHue ?? 270;
  const accentColor = `oklch(0.65 ${chroma} ${hue})`;
  const accentColorBg = `oklch(0.65 ${chroma} ${hue} / 0.08)`;
  const accentColorBorder = `oklch(0.65 ${chroma} ${hue} / 0.25)`;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "group relative flex w-full flex-col items-start gap-3 rounded-nx-lg border p-5 text-start",
        "transition-[border-color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:shadow-nx-focus",
        isLocked ? "cursor-not-allowed border-nx-line bg-nx-raised" : "cursor-pointer"
      )}
      style={isLocked ? undefined : { background: accentColorBg, borderColor: accentColorBorder }}
    >
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-raised flex items-center justify-center rounded-nx-lg bg-scrim">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-nx-raised">
              <Lock className="h-5 w-5 text-nx-ink-3" aria-hidden="true" />
            </div>
            <span className="text-xs font-medium text-nx-ink-2">
              {lockReason === "TenantContextRequired"
                ? t("workspaceHub.needsTenant")
                : t("workspaceHub.upgradeBadge")}
            </span>
          </div>
        </div>
      )}

      {/* Icon + Name row */}
      <div className="flex w-full items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-nx-md"
          style={{ background: accentColorBg, color: accentColor }}
        >
          <DynamicIcon name={icon || "Layers"} size={22} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-nx-ink">{name}</span>
          {accessibleItemCount > 0 && !isLocked && (
            <span className="text-xs text-nx-ink-3">
              {formatItemCount(accessibleItemCount, language, t)}
            </span>
          )}
        </div>
        {!isLocked && (
          <ChevronRight
            aria-hidden="true"
            className={cn(
              "h-4 w-4 shrink-0 text-nx-ink-3 opacity-0 transition-opacity duration-nx-standard ease-nx-enter motion-reduce:transition-none",
              "group-hover:opacity-100 rtl:rotate-180"
            )}
          />
        )}
      </div>

      {/* Last accessed timestamp */}
      {lastAccessed && !isLocked && (
        <div className="flex w-full items-center gap-1.5 text-xs text-nx-ink-3">
          <div
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: accentColor }}
          />
          {lastAccessed}
        </div>
      )}

      {/* Accent bottom border line */}
      {!isLocked && (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 rounded-b-nx-lg opacity-50 transition-opacity duration-nx-standard ease-nx-enter motion-reduce:transition-none group-hover:opacity-100"
          style={{ background: accentColor }}
        />
      )}
    </button>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Format item count with proper localization.
 * English uses simple singular/plural.
 * Arabic uses 4 plural forms (singular, dual, few 3-10, many 11+).
 */
function formatItemCount(
  n: number,
  language: string,
  t: (key: string, params?: Record<string, string | number>) => string
): string {
  if (language === "ar") {
    if (n === 1) return t("workspaceHub.items.one");
    if (n === 2) return t("workspaceHub.items.two");
    if (n >= 3 && n <= 10) return t("workspaceHub.items.few", { count: n });
    return t("workspaceHub.items.many", { count: n });
  }
  if (n === 1) return t("workspaceHub.items.one");
  return t("workspaceHub.items.other", { count: n });
}
