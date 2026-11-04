"use client";

import { useState, useEffect, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import {
  getCustomFieldsExtension,
  normalizeCustomFieldValuesForSave,
} from "@core/crud/customFieldsExtension";
import type {
  OpportunityDetailResult,
  OpportunityStatus,
  MoveOpportunityStageInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  AssignOpportunityOwnerInput,
  PipelineDefinition,
} from "../../domain/entities/OpportunityEntity";

/**
 * State contract for the single opportunity detail view.
 */
export interface OpportunityDetailState {
  loading: boolean;
  error: string | null;
  data: OpportunityDetailResult | null;
  isMoveStageOpen: boolean;
  isCloseOpen: boolean;
  isReopenOpen: boolean;
  isAssignOwnerOpen: boolean;
  closeInitialOutcome: OpportunityStatus;
  isSubmitting: boolean;
  submitError: string | null;
}

/**
 * ViewModel hook orchestrating single opportunity details, audit history, and lifecycle transitions.
 */
export function useOpportunityDetailViewModel(opportunityId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OpportunityDetailResult | null>(null);
  const [pipeline, setPipeline] = useState<PipelineDefinition | null>(null);

  const [isMoveStageOpen, setIsMoveStageOpen] = useState(false);
  const [targetMoveStageKey, setTargetMoveStageKey] = useState<string | undefined>(undefined);
  const [isCloseOpen, setIsCloseOpen] = useState(false);
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [closeInitialOutcome, setCloseInitialOutcome] = useState<OpportunityStatus>("Won");

  const [fulfillmentRequested, setFulfillmentRequested] = useState(false);
  const [timelineVersion, setTimelineVersion] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const container = getCrmContainer() as any;
      const repo = container.opportunityRepository;
      const [result, pipelineRes, fulfillmentActivities] = await Promise.all([
        repo.getOpportunityById(opportunityId),
        typeof repo.getDefaultPipeline === "function"
          ? repo.getDefaultPipeline().catch(() => null)
          : Promise.resolve(null),
        typeof container.activityRepository?.getActivities === "function"
          ? container.activityRepository
              .getActivities({
                opportunityId,
                activityKind: "FulfillmentRequested",
                pageNumber: 1,
                pageSize: 5,
              })
              .catch(() => null)
          : Promise.resolve(null),
      ]);
      setData(result);
      if (pipelineRes) {
        setPipeline(pipelineRes);
      }
      if (
        fulfillmentActivities &&
        ((fulfillmentActivities.items && fulfillmentActivities.items.length > 0) ||
          (fulfillmentActivities.totalCount && fulfillmentActivities.totalCount > 0))
      ) {
        setFulfillmentRequested(true);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load opportunity details");
    } finally {
      setLoading(false);
    }
  }, [opportunityId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const lookupPartyOptions = useCallback(
    async (
      search?: string
    ): Promise<
      Array<{
        partyId: string;
        accountId?: string;
        label: string;
        subtitle?: string;
      }>
    > => {
      try {
        const container = getCrmContainer() as any;
        const accountRepo = container.accountRepository;
        if (!accountRepo) return [];

        const [accountsResult, candidates] = await Promise.all([
          typeof accountRepo.getAccounts === "function"
            ? accountRepo
                .getAccounts({ search, pageNumber: 1, pageSize: 50 })
                .catch(() => ({ items: [] }))
            : Promise.resolve({ items: [] }),
          typeof accountRepo.lookupCandidateParties === "function"
            ? accountRepo
                .lookupCandidateParties(search, "Organization")
                .catch(() => [])
            : Promise.resolve([]),
        ]);

        const seenParties = new Set<string>();
        const options: Array<{
          partyId: string;
          accountId?: string;
          label: string;
          subtitle?: string;
        }> = [];

        for (const acc of accountsResult.items ?? []) {
          if (!acc.partyId || seenParties.has(acc.partyId)) continue;
          seenParties.add(acc.partyId);
          options.push({
            partyId: acc.partyId,
            accountId: acc.id,
            label: acc.displayNameEn || acc.displayNameAr || acc.legalNameEn || acc.id,
            subtitle: [acc.industry, acc.countryCode].filter(Boolean).join(" • ") || undefined,
          });
        }

        for (const cand of candidates ?? []) {
          if (!cand.partyId || seenParties.has(cand.partyId)) continue;
          seenParties.add(cand.partyId);
          options.push({
            partyId: cand.partyId,
            accountId: cand.existingAccountId ?? undefined,
            label: cand.displayNameEn || cand.displayNameAr || cand.partyId,
            subtitle: cand.taxNumber || cand.partyKind || undefined,
          });
        }

        return options;
      } catch {
        return [];
      }
    },
    []
  );

  const handleMoveStage = async (input: MoveOpportunityStageInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      await repo.moveStage(input);
      if (input.customFieldValues && Object.keys(input.customFieldValues).length > 0) {
        try {
          const normalized = normalizeCustomFieldValuesForSave(input.customFieldValues);
          if (Object.keys(normalized).length > 0) {
            await getCustomFieldsExtension()?.saveValues(
              "crm.opportunity",
              input.opportunityId,
              normalized
            );
          }
        } catch {
          // Non-blocking custom fields persistence
        }
      }
      await loadData();
      setTimelineVersion((v) => v + 1);
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to move stage");
      return false;
    }
  };

  const handleCloseOpportunity = async (input: CloseOpportunityInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      await repo.closeOpportunity(input);
      await loadData();
      setTimelineVersion((v) => v + 1);
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to close opportunity");
      return false;
    }
  };

  const handleReopenOpportunity = async (input: ReopenOpportunityInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      await repo.reopenOpportunity(input);
      await loadData();
      setTimelineVersion((v) => v + 1);
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to reopen opportunity");
      return false;
    }
  };

  const handleAssignOwner = async (input: AssignOpportunityOwnerInput) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      await repo.assignOwner(input);
      await loadData();
      setTimelineVersion((v) => v + 1);
      setIsSubmitting(false);
      return true;
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || "Failed to assign owner");
      return false;
    }
  };

  const handleRequestFulfillment = async () => {
    const opp = data?.opportunity;
    if (!opp) return false;
    try {
      const container = getCrmContainer() as any;
      if (container.activityRepository?.createActivity) {
        await container.activityRepository.createActivity({
          activityKind: "FulfillmentRequested",
          summary: `HQ Commercial Fulfillment Handoff Requested: ${opp.title}`,
          bodyText: `Commercial deal (${opp.dealKind} - ${opp.currencyCode} ${
            opp.estimatedAmount ?? 0
          }) submitted for platform tenant provisioning & contract activation.`,
          opportunityId: opp.id,
          accountId: opp.accountId ?? undefined,
          containsPii: false,
        });
      }
      setFulfillmentRequested(true);
      setTimelineVersion((v) => v + 1);
      return true;
    } catch {
      setFulfillmentRequested(true);
      setTimelineVersion((v) => v + 1);
      return true;
    }
  };

  return {
    loading,
    error,
    data,
    pipeline,
    loadData,
    lookupPartyOptions,
    isMoveStageOpen,
    setIsMoveStageOpen,
    targetMoveStageKey,
    setTargetMoveStageKey,
    isCloseOpen,
    setIsCloseOpen,
    isReopenOpen,
    setIsReopenOpen,
    isAssignOwnerOpen,
    setIsAssignOwnerOpen,
    closeInitialOutcome,
    setCloseInitialOutcome,
    fulfillmentRequested,
    setFulfillmentRequested,
    timelineVersion,
    isSubmitting,
    submitError,
    setSubmitError,
    handleMoveStage,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
    handleRequestFulfillment,
  };
}
