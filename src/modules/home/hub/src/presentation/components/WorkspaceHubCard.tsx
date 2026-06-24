// UI-EXCEPTION: compact studio layout
"use client";

/**
 * WorkspaceHubCard — A single workspace card in the Workspace Hub.
 *
 * Design inspired by Microsoft 365 App Launcher + Notion workspace picker:
 * - Glassmorphism + accent color glow
 * - Hover scale effect with lift
 * - Locked state with lock icon + "Upgrade" badge
 * - Active/recent indicator
 * - Accent color border from workspace's OKLCH palette
 */

import { cn } from "@core/common/utils";
import { Lock, ChevronRight } from "lucide-react";
import { DynamicIcon } from "@core/ui/layout/nexus/_parts/primary-rail-parts";
import { useI18n } from "@core/providers/i18n-provider";

/**
 * Interface defining property specifications, keys types, and structural contract rules for workspace hub card props.
 */
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
}

/**
 * Presentation UI component rendering the workspace hub card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
}: WorkspaceHubCardProps) {
  const { t } = useI18n();
  const name = language === "ar" ? nameAr || nameEn : nameEn || nameAr;
  const chroma = colorChroma ?? 0.18;
  const hue = colorHue ?? 270;
  const accentColor = `oklch(0.65 ${chroma} ${hue})`;
  const accentColorBg = `oklch(0.65 ${chroma} ${hue} / 0.08)`;
  const accentColorBorder = `oklch(0.65 ${chroma} ${hue} / 0.25)`;
  const accentColorGlow = `oklch(0.65 ${chroma} ${hue} / 0.12)`;

  return (
    <button
      onClick={onClick}
      disabled={isLocked}
      className={cn(
        "group relative flex w-full flex-col items-start gap-3 rounded-2xl p-5",
        "border backdrop-blur-sm transition-all duration-300 ease-out",
        "text-start",
        isLocked
          ? "cursor-not-allowed opacity-70 grayscale-[30%]"
          : "cursor-pointer hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-lg active:scale-[0.99]"
      )}
      style={{
        background: isLocked ? "hsl(var(--muted) / 0.5)" : accentColorBg,
        borderColor: isLocked ? "hsl(var(--border))" : accentColorBorder,
        boxShadow: isLocked ? "none" : `0 4px 20px ${accentColorGlow}`,
      }}
    >
      {/* Lock overlay */}
      {isLocked && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/40 backdrop-blur-[2px]">
          <div className="flex flex-col items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Lock className="h-5 w-5 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {t("workspaceHub.upgradeBadge")}
            </span>
          </div>
        </div>
      )}

      {/* Icon + Name row */}
      <div className="flex w-full items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-200"
          style={{
            background: accentColorBg,
            color: accentColor,
          }}
        >
          <DynamicIcon name={icon || "Layers"} size={22} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-foreground">{name}</span>
          {accessibleItemCount > 0 && !isLocked && (
            <span className="text-xs text-muted-foreground">
              {formatItemCount(accessibleItemCount, language, t)}
            </span>
          )}
        </div>
        {!isLocked && (
          <ChevronRight
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-200",
              "group-hover:opacity-100",
              language === "ar"
                ? "rotate-180 group-hover:-translate-x-0.5"
                : "group-hover:translate-x-0.5"
            )}
          />
        )}
      </div>

      {/* Last accessed timestamp */}
      {lastAccessed && !isLocked && (
        <div className="flex w-full items-center gap-1.5 text-xs text-muted-foreground/70">
          <div className="h-1.5 w-1.5 rounded-full" style={{ background: accentColor }} />
          {lastAccessed}
        </div>
      )}

      {/* Accent bottom border line */}
      {!isLocked && (
        <div
          className="absolute inset-x-0 bottom-0 h-[2px] rounded-b-2xl opacity-50 transition-opacity duration-200 group-hover:opacity-100"
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
