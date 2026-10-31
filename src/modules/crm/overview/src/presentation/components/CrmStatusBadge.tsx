"use client";

import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import type { CrmStageKey } from "../../domain/models/crm-overview.types";

interface CrmStatusBadgeProps {
  stage: CrmStageKey;
  label?: string;
  className?: string;
}

export function CrmStatusBadge({ stage, label, className }: CrmStatusBadgeProps) {
  const getBadgeConfig = (s: CrmStageKey) => {
    switch (s) {
      case "default.discovery":
      case "discovery":
        return {
          variant: "outline" as const,
          cls: "border-nx-line bg-nx-surface text-nx-ink-2",
          text: label || "Discovery",
        };
      case "default.qualification":
      case "qualification":
        return {
          variant: "secondary" as const,
          cls: "border-nx-line bg-info/10 text-info border border-info/30",
          text: label || "Qualification",
        };
      case "default.solution_fit":
      case "solution_fit":
        return {
          variant: "default" as const,
          cls: "bg-nx-accent-fill text-nx-on-fill font-bold border-none",
          text: label || "Solution Fit",
        };
      case "default.proposal":
      case "proposal":
        return {
          variant: "secondary" as const,
          cls: "border-warning/30 bg-warning/10 text-warning border font-semibold",
          text: label || "Proposal",
        };
      case "default.negotiation":
      case "negotiation":
        return {
          variant: "secondary" as const,
          cls: "border-info/30 bg-info/10 text-info border font-semibold",
          text: label || "Negotiation",
        };
      case "won":
        return {
          variant: "secondary" as const,
          cls: "border-success/30 bg-success/10 text-success border font-bold",
          text: label || "Won",
        };
      case "lost":
        return {
          variant: "destructive" as const,
          cls: "border-destructive/30 bg-destructive/10 text-destructive border font-medium",
          text: label || "Lost",
        };
      default:
        return {
          variant: "outline" as const,
          cls: "border-nx-line text-nx-ink-2",
          text: label || s,
        };
    }
  };

  const config = getBadgeConfig(stage);

  return (
    <Badge
      variant={config.variant}
      className={cn("px-2 py-0.5 text-[11px] select-none", config.cls, className)}
    >
      {config.text}
    </Badge>
  );
}
