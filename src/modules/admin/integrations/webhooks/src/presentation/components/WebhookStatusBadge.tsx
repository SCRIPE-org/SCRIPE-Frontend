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
      <Badge variant="warning" className="gap-1">
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        {t("webhooks.status.autoDisabled")}
      </Badge>
    );
  }

  if (isActive) {
    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        {t("webhooks.status.active")}
      </Badge>
    );
  }

  return (
    <Badge variant="inactive" className="gap-1">
      <XCircle className="h-3 w-3" aria-hidden="true" />
      {t("webhooks.status.inactive")}
    </Badge>
  );
}
