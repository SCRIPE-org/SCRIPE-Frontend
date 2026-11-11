import {
  useCrmWorkflowsStore,
  type CrmStageColorToken,
  type CrmWorkflowStageCategory,
} from "@modules/crm";
import type { CrmOpportunity } from "../../../domain/entities/OpportunityEntity";

export interface KanbanStageDef {
  key: string;
  labelKey: string;
  defaultLabelEn: string;
  labelAr?: string | null;
  sortOrder: number;
  winProbabilityPercent?: number | null;
  requiresParty?: boolean;
  category?: CrmWorkflowStageCategory;
  color?: CrmStageColorToken;
  customColorHex?: string;
}

export function resolveKanbanStageLabel(
  language: string,
  t: (key: string, params?: any) => string,
  stageDef?: KanbanStageDef,
  fallbackKey?: string,
): string {
  if (!stageDef) return fallbackKey || "";
  if (language === "ar") {
    if (stageDef.labelAr) return stageDef.labelAr;
    const translated = t(stageDef.labelKey, { defaultValue: "" });
    if (translated && translated !== stageDef.labelKey) return translated;
    return stageDef.defaultLabelEn || stageDef.key;
  }
  if (stageDef.defaultLabelEn) return stageDef.defaultLabelEn;
  const translated = t(stageDef.labelKey, { defaultValue: "" });
  if (translated && translated !== stageDef.labelKey) return translated;
  return stageDef.labelAr || stageDef.key;
}

export function computeKanbanColumnTotals(
  opportunities: CrmOpportunity[],
  baseCurrency: string,
  autoConvertToBase: boolean,
  convertAmount: (amount: number, from: string, to: string) => number,
) {
  const hasMaskedAmount = opportunities.some((o) =>
    o.maskedFieldKeys?.includes("estimatedAmount"),
  );

  const distinctCurrencies = Array.from(
    new Set(opportunities.map((o) => o.currencyCode).filter(Boolean)),
  );

  let formattedTotal = "—";
  if (opportunities.length === 0) {
    formattedTotal = "0";
  } else if (hasMaskedAmount) {
    formattedTotal = "••••••";
  } else if (distinctCurrencies.length <= 1) {
    const curr = distinctCurrencies[0] || "SAR";
    const sum = opportunities.reduce(
      (acc, opp) => acc + (Number(opp.estimatedAmount) || 0),
      0,
    );
    formattedTotal = `${curr} ${sum.toLocaleString()}`;
  } else {
    const sumsByCurr = distinctCurrencies.map((curr) => {
      const sum = opportunities
        .filter((o) => o.currencyCode === curr)
        .reduce((acc, opp) => acc + (Number(opp.estimatedAmount) || 0), 0);
      return `${curr} ${sum.toLocaleString()}`;
    });
    formattedTotal = sumsByCurr.join(" / ");
  }

  const hasForeignCurrency = opportunities.some(
    (o) =>
      (o.currencyCode || "SAR").toUpperCase() !== baseCurrency.toUpperCase(),
  );
  const convertedBaseSum =
    !hasMaskedAmount &&
    opportunities.length > 0 &&
    autoConvertToBase &&
    hasForeignCurrency
      ? Math.round(
          opportunities.reduce(
            (acc, opp) =>
              acc +
              convertAmount(
                Number(opp.estimatedAmount) || 0,
                opp.currencyCode || "SAR",
                baseCurrency,
              ),
            0,
          ),
        )
      : null;

  return { formattedTotal, convertedBaseSum };
}

