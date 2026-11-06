"use client";

import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card } from "@core/ui/card";
import { CheckCircle2, Rocket, ShieldCheck } from "lucide-react";
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
          const dotClass = STAGE_COLOR_PALETTE[st.color]?.dotClass ?? "bg-blue-500";
          return (
            <Button
              key={st.key}
              type="button"
              variant="ghost"
              data-testid={`stage-step-${st.key}`}
              data-stage-color={st.color}
              data-custom-color-hex={st.customColorHex || undefined}
              disabled={!isOpen}
              onClick={() => {
                if (isOpen) onSelectStageStep(st.key);
              }}
              style={isCurrent && customHexStyles ? customHexStyles.cardStyle : undefined}
              className={cn(
                "h-auto flex items-center justify-between gap-1 rounded-nx-md border px-2 py-1.5 text-start text-[11px] transition-all min-w-0",
                isCurrent
                  ? "border-nx-accent bg-nx-accent-wash/30 text-nx-accent font-bold"
                  : isCompleted
                    ? "border-success/30 bg-success/10 text-success font-semibold"
                    : "border-nx-line bg-nx-ground text-nx-ink-2 hover:border-nx-line-hi",
              )}
            >
              <div className="flex items-center gap-1 min-w-0">
                <span
                  className={cn("w-1.5 h-1.5 rounded-full shrink-0", !customHexStyles && dotClass)}
                  style={customHexStyles?.dotStyle}
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

export function OpportunityHqFulfillmentHandoffCard({
  t,
  opp,
  fulfillmentRequested,
  isRequestingFulfillment,
  onRequestFulfillmentHandoff,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  opp: CrmOpportunity;
  fulfillmentRequested: boolean;
  isRequestingFulfillment: boolean;
  onRequestFulfillmentHandoff: () => void;
}) {
  return (
    <Card
      data-testid="hq-fulfillment-handoff-card"
      className="p-5 border-nx-line bg-nx-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Rocket className="size-4 text-nx-accent" />
          <h3 className="text-sm font-bold text-nx-ink">{t("crmOpportunities.detail.hqHandoffTitle")}</h3>
          <Badge
            variant="outline"
            className={cn(
              "text-[10px] font-mono",
              fulfillmentRequested || opp.status === "Won"
                ? "border-success/40 bg-success/10 text-success"
                : "border-nx-line bg-nx-raised text-nx-ink-2",
            )}
          >
            {fulfillmentRequested
              ? t("crmOpportunities.detail.fulfillmentDispatched")
              : opp.status === "Won"
                ? opp.hqOutcomeKind || t("crmOpportunities.detail.readyForProvisioning")
                : t("crmOpportunities.detail.awaitingClosureHandoff")}
          </Badge>
        </div>
        <p className="text-xs text-nx-ink-2">{t("crmOpportunities.detail.hqHandoffDescription")}</p>
      </div>
      <div className="shrink-0">
        <Button
          type="button"
          variant={fulfillmentRequested ? "outline" : "default"}
          size="sm"
          data-testid="request-fulfillment-btn"
          disabled={isRequestingFulfillment || fulfillmentRequested}
          onClick={onRequestFulfillmentHandoff}
          className="h-8 text-xs font-bold gap-1.5"
        >
          {fulfillmentRequested ? (
            <>
              <CheckCircle2 className="size-3.5 text-success" />
              <span>{t("crmOpportunities.detail.handoffLoggedBtn")}</span>
            </>
          ) : (
            <>
              <Rocket className="size-3.5" />
              <span>
                {isRequestingFulfillment
                  ? t("crmOpportunities.detail.dispatchingBtn")
                  : t("crmOpportunities.detail.requestHqHandoffBtn")}
              </span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
