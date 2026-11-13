import { getCrmContainer } from "@modules/crm/di";
import { useCrmWorkflowsStore } from "@modules/crm";
import type { CrmOpportunity } from "../../domain/entities/OpportunityEntity";

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

/**
 * Evaluates whether an optimistic Kanban card move can proceed instantly, is blocked,
 * or requires opening the dynamic workflow transition screen.
 */
export function evaluateOptimisticDealStageMove(
  opportunity: CrmOpportunity,
  targetStageKey: string,
  effectivePipelineStages: any[],
  _overrideReason?: string,
): {
  status: "allowed" | "blocked" | "needs_modal" | "close_won" | "close_lost";
  errorReason?: string;
} {
  void effectivePipelineStages;
  const wfStore = useCrmWorkflowsStore.getState();
  const oppExtras = opportunity as unknown as {
    solutionFitConfirmed?: boolean;
    primaryContactRole?: string | null;
    customFields?: Record<string, unknown>;
  };
  const evalResult = wfStore.evaluateTransition("deal", opportunity.stageKey, targetStageKey, {
    hasVerifiedParty: Boolean(opportunity.partyId || opportunity.accountId),
    partyId: opportunity.partyId || opportunity.accountId || null,
    estimatedAmount: opportunity.estimatedAmount ?? null,
    targetCloseDate: opportunity.targetCloseDate ?? null,
    lossReasonCode: opportunity.lossReasonCode ?? null,
    solutionFitConfirmed: Boolean(oppExtras.solutionFitConfirmed),
    primaryContactRole: oppExtras.primaryContactRole ?? null,
    contactRoles: oppExtras.primaryContactRole ? [oppExtras.primaryContactRole] : undefined,
    fields: oppExtras.customFields,
  });

  if (!evalResult.allowed) {
    return {
      status: "blocked",
      errorReason:
        evalResult.reason || "Transition between these stages is restricted in the active workflow.",
    };
  }

  if (evalResult.status === "allowed_instant") {
    return { status: "allowed" };
  }

  return { status: "needs_modal" };
}

export function useOpportunityViewModelHelpers() {
  return {
    lookupOpportunityPartyOptions,
    evaluateOptimisticDealStageMove,
  };
}
