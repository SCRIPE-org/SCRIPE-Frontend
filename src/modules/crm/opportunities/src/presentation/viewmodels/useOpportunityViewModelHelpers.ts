import { getCrmContainer } from "@modules/crm/di";
import { useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

const DEFAULT_STAGE_ORDER: Record<string, number> = {
  "default.discovery": 1,
  "default.qualification": 2,
  "default.solution_fit": 3,
  "default.proposal": 4,
  "default.negotiation": 5,
};

export async function lookupOpportunityPartyOptions(searchQuery?: string): Promise<
  Array<{
    partyId: string;
    accountId?: string;
    label: string;
    subtitle?: string;
  }>
> {
  try {
    const container = getCrmContainer() as any;
    const options: Array<{
      partyId: string;
      accountId?: string;
      label: string;
      subtitle?: string;
    }> = [];
    const seenPartyIds = new Set<string>();

    if (container?.accountRepository?.getAccounts) {
      const accRes = await container.accountRepository
        .getAccounts({
          page: 1,
          pageNumber: 1,
          pageSize: 50,
          search: searchQuery?.trim() || undefined,
        })
        .catch(() => ({ items: [] }));
      for (const acc of accRes?.items ?? []) {
        if (acc.partyId && !seenPartyIds.has(acc.partyId)) {
          seenPartyIds.add(acc.partyId);
          options.push({
            partyId: acc.partyId,
            accountId: acc.id,
            label:
              acc.partyLegalNameEn ||
              acc.displayNameEn ||
              acc.displayName ||
              acc.partyDisplayName ||
              acc.legalNameEn ||
              acc.accountNumber ||
              acc.id,
            subtitle: acc.commercialTierCode
              ? `Account • ${acc.commercialTierCode}`
              : [acc.industry, acc.countryCode].filter(Boolean).join(" • ") || "CRM Account",
          });
        }
      }
    }

    if (container?.accountRepository?.lookupCandidateParties) {
      const candidates = await container.accountRepository
        .lookupCandidateParties(searchQuery?.trim() || undefined)
        .catch(() => []);
      for (const p of candidates ?? []) {
        if (p.partyId && !seenPartyIds.has(p.partyId)) {
          seenPartyIds.add(p.partyId);
          options.push({
            partyId: p.partyId,
            accountId: p.existingAccountId ?? undefined,
            label: p.legalNameEn || p.displayNameEn || p.displayName || p.partyId,
            subtitle:
              p.partyKind === "Organization"
                ? "Company / Organization"
                : p.partyKind === "Person"
                  ? "Individual Contact"
                  : p.taxNumber || "Customer Record",
          });
        }
      }
    }

    return options;
  } catch {
    return [];
  }
}

export function evaluateOptimisticDealStageMove(
  opportunity: CrmOpportunity,
  targetStageKey: string,
  effectivePipelineStages: any[],
  overrideReason?: string,
): {
  status: "allowed" | "blocked" | "needs_modal" | "close_won" | "close_lost";
  errorReason?: string;
} {
  if (targetStageKey === "default.closed_won" || targetStageKey === "Won") {
    return { status: "close_won" };
  }
  if (targetStageKey === "default.closed_lost" || targetStageKey === "Lost") {
    return { status: "close_lost" };
  }

  const wfStore = useCrmWorkflowsStore.getState();
  const activeWf = wfStore.getActiveWorkflow("deal");
  const fromInWf = activeWf.stages.some((s) => s.stageKey === opportunity.stageKey);
  const toInWf = activeWf.stages.some((s) => s.stageKey === targetStageKey);
  const evalResult = wfStore.evaluateTransition("deal", opportunity.stageKey, targetStageKey);

  if (fromInWf && toInWf && !evalResult.allowed) {
    return {
      status: "blocked",
      errorReason:
        evalResult.reason || "Transition between these stages is restricted in the active workflow.",
    };
  }

  const stages = effectivePipelineStages ?? [];
  const currentStageConfig = stages.find((s) => s.stageKey === opportunity.stageKey);
  const targetStageConfig = stages.find((s) => s.stageKey === targetStageKey);

  const currentOrder = currentStageConfig?.sortOrder ?? DEFAULT_STAGE_ORDER[opportunity.stageKey] ?? 1;
  const targetOrder = targetStageConfig?.sortOrder ?? DEFAULT_STAGE_ORDER[targetStageKey] ?? 1;

  const isAdjacentForward = targetOrder === currentOrder + 1;
  const requiresParty = Boolean(
    targetStageConfig?.requiresVerifiedParty ||
      evalResult.matchedTransition?.rules.requireVerifiedParty ||
      targetStageKey === "default.proposal" ||
      targetStageKey === "default.negotiation",
  );

  const traversedExitFields =
    targetOrder > currentOrder
      ? Array.from(
          new Set(
            stages
              .filter((s) => s.sortOrder >= currentOrder && s.sortOrder < targetOrder)
              .flatMap((s) => s.requiredExitFields ?? []),
          ),
        )
      : [];
  const baseExitFields =
    traversedExitFields.length > 0 ? traversedExitFields : currentStageConfig?.requiredExitFields ?? [];
  const exitFields = Array.from(new Set([...baseExitFields, ...(evalResult.requiredFields ?? [])]));

  const missingParty = (requiresParty || exitFields.includes("partyId")) && !opportunity.partyId;
  const missingAmount =
    exitFields.includes("estimatedAmount") &&
    (opportunity.estimatedAmount == null || Number(opportunity.estimatedAmount) <= 0);
  const missingCloseDate = exitFields.includes("targetCloseDate") && !opportunity.targetCloseDate;
  const missingPrimaryContactRole =
    exitFields.includes("primaryContactRole") && !opportunity.primaryContactRole?.trim();
  const missingSolutionFit =
    exitFields.includes("solutionFitConfirmed") && !opportunity.solutionFitConfirmed;
  const hasCustomFieldExitGate = exitFields.some((f) => f.startsWith("custom:"));
  const hasPromptFields =
    (evalResult.matchedTransition?.rules.promptFields?.length ?? 0) > 0 ||
    Boolean(evalResult.promptForComment);
  const requiresInteractiveConfirmation =
    missingPrimaryContactRole || missingSolutionFit || hasCustomFieldExitGate || hasPromptFields;

  if (
    (!isAdjacentForward && !overrideReason) ||
    missingParty ||
    missingAmount ||
    missingCloseDate ||
    requiresInteractiveConfirmation
  ) {
    return { status: "needs_modal" };
  }

  return { status: "allowed" };
}

export function useOpportunityViewModelHelpers() {
  return {
    lookupOpportunityPartyOptions,
    evaluateOptimisticDealStageMove,
  };
}
