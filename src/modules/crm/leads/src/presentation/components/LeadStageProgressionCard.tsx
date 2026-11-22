"use client";

import { CheckCircle2 } from "lucide-react";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import {
  resolveDefaultStageColor,
  STAGE_COLOR_PALETTE,
  buildCustomHexHarmonicStyles,
  type CrmWorkflowDefinition,
} from "@modules/crm";
import { LeadStatusBadge } from "./LeadStatusBadge";
import { stageToLeadStatusValue } from "./LeadsKanbanCardItem";
import type { CrmLead } from "../../domain/entities/LeadEntity";

/** Props for `LeadStageProgressionCard`. */
export interface LeadStageProgressionCardProps {
  lead: CrmLead;
  activeWorkflow?: CrmWorkflowDefinition | null;
  isSubmitting?: boolean;
  onStageTransition: (stageKey: string) => void;
  isRtl?: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
}

/** Interactive horizontal workflow progression strip for transitioning a CRM Lead's stage. */
export function LeadStageProgressionCard({
  lead,
  activeWorkflow,
  isSubmitting,
  onStageTransition,
  isRtl,
  t,
}: LeadStageProgressionCardProps) {
  const stages = activeWorkflow?.stages ?? [];

  return (
    <Card className="p-4 border-nx-line bg-nx-surface space-y-2.5" data-testid="lead-progression-bar">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-nx-ink-2">
          {t("crmLeads.detail.progressionTitle")}
        </span>
        <LeadStatusBadge status={lead.status} />
      </div>
      <div
        className="grid grid-cols-1 gap-1.5"
        style={{
          gridTemplateColumns:
            stages.length >= 2 ? `repeat(${stages.length}, minmax(0, 1fr))` : undefined,
        }}
      >
        {[...stages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((stg) => {
            const stageStatus = stageToLeadStatusValue(stg.stageKey, stg.labelEn);
            const isCurrent =
              (lead.stageKey && lead.stageKey === stg.stageKey) || lead.status === stageStatus;
            const colorToken = resolveDefaultStageColor(
              stg.stageKey,
              stg.category,
              stg.sortOrder,
              stg.color
            );
            const colorMeta = STAGE_COLOR_PALETTE[colorToken] ?? STAGE_COLOR_PALETTE.blue;
            const customHexStyles = buildCustomHexHarmonicStyles(
              stg.customColorHex || stg.properties?.customColorHex
            );
            return (
              <Button
                key={stg.stageKey}
                type="button"
                variant="ghost"
                disabled={isSubmitting || isCurrent}
                data-testid={`lead-step-${stg.stageKey}`}
                data-stage-status={stageStatus}
                onClick={() => onStageTransition(stg.stageKey)}
                style={customHexStyles.isValidHex ? customHexStyles.cardStyle : undefined}
                className={cn(
                  "h-auto flex items-center justify-between gap-1 rounded-nx-md border px-2.5 py-2 text-start text-xs transition-all min-w-0",
                  isCurrent
                    ? cn(
                        "ring-2 ring-nx-accent font-bold",
                        !customHexStyles.isValidHex
                          ? colorMeta.badgeClass
                          : "border-nx-accent bg-nx-accent-wash text-nx-accent"
                      )
                    : cn(
                        "hover:border-nx-line-hi",
                        !customHexStyles.isValidHex
                          ? colorMeta.borderClass
                          : "border-nx-line bg-nx-ground text-nx-ink-2"
                      )
                )}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      !customHexStyles.isValidHex && colorMeta.dotClass
                    )}
                    style={customHexStyles.isValidHex ? customHexStyles.dotStyle : undefined}
                  />
                  <span className="truncate">{isRtl && stg.labelAr ? stg.labelAr : stg.labelEn}</span>
                </div>
                {isCurrent && <CheckCircle2 className="size-3.5 shrink-0" />}
              </Button>
            );
          })}
      </div>
    </Card>
  );
}
