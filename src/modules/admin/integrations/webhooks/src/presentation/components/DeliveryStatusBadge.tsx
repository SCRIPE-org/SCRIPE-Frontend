/**
 * DeliveryStatusBadge
 *
 * Enhanced badge for delivery lifecycle status:
 * Pending → Delivered → Retrying → DeadLettered
 */
"use client";

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
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  Pending: {
    label: "Pending",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-border",
  },
  Delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    className: "bg-success/10 text-success border-success/30",
  },
  Retrying: {
    label: "Retrying",
    icon: RefreshCw,
    className: "bg-warning/10 text-warning border-warning/30",
  },
  DeadLettered: {
    label: "Dead Letter",
    icon: Skull,
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

/**
 * Presentation UI component rendering the delivery status badge.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function DeliveryStatusBadge({ status, className }: DeliveryStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.Pending;
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`gap-1 text-xs ${config.className} ${className ?? ""}`}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
}