export function evaluateKanbanColumnDragState(params: {
  stage: KanbanStageDef;
  stageIndex: number;
  allStages?: KanbanStageDef[];
  draggedOpportunity?: CrmOpportunity | null;
  canUpdateOpportunity?: boolean;
  canManagePipelines?: boolean;
  language: string;
  t: (key: string, opts?: any) => string;
}) {
  const {
    stage,
    stageIndex,
    allStages,
    draggedOpportunity,
    canUpdateOpportunity,
    canManagePipelines,
    language,
    t,
  } = params;

  const currentStageDef = allStages?.find(
    (s) => s.key === draggedOpportunity?.stageKey,
  );
  const isCurrent = Boolean(
    draggedOpportunity && draggedOpportunity.stageKey === stage.key,
  );

  const currentStageIndex =
    allStages && draggedOpportunity
      ? allStages.findIndex((s) => s.key === draggedOpportunity.stageKey)
      : -1;
  const thisStageIndex =
    stageIndex >= 0
      ? stageIndex
      : (allStages?.findIndex((s) => s.key === stage.key) ?? -1);

  const isBackwardMove =
    currentStageIndex >= 0
      ? thisStageIndex < currentStageIndex
      : currentStageDef !== undefined &&
        stage.sortOrder < currentStageDef.sortOrder;

  const isAdjacentForward =
    currentStageIndex >= 0
      ? thisStageIndex === currentStageIndex + 1
      : currentStageDef !== undefined &&
        stage.sortOrder === currentStageDef.sortOrder + 1;

  const isNonAdjacent =
    currentStageIndex >= 0
      ? thisStageIndex > currentStageIndex + 1
      : currentStageDef !== undefined &&
        stage.sortOrder > currentStageDef.sortOrder + 1;

  let isBlocked = false;
  let isAllowed = false;
  let pillType: "direct" | "gate" | null = null;
  let pillText: string | null = null;
  let diagnosticReason: string | null = null;

  if (draggedOpportunity && !isCurrent) {
    if (canUpdateOpportunity === false) {
      isBlocked = true;
      diagnosticReason = t("crmOpportunities.kanban.reasonNoUpdatePermission", {
        defaultValue: "Opportunity update permission required to move deals.",
      });
    } else {
      const fromLabel = resolveKanbanStageLabel(
        language,
        t,
        currentStageDef,
        draggedOpportunity.stageKey,
      );
      const toLabel = resolveKanbanStageLabel(language, t, stage, stage.key);

      const evalResult = useCrmWorkflowsStore
        .getState()
        .evaluateTransition("deal", draggedOpportunity.stageKey, stage.key);

      if (!evalResult.allowed) {
        isBlocked = true;
        if (isBackwardMove) {
          if (canManagePipelines === false) {
            diagnosticReason = t(
              "crmOpportunities.kanban.reasonBackwardOverride",
              {
                defaultValue:
                  "Backward move requires stage override permission.",
              },
            );
          } else {
            diagnosticReason = t(
              "crmOpportunities.kanban.reasonRollbackDisabled",
              {
                from: fromLabel,
                to: toLabel,
                defaultValue: `Rollback from "${fromLabel}" to "${toLabel}" is restricted in active workflow.`,
              },
            );
          }
        } else if (isNonAdjacent) {
          diagnosticReason = t("crmOpportunities.kanban.reasonNonAdjacent", {
            from: fromLabel,
            to: toLabel,
            defaultValue: `Non-adjacent stage skipping restricted. No transition defined between "${fromLabel}" and "${toLabel}".`,
          });
        } else {
          diagnosticReason = t("crmOpportunities.kanban.reasonNoTransition", {
            from: fromLabel,
            to: toLabel,
            defaultValue: `No transition defined between "${fromLabel}" and "${toLabel}".`,
          });
        }
      } else {
        isAllowed = true;
        const requiresParty = Boolean(
          stage.requiresParty ||
            evalResult.requiredFields.includes("partyId") ||
            evalResult.matchedTransition?.rules.requireVerifiedParty ||
            stage.key === "default.proposal" ||
            stage.key === "default.negotiation",
        );
        const missingParty = requiresParty && !draggedOpportunity.partyId;

        if (missingParty) {
          pillType = "gate";
          pillText = t("crmOpportunities.kanban.pillStageGateParty", {
            defaultValue: "Stage Gate: Account & Contact Required",
          });
        } else if (
          !isAdjacentForward ||
          evalResult.promptForComment ||
          evalResult.requiredFields.length > 0
        ) {
          pillType = "gate";
          pillText = t("crmOpportunities.kanban.pillStageGatePrompt", {
            defaultValue: "Stage Gate: Review Required",
          });
        } else {
          pillType = "direct";
          pillText = t("crmOpportunities.kanban.pillDirectMove", {
            defaultValue: "Direct Transition",
          });
        }
      }
    }
  }

  return {
    isCurrent,
    isBlocked,
    isAllowed,
    pillType,
    pillText,
    diagnosticReason,
  };
}
