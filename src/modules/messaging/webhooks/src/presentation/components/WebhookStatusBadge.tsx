/**
 * WebhookStatusBadge
 *
 * Displays Active / Inactive / Auto-disabled status with appropriate colors.
 * Now uses the `isAutoDisabled` domain logic from the entity instead of raw fields.
 */
"use client";

import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

interface WebhookStatusBadgeProps {
  isActive: boolean;
  isAutoDisabled?: boolean;
}

export function WebhookStatusBadge({ isActive, isAutoDisabled = false }: WebhookStatusBadgeProps) {
  const { t } = useI18n();

  if (isAutoDisabled) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
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
        className="gap-1 border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
      >
        <CheckCircle2 className="h-3 w-3" />
        {t("webhooks.status.active") || "Active"}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800/30 dark:text-zinc-400"
    >
      <XCircle className="h-3 w-3" />
      {t("webhooks.status.inactive") || "Inactive"}
    </Badge>
  );
}
