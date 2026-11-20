"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import type { LeadStatus } from "../../domain/entities/LeadEntity";

interface LeadStatusBadgeProps {
  status: LeadStatus;
  label?: string;
  className?: string;
}

/** Semantic status badge displaying a CRM Lead's current lifecycle state. */
export function LeadStatusBadge({ status, label, className }: LeadStatusBadgeProps) {
  const { t } = useI18n();

  const getBadgeConfig = (s: LeadStatus | "Contacted") => {
    switch (s) {
      case "New":
        return {
          variant: "outline" as const,
          cls: "border-nx-line bg-nx-surface text-nx-ink font-medium",
          text: label || t("crmLeads.status.new"),
        };
      case "Working":
      case "Contacted":
        return {
          variant: "secondary" as const,
          cls: "border-info/30 bg-info/10 text-info border font-medium",
          text: label || t("crmLeads.status.working"),
        };
      case "Qualified":
        return {
          variant: "outline" as const,
          cls: "border-nx-accent/30 bg-nx-accent-wash text-nx-accent font-semibold",
          text: label || t("crmLeads.status.qualified"),
        };
      case "Converted":
        return {
          variant: "secondary" as const,
          cls: "border-success/30 bg-success/10 text-success border font-medium",
          text: label || t("crmLeads.status.converted"),
        };
      case "Disqualified":
        return {
          variant: "destructive" as const,
          cls: "border-destructive/30 bg-destructive/10 text-destructive border font-medium",
          text: label || t("crmLeads.status.disqualified"),
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
      className={cn("px-2 py-0.5 text-[11px] rounded-nx-sm shrink-0", config.cls, className)}
    >
      {config.text}
    </Badge>
  );
}
