"use client";

import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { ShieldCheck } from "lucide-react";
import { cn } from "@core/common/utils";
import {
  STAGE_COLOR_PALETTE,
  buildCustomHexHarmonicStyles,
  type CrmStageColorToken,
} from "@modules/crm";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

export interface OpportunityStageStepItem {
  key: string;
  label: string;
  order: number;
  color: CrmStageColorToken;
  customColorHex?: string;
  requiresParty: boolean;
}

export function OpportunityStageProgressionCard({
  t,
  opp,
  isOpen,
  stages,
  currentSortOrder,
  onSelectStageStep,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  opp: CrmOpportunity;
  isOpen: boolean;
  stages: OpportunityStageStepItem[];
  currentSortOrder: number;
  onSelectStageStep: (stageKey: string) => void;
}) {
  return (
    <Card className="p-4 border-nx-line bg-nx-surface space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold uppercase tracking-wider text-nx-ink-2">
          {t("crmOpportunities.detail.stageProgressionTitle", { count: stages.length })}
        </span>
        <span className="text-[11px] text-nx-ink-3">
          {isOpen
            ? t("crmOpportunities.detail.stageProgressionHint")
            : t("crmOpportunities.detail.terminalStateLabel", { status: opp.status })}
        </span>
      </div>
      <div
        className="grid grid-cols-1 gap-1.5"
        style={{
          gridTemplateColumns:
            stages.length >= 2 ? `repeat(${stages.length}, minmax(0, 1fr))` : undefined,
        }}
      >
        {stages.map((st) => {
          const isCurrent = st.key === opp.stageKey && isOpen;
          const isCompleted = opp.status === "Won" || st.order < currentSortOrder;
          const customHexStyles = buildCustomHexHarmonicStyles(st.customColorHex);
          const colorMeta = STAGE_COLOR_PALETTE[st.color] ?? STAGE_COLOR_PALETTE.blue;
          const dotClass = colorMeta.dotClass;
          return (
            <Button
              key={st.key}
              type="button"
              variant="ghost"
              data-testid={`stage-step-${st.key}`}
              data-stage-color={st.color}
              data-custom-color-hex={st.customColorHex || undefined}
              disabled={isCurrent}
              onClick={() => onSelectStageStep(st.key)}
              style={customHexStyles.isValidHex ? customHexStyles.cardStyle : undefined}
              className={cn(
                "h-auto flex items-center justify-between gap-1 rounded-nx-md border px-2 py-1.5 text-start text-[11px] transition-all min-w-0",
                isCurrent
                  ? cn(
                      "ring-2 ring-nx-accent font-bold",
                      !customHexStyles.isValidHex
                        ? colorMeta.badgeClass
                        : "border-nx-accent bg-nx-accent-wash text-nx-accent",
                    )
                  : isCompleted
                    ? "border-success/30 bg-success/10 text-success font-semibold"
                    : cn(
                        "hover:border-nx-line-hi",
                        !customHexStyles.isValidHex
                          ? colorMeta.borderClass
                          : "border-nx-line bg-nx-ground text-nx-ink-2",
                      ),
              )}
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className={cn("w-2 h-2 rounded-full shrink-0", !customHexStyles.isValidHex && dotClass)}
                  style={customHexStyles.isValidHex ? customHexStyles.dotStyle : undefined}
                />
                <span className="font-mono text-[10px] shrink-0">{st.order}.</span>
                <span className="truncate">{st.label}</span>
              </div>
              {st.requiresParty && <ShieldCheck className="size-3 shrink-0 opacity-80" />}
            </Button>
          );
        })}
      </div>
    </Card>
  );
}
