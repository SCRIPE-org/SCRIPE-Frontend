"use client";

import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";

/**
 * Properties for OpportunityStageBadge.
 */
export interface OpportunityStageBadgeProps {
  stageKey: string;
  label?: string;
  className?: string;
}

/**
 * Badge displaying the current pipeline stage with stage-specific theme colors.
 */
export function OpportunityStageBadge({ stageKey, label, className }: OpportunityStageBadgeProps) {
  const getStageColor = (key: string) => {
    switch (key) {
      case "default.discovery":
        return "border-nx-line bg-nx-surface text-nx-ink";
      case "default.qualification":
        return "border-info/30 bg-info/10 text-info";
      case "default.solution_fit":
        return "border-warning/30 bg-warning/10 text-warning";
      case "default.proposal":
        return "border-nx-accent bg-nx-accent-wash text-nx-accent font-semibold";
      case "default.negotiation":
        return "border-nx-accent-fill bg-nx-accent-fill/15 text-nx-accent font-bold";
      case "default.closed_won":
        return "border-success/30 bg-success/10 text-success font-semibold";
      case "default.closed_lost":
        return "border-destructive/30 bg-destructive/10 text-destructive";
      default:
        return "border-nx-line bg-nx-surface text-nx-ink-2";
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn("text-xs px-2.5 py-0.5 whitespace-nowrap", getStageColor(stageKey), className)}
    >
      {label || stageKey.replace("default.", "").replace("_", " ")}
    </Badge>
  );
}
