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

  const phaseConfig: Record<string, {
    icon: React.ReactNode;
    bgClass: string;
    textClass: string;
    borderClass: string;
    titleKey: string;
    descKey: string;
  }> = {
    Warning: {
      icon: <Clock className="h-4 w-4 shrink-0" />,
      bgClass: "bg-amber-50 dark:bg-amber-950/30",
      textClass: "text-amber-800 dark:text-amber-200",
      borderClass: "border-amber-200 dark:border-amber-800",
      titleKey: "subscription.grace.warningTitle",
      descKey: "subscription.grace.warningDesc",
    },
    Reduced: {
      icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
      bgClass: "bg-orange-50 dark:bg-orange-950/30",
      textClass: "text-orange-800 dark:text-orange-200",
      borderClass: "border-orange-200 dark:border-orange-800",
      titleKey: "subscription.grace.reducedTitle",
      descKey: "subscription.grace.reducedDesc",
    },
    Fallback: {
      icon: <ShieldAlert className="h-4 w-4 shrink-0" />,
      bgClass: "bg-red-50 dark:bg-red-950/30",
      textClass: "text-red-800 dark:text-red-200",
      borderClass: "border-red-200 dark:border-red-800",
      titleKey: "subscription.grace.fallbackTitle",
      descKey: "subscription.grace.fallbackDesc",
    },
  };

  const config = phaseConfig[gracePhase];
  if (!config) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 border-b text-sm",
        config.bgClass,
        config.textClass,
        config.borderClass
      )}
    >
      {config.icon}
      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-2 min-w-0">
        <span className="font-semibold whitespace-nowrap">
          {t(config.titleKey) || config.titleKey}
        </span>
        <span className="text-xs sm:text-sm opacity-80 truncate">
          {(t(config.descKey) || config.descKey).replace("{edition}", editionName || "")}
        </span>
      </div>
    </div>
  );
}
