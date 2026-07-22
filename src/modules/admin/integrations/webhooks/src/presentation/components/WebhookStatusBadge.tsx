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

/**
 * Presentation UI component rendering the webhook status badge.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function WebhookStatusBadge({ isActive, isAutoDisabled = false }: WebhookStatusBadgeProps) {
  const { t } = useI18n();

  if (isAutoDisabled) {
    return (
      <Badge
        variant="outline"
        className="gap-1 border-warning/30 bg-warning/10 text-warning"
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
        className="gap-1 border-success/30 bg-success/10 text-success"
      >
        <CheckCircle2 className="h-3 w-3" />
        {t("webhooks.status.active") || "Active"}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className="gap-1 border-border bg-muted text-muted-foreground"
    >
      <XCircle className="h-3 w-3" />
      {t("webhooks.status.inactive") || "Inactive"}
    </Badge>
  );
}
