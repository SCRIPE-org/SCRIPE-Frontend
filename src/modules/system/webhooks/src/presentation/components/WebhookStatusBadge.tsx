/**
 * WebhookStatusBadge
 *
 * Displays Active / Inactive / Auto-disabled status with appropriate colors.
 */
"use client";

import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface WebhookStatusBadgeProps {
      isActive: boolean;
      consecutiveFailures: number;
      maxConsecutiveFailures: number;
}

export function WebhookStatusBadge({
      isActive,
      consecutiveFailures,
      maxConsecutiveFailures,
}: WebhookStatusBadgeProps) {
      const { t } = useI18n();

      const isAutoDisabled =
            !isActive && consecutiveFailures >= maxConsecutiveFailures;

      if (isAutoDisabled) {
            return (
                  <Badge
                        variant="outline"
                        className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800 gap-1"
                  >
                        <AlertTriangle className="h-3 w-3" />
                        {t("webhooks.status.autoDisabled") || "Auto-disabled"}
                  </Badge>
            );
      }

      if (isActive) {
            return (
                  <Badge
                        variant="outline"
                        className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800 gap-1"
                  >
                        <CheckCircle2 className="h-3 w-3" />
                        {t("webhooks.status.active") || "Active"}
                  </Badge>
            );
      }

      return (
            <Badge
                  variant="outline"
                  className="bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/30 dark:text-zinc-400 dark:border-zinc-700 gap-1"
            >
                  <XCircle className="h-3 w-3" />
                  {t("webhooks.status.inactive") || "Inactive"}
            </Badge>
      );
}
