"use client";

import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import type { LeadStatus } from "../../domain/entities/LeadEntity";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  label?: string;
  className?: string;
}

export function LeadStatusBadge({ status, label, className }: LeadStatusBadgeProps) {
  const getBadgeConfig = (s: LeadStatus) => {
    switch (s) {
      case "New":
        return {
          variant: "outline" as const,
          cls: "border-nx-line bg-nx-surface text-nx-ink font-medium",
          text: label || "New",
        };
      case "Working":
      case "Contacted" as any:
        return {
          variant: "secondary" as const,
          cls: "border-info/30 bg-info/10 text-info border font-medium",
          text: label || "Working",
        };
      case "Qualified":
        return {
          variant: "default" as const,
          cls: "bg-nx-accent-fill text-nx-on-fill font-bold border-none",
          text: label || "Qualified",
        };
      case "Converted":
        return {
          variant: "secondary" as const,
          cls: "border-success/30 bg-success/10 text-success border font-medium",
          text: label || "Converted",
        };
      case "Disqualified":
        return {
          variant: "destructive" as const,
          cls: "border-destructive/30 bg-destructive/10 text-destructive border font-medium",
          text: label || "Disqualified",
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
      className={cn("px-2 py-0.5 text-[11px] select-none", config.cls, className)}
    >
      {config.text}
    </Badge>
  );
}
