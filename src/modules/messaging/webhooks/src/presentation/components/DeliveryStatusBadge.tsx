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
    className:
      "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800/30 dark:text-zinc-400 dark:border-zinc-700",
  },
  Delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
  },
  Retrying: {
    label: "Retrying",
    icon: RefreshCw,
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
  },
  DeadLettered: {
    label: "Dead Letter",
    icon: Skull,
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
  },
};

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
