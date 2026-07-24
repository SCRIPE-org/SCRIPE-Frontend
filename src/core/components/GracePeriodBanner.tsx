"use client";

import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@core/common/utils";

/**
 * GracePeriodBanner — Shows a top-of-page banner when the tenant's subscription
 * is in a grace period (PastDue). Severity escalates by phase:
 * - Warning (0-50%): the amber step
 * - Reduced (50-80%): the warning-strong step, read-only mode
 * - Fallback (80-100%): the destructive step, limited features
 *
 * Severity speaks through the glyph, the hairline and the wash — three cues,
 * only one of which is colour. The copy itself stays on neutral ink: amber
 * sentences on an amber wash are the least readable form this warning can take,
 * and the phase escalation was invisible to anyone reading it in greyscale.
 */
const PHASES: Record<
  string,
  { icon: LucideIcon; surface: string; glyph: string; titleKey: string; descKey: string }
> = {
  Warning: {
    icon: Clock,
    surface: "border-warning/30 bg-warning/10",
    glyph: "text-warning",
    titleKey: "subscription.grace.warningTitle",
    descKey: "subscription.grace.warningDesc",
  },
  Reduced: {
    icon: AlertTriangle,
    surface: "border-warning-strong/30 bg-warning-strong/10",
    glyph: "text-warning-strong",
    titleKey: "subscription.grace.reducedTitle",
    descKey: "subscription.grace.reducedDesc",
  },
  Fallback: {
    icon: ShieldAlert,
    surface: "border-destructive/30 bg-destructive/10",
    glyph: "text-destructive",
    titleKey: "subscription.grace.fallbackTitle",
    descKey: "subscription.grace.fallbackDesc",
  },
};

export function GracePeriodBanner() {
  const { t } = useI18n();
  const subscriptionStatus = useAppStore((s) => s.subscriptionStatus);
  const gracePhase = useAppStore((s) => s.gracePhase);
  const editionName = useAppStore((s) => s.editionName);
  const user = useAppStore((s) => s.user);

  // System admins (tenantId=null) don't have subscriptions — never show
  if (!user?.tenantId) return null;

  // Only show for PastDue with a grace phase
  if (subscriptionStatus !== "PastDue" || !gracePhase) return null;

  const phase = PHASES[gracePhase];
  if (!phase) return null;

  const Icon = phase.icon;

  return (
    <div
      role="status"
      className={cn(
        "flex items-center gap-3 border-b px-4 py-2.5 text-sm text-nx-ink",
        phase.surface
      )}
    >
      <Icon className={cn("h-4 w-4 shrink-0", phase.glyph)} aria-hidden="true" />
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        <span className="whitespace-nowrap font-semibold">{t(phase.titleKey)}</span>
        <span className="truncate text-xs text-nx-ink-2 sm:text-sm">
          {t(phase.descKey, { edition: editionName || "" })}
        </span>
      </div>
    </div>
  );
}
