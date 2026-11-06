"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@core/ui/badge";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "./CrmWorkflowCanvas2D";

export { CrmWorkflowTransitionsTableView } from "./CrmWorkflowTransitionsTableView";

export const NODE_WIDTH = 188;
export const NODE_HEIGHT = 104;

export type StagePortSide = "top" | "right" | "bottom" | "left";
export type StagePortId =
  | "top-1"
  | "top-2"
  | "right-1"
  | "right-2"
  | "bottom-1"
  | "bottom-2"
  | "left-1"
  | "left-2";

export interface StagePortSpec {
  id: StagePortId;
  side: StagePortSide;
  rx: number;
  ry: number;
}

export const STAGE_PORTS: StagePortSpec[] = [
  { id: "top-1", side: "top", rx: 0.34, ry: 0 },
  { id: "top-2", side: "top", rx: 0.66, ry: 0 },
  { id: "right-1", side: "right", rx: 1, ry: 0.34 },
  { id: "right-2", side: "right", rx: 1, ry: 0.66 },
  { id: "bottom-1", side: "bottom", rx: 0.34, ry: 1 },
  { id: "bottom-2", side: "bottom", rx: 0.66, ry: 1 },
  { id: "left-1", side: "left", rx: 0, ry: 0.34 },
  { id: "left-2", side: "left", rx: 0, ry: 0.66 },
];

export function getPortCoords(node: CrmWorkflowStageNode, portId: StagePortId) {
  const spec = STAGE_PORTS.find((p) => p.id === portId) ?? STAGE_PORTS[2];
  return {
    x: node.x + NODE_WIDTH * spec.rx,
    y: node.y + NODE_HEIGHT * spec.ry,
  };
}

export function countTransitionRules(tr: CrmWorkflowTransition): number {
  let count = tr.requiredFields.length;
  if (tr.requireReason) count += 1;
  if (tr.requireNote) count += 1;
  if (tr.restrictToRoles && tr.restrictToRoles.length > 0) count += 1;
  if (tr.triggerDealConversion) count += 1;
  if (tr.autoCreateWorkTask) count += 1;
  if (tr.catalogRules && tr.catalogRules.length > 0) count += tr.catalogRules.length;
  return count;
}

export function formatExitFieldLabel(
  fieldKey: string,
  t: (k: string) => string,
  isAr: boolean,
  crmCustomFields: CrmCustomFieldDefinition[],
): string {
  if (fieldKey.startsWith("custom:")) {
    const cfKey = fieldKey.replace("custom:", "");
    const found = crmCustomFields.find((f) => f.key === cfKey);
    return found ? (isAr ? found.labelAr : found.labelEn) : cfKey;
  }
  const map: Record<string, string> = {
    partyId: t("crmOpportunities.pipelinesPage.exitFieldPartyId"),
    estimatedAmount: t("crmOpportunities.pipelinesPage.exitFieldEstimatedAmount"),
    targetCloseDate: t("crmOpportunities.pipelinesPage.exitFieldTargetCloseDate"),
    primaryContactRole: t("crmOpportunities.pipelinesPage.exitFieldPrimaryContactRole"),
    solutionFitConfirmed: t("crmOpportunities.pipelinesPage.exitFieldSolutionFitConfirmed"),
    qualificationNotes: t("crmOpportunities.pipelinesPage.exitFieldQualificationNotes"),
    disqualificationReasonCode: t("crmOpportunities.pipelinesPage.exitFieldDisqualificationReasonCode"),
    leadPhoneOrEmail: t("crmOpportunities.pipelinesPage.exitFieldLeadPhoneOrEmail"),
    leadSource: t("crmOpportunities.pipelinesPage.exitFieldLeadSource"),
    leadBantNotes: t("crmOpportunities.pipelinesPage.exitFieldLeadBantNotes"),
    leadAccountOrContact: t("crmOpportunities.pipelinesPage.exitFieldLeadAccountOrContact"),
  };
  return map[fieldKey] ?? fieldKey;
}

export function CrmWorkflowClassicFlowView({
  t,
  isAr,
  stages,
  selectedStageKey,
  onSelectStage,
}: {
  t: (k: string) => string;
  isAr: boolean;
  stages: CrmWorkflowStageNode[];
  selectedStageKey: string | null;
  onSelectStage: (key: string) => void;
}) {
  const ordered = [...stages].sort((a, b) => a.order - b.order);
  return (
    <div
      className="flex-1 overflow-auto bg-nx-ground p-6 space-y-4"
      data-testid="workflow-classic-flow-surface"
    >
      <div className="flex flex-wrap items-center gap-3">
        {ordered.map((stage, idx) => {
          const isSelected = selectedStageKey === stage.stageKey;
          return (
            <React.Fragment key={stage.stageKey}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectStage(stage.stageKey)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelectStage(stage.stageKey);
                }}
                className={`min-w-[205px] rounded-md border bg-nx-surface p-3.5 transition-colors cursor-pointer ${
                  isSelected
                    ? "border-primary ring-2 ring-primary/25"
                    : "border-nx-line hover:border-nx-line-hi"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {stage.isTerminalWon
                      ? t("crmOpportunities.pipelinesPage.stageBadgeWon")
                      : stage.isTerminalLost
                        ? t("crmOpportunities.pipelinesPage.stageBadgeLost")
                        : stage.convertsToDeal
                          ? t("crmOpportunities.pipelinesPage.stageBadgeConverts")
                          : `${t("crmOpportunities.pipelinesPage.stageBadgeStep")} ${idx + 1}`}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-nx-ink">
                    {stage.probability}%
                  </span>
                </div>
                <p className="text-sm font-bold text-nx-ink">
                  {isAr ? stage.labelAr : stage.labelEn}
                </p>
                <p className="text-[11px] text-nx-ink-2 mt-1">
                  {t("crmOpportunities.pipelinesPage.nodeSlaTarget")}: {stage.slaDays}d ·{" "}
                  {stage.requiredExitFields.length}{" "}
                  {t("crmOpportunities.pipelinesPage.nodeGuardsCount")}
                </p>
              </div>
              {idx < ordered.length - 1 && (
                <ArrowRight className="w-4 h-4 text-nx-ink-3 shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
