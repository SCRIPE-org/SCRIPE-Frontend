import { useCrmWorkflowsStore, type CrmWorkflowTransitionSubmitPayload } from "@modules/crm";
import type {
  CrmOpportunity,
  MoveOpportunityStageInput,
  OpportunityStatus,
  PipelineStageConfig,
} from "../../domain/entities/OpportunityEntity";

/** Evaluates a deal stage transition with complete CRM entity & custom field context. */
export function evaluateDealStageTransition(
  opp: CrmOpportunity,
  targetStageKey: string,
  isRtl: boolean
) {
  const oppExtras = opp as unknown as {
    customFields?: Record<string, unknown>;
    hasActiveQuote?: boolean;
    quoteId?: string | null;
  };
  const roleVal = opp.primaryContactRole ?? null;
  const hasQuoteFlag =
    typeof oppExtras.hasActiveQuote === "boolean"
      ? oppExtras.hasActiveQuote
      : Boolean(oppExtras.quoteId || oppExtras.customFields?.quoteId || oppExtras.customFields?.hasActiveQuote === true || oppExtras.customFields?.hasActiveQuote === "true");
  return useCrmWorkflowsStore.getState().evaluateTransition("deal", opp.stageKey, targetStageKey, {
    hasVerifiedParty: Boolean(opp.partyId || opp.accountId),
    partyId: opp.partyId || opp.accountId || null,
    accountId: opp.accountId ?? null,
    contactId: opp.contactId ?? null,
    ownerUserId: opp.ownerUserId ?? null,
    estimatedAmount: opp.estimatedAmount ?? null,
    discountPercent: opp.discountPercent ?? null,
    nextStepSummary: opp.nextStepSummary ?? null,
    targetCloseDate: opp.targetCloseDate ?? null,
    lossReasonCode: opp.lossReasonCode ?? null,
    solutionFitConfirmed: Boolean(opp.solutionFitConfirmed),
    primaryContactRole: roleVal,
    contactRoles: roleVal ? [roleVal] : undefined,
    hasActiveQuote: hasQuoteFlag,
    quoteId: oppExtras.quoteId ?? (typeof oppExtras.customFields?.quoteId === "string" ? oppExtras.customFields.quoteId : null),
    fields: oppExtras.customFields,
    locale: isRtl ? "ar" : "en",
  });
}

/** Maps a CrmWorkflowTransitionDialog submission payload into a domain MoveOpportunityStageInput. */
export function mapDealTransitionPayload(
  opportunityId: string,
  payload: CrmWorkflowTransitionSubmitPayload,
  fallbackRowVersion?: string
): MoveOpportunityStageInput {
  return {
    opportunityId,
    targetStageKey: payload.targetStageKey,
    transitionId: payload.transitionId,
    expectedRowVersion: payload.expectedRowVersion || fallbackRowVersion,
    partyId: payload.partyId,
    accountId: payload.accountId,
    contactId: payload.contactId,
    ownerUserId: payload.ownerUserId,
    estimatedAmount: payload.estimatedAmount,
    actualAmount: payload.actualAmount,
    discountPercent: payload.discountPercent,
    nextStepSummary: payload.nextStepSummary,
    targetCloseDate: payload.targetCloseDate,
    closeNotes: payload.closeNotes,
    lossReasonCode: payload.lossReasonCode,
    competitorName: payload.competitorName,
    reopenReason: payload.reopenReason,
    reason: payload.reason,
    stageTransitionNote: payload.auditNote,
    solutionFitConfirmed: payload.solutionFitConfirmed,
    primaryContactRole: payload.primaryContactRole,
    customFieldValues: payload.customFields,
  };
}

/** Builds stage and status filter option lists for OpportunitiesView toolbar controls. */
export function buildOpportunityFilterOptions(
  pipelineStages: PipelineStageConfig[] | undefined,
  isRtl: boolean,
  t: (key: string) => string
): {
  stages: { key: string | undefined; label: string }[];
  statuses: { key: OpportunityStatus | undefined; label: string }[];
} {
  const stageItems =
    pipelineStages && pipelineStages.length >= 2
      ? [...pipelineStages]
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((stg) => ({ key: stg.stageKey, label: isRtl && stg.labelAr ? stg.labelAr : stg.labelEn }))
      : [
          { key: "default.discovery", label: t("crmOpportunities.stages.discovery") },
          { key: "default.qualification", label: t("crmOpportunities.stages.qualification") },
          { key: "default.solution_fit", label: t("crmOpportunities.stages.solution_fit") },
          { key: "default.proposal", label: t("crmOpportunities.stages.proposal") },
          { key: "default.negotiation", label: t("crmOpportunities.stages.negotiation") },
        ];
  return {
    stages: [{ key: undefined, label: t("crmOpportunities.actions.allStages") }, ...stageItems],
    statuses: [
      { key: undefined, label: t("crmOpportunities.actions.allStatuses") },
      { key: "Open", label: t("crmOpportunities.status.open") },
      { key: "Won", label: t("crmOpportunities.status.won") },
      { key: "Lost", label: t("crmOpportunities.status.lost") },
    ],
  };
}
