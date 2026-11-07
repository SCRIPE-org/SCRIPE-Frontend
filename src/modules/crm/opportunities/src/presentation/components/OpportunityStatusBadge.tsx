"use client";

import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import type { OpportunityStatus } from "../../domain/entities/OpportunityEntity";

/**
 * Properties for OpportunityStatusBadge.
 */
export interface OpportunityStatusBadgeProps {
  status: OpportunityStatus;
  label?: string;
  className?: string;
}

/**
 * Badge displaying opportunity lifecycle status (Open, Won, Lost).
 */
export function OpportunityStatusBadge({ status, label, className }: OpportunityStatusBadgeProps) {
  const getBadgeConfig = (s: OpportunityStatus) => {
    switch (s) {
      case "Open":
        return {
          variant: "outline" as const,
          cls: "border-info/30 bg-info/10 text-info font-medium",
          text: label || "Open",
        };
      case "Won":
        return {
          variant: "secondary" as const,
          cls: "border-success/30 bg-success/10 text-success border font-semibold",
          text: label || "Closed Won",
        };
      case "Lost":
        return {
          variant: "outline" as const,
          cls: "border-destructive/30 bg-destructive/10 text-destructive border font-medium",
          text: label || "Closed Lost",
        };
      default:
        return {
          variant: "outline" as const,
          cls: "border-nx-line text-nx-ink-2",
          text: label || s,
        };
    }
  };

  const config = getBadgeConfig(status);

  return (
    <Badge
      variant={config.variant}
      className={cn("text-xs px-2 py-0.5 whitespace-nowrap", config.cls, className)}
    >
      {config.text}
    </Badge>
  );
}
