"use client";

import React from "react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@core/ui/badge";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import type {
  CrmWorkflowStageNode,
  CrmWorkflowTransition,
} from "./CrmWorkflowCanvas2D";

/** Re-exported tabular transitions sub-view for Pipeline Studio. */
export { CrmWorkflowTransitionsTableView } from "./CrmWorkflowTransitionsTableView";
/** Re-exported stage port geometry constants, helpers, and types for Studio canvas nodes. */
export {
  NODE_HEIGHT,
  NODE_WIDTH,
  STAGE_PORTS,
  getPortCoords,
  type StagePortId,
  type StagePortSide,
  type StagePortSpec,
} from "../../utils/crmWorkflowEdgeRouting";

/** Counts configured required fields, flags, and catalog rules on a workflow transition. */
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

/** Formats a system or custom exit-gate field key into a localized display label. */
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
    partyId: t("crmWorkflows.pipelinesPage.exitFieldPartyId"),
    contactId: t("crm.transitionDialog.contactLabel"),
    accountId: t("crm.transitionDialog.accountLabel"),
    ownerUserId: t("crm.transitionDialog.ownerUserLabel"),
    estimatedAmount: t("crmWorkflows.pipelinesPage.exitFieldEstimatedAmount"),
    discountPercent: t("crm.transitionDialog.discountPercentLabel"),
    nextStepSummary: t("crm.transitionDialog.nextStepSummaryLabel"),
    targetCloseDate: t("crmWorkflows.pipelinesPage.exitFieldTargetCloseDate"),
    primaryContactRole: t("crmWorkflows.pipelinesPage.exitFieldPrimaryContactRole"),
    solutionFitConfirmed: t("crmWorkflows.pipelinesPage.exitFieldSolutionFitConfirmed"),
    qualificationNotes: t("crmWorkflows.pipelinesPage.exitFieldQualificationNotes"),
    disqualificationReasonCode: t("crmWorkflows.pipelinesPage.exitFieldDisqualificationReasonCode"),
    leadPhoneOrEmail: t("crmWorkflows.pipelinesPage.exitFieldLeadPhoneOrEmail"),
    leadSource: t("crmWorkflows.pipelinesPage.exitFieldLeadSource"),
    leadBantNotes: t("crmWorkflows.pipelinesPage.exitFieldLeadBantNotes"),
    leadAccountOrContact: t("crmWorkflows.pipelinesPage.exitFieldLeadAccountOrContact"),
  };
  return map[fieldKey] ?? fieldKey;
}

/** Classic sequential stage-strip view mode for inspecting workflow progression without the 2D graph. */
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
                      ? t("crmWorkflows.pipelinesPage.stageBadgeWon")
                      : stage.isTerminalLost
                        ? t("crmWorkflows.pipelinesPage.stageBadgeLost")
                        : stage.convertsToDeal
                          ? t("crmWorkflows.pipelinesPage.stageBadgeConverts")
                          : `${t("crmWorkflows.pipelinesPage.stageBadgeStep")} ${idx + 1}`}
                  </Badge>
                  <span className="text-xs font-mono font-bold text-nx-ink">
                    {stage.probability}%
                  </span>
                </div>
                <p className="text-sm font-bold text-nx-ink">
                  {isAr ? stage.labelAr : stage.labelEn}
                </p>
                <p className="text-[11px] text-nx-ink-2 mt-1">
                  {t("crmWorkflows.pipelinesPage.nodeSlaTarget")}: {stage.slaDays}{t("crmWorkflows.workflowStudio.daysShort")} ·{" "}
                  {stage.requiredExitFields.length}{" "}
                  {t("crmWorkflows.pipelinesPage.nodeGuardsCount")}
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
