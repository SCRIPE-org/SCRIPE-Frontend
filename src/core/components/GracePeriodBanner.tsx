"use client";

import { useAppStore } from "@core/store/useAppStore";
import { useI18n } from "@core/providers/i18n-provider";
import { AlertTriangle, Clock, ShieldAlert } from "lucide-react";
import { cn } from "@core/common/utils";

/**
 * GracePeriodBanner — Shows a top-of-page banner when the tenant's subscription
 * is in a grace period (PastDue). Severity escalates by phase:
 * - Warning (0-50%): yellow banner
 * - Reduced (50-80%): orange banner, read-only mode
 * - Fallback (80-100%): red banner, limited features
 */
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

  const phaseConfig: Record<
    string,
    {
      icon: React.ReactNode;
      bgClass: string;
      textClass: string;
      borderClass: string;
      titleKey: string;
      descKey: string;
    }
  > = {
    Warning: {
      icon: <Clock className="h-4 w-4 shrink-0" />,
      bgClass: "bg-warning/10",
      textClass: "text-warning",
      borderClass: "border-warning/30",
      titleKey: "subscription.grace.warningTitle",
      descKey: "subscription.grace.warningDesc",
    },
    Reduced: {
      icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
      bgClass: "bg-warning-strong/10",
      textClass: "text-warning-strong",
      borderClass: "border-warning-strong/30",
      titleKey: "subscription.grace.reducedTitle",
      descKey: "subscription.grace.reducedDesc",
    },
    Fallback: {
      icon: <ShieldAlert className="h-4 w-4 shrink-0" />,
      bgClass: "bg-destructive/10",
      textClass: "text-destructive",
      borderClass: "border-destructive/30",
      titleKey: "subscription.grace.fallbackTitle",
      descKey: "subscription.grace.fallbackDesc",
    },
  };

  const config = phaseConfig[gracePhase];
  if (!config) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b px-4 py-2.5 text-sm",
        config.bgClass,
        config.textClass,
        config.borderClass
      )}
    >
      {config.icon}
      <div className="flex min-w-0 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        <span className="whitespace-nowrap font-semibold">
          {t(config.titleKey) || config.titleKey}
        </span>
        <span className="truncate text-xs opacity-80 sm:text-sm">
          {(t(config.descKey) || config.descKey).replace("{edition}", editionName || "")}
        </span>
      </div>
    </div>
  );
}
