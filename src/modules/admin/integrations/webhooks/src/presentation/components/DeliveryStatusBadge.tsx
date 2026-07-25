/**
 * DeliveryStatusBadge
 *
 * Enhanced badge for delivery lifecycle status:
 * Pending → Delivered → Retrying → DeadLettered
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { CheckCircle2, Clock, RefreshCw, Skull } from "lucide-react";
import type { DeliveryStatus } from "../../domain/entities/Webhook";

interface DeliveryStatusBadgeProps {
  status: DeliveryStatus;
  className?: string;
}

const STATUS_CONFIG: Record<
  DeliveryStatus,
  {
    labelKey: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  Pending: {
    labelKey: "webhooks.deliveryStatus.pending",
    icon: Clock,
    className: "bg-nx-raised text-nx-ink-2 border-nx-line",
  },
  Delivered: {
    labelKey: "webhooks.deliveryStatus.delivered",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/30",
  },
  Retrying: {
    labelKey: "webhooks.deliveryStatus.retrying",
    icon: RefreshCw,
    className: "bg-warning/10 text-warning border-warning/30",
  },
  DeadLettered: {
    labelKey: "webhooks.deliveryStatus.deadLettered",
    icon: Skull,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

/**
 * Presentation UI component rendering the delivery status badge.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DeliveryStatusBadge({ status, className }: DeliveryStatusBadgeProps) {
  const { t } = useI18n();
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 text-xs ${config.className} ${className ?? ""}`}>
      <Icon className="h-3 w-3" aria-hidden="true" />
      {t(config.labelKey)}
    </Badge>
  );
}
