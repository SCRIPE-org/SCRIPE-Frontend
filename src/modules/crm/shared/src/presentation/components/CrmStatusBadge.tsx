"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import type { CrmStageKey } from "../../types/crmSharedTypes";

/** Props for `CrmStatusBadge`. */
export interface CrmStatusBadgeProps {
  stage: CrmStageKey;
  label?: string;
  className?: string;
}

/**
 * Semantic stage badge rendering Nexus-compliant status colors and localized stage labels.
 */
export function CrmStatusBadge({ stage, label, className }: CrmStatusBadgeProps) {
  const { t } = useI18n();

  const getBadgeConfig = (s: CrmStageKey) => {
    switch (s) {
      case "default.discovery":
      case "discovery":
        return {
          variant: "outline" as const,
          cls: "border-nx-line bg-nx-surface text-nx-ink-2",
          text: label || t("crm.pipeline.stages.discovery"),
        };
      case "default.qualification":
      case "qualification":
        return {
          variant: "secondary" as const,
          cls: "border-nx-line bg-info/10 text-info border border-info/30",
          text: label || t("crm.pipeline.stages.qualification"),
        };
      case "default.solution_fit":
      case "solution_fit":
        return {
          variant: "outline" as const,
          cls: "border-nx-accent/30 bg-nx-accent-wash text-nx-accent font-semibold",
          text: label || t("crm.pipeline.stages.solution_fit"),
        };
      case "default.proposal":
      case "proposal":
        return {
          variant: "secondary" as const,
          cls: "border-warning-strong/30 bg-warning/10 text-nx-warning-strong border font-semibold",
          text: label || t("crm.pipeline.stages.proposal"),
        };
      case "default.negotiation":
      case "negotiation":
        return {
          variant: "secondary" as const,
          cls: "border-info/30 bg-info/10 text-info border font-semibold",
          text: label || t("crm.pipeline.stages.negotiation"),
        };
      case "won":
        return {
          variant: "secondary" as const,
          cls: "border-success/30 bg-success/10 text-success border font-bold",
          text: label || t("crm.pipeline.stages.won"),
        };
      case "lost":
        return {
          variant: "destructive" as const,
          cls: "border-destructive/30 bg-destructive/10 text-destructive border font-medium",
          text: label || t("crm.pipeline.stages.lost"),
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
