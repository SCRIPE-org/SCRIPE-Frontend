"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } from "@core/crud/customFieldsExtension";
import type {
  OpportunityDetailResult,
  MoveOpportunityStageInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  AssignOpportunityOwnerInput,
  PipelineDefinition,
  DealContactRole,
} from "../../domain/entities/OpportunityEntity";
import {
  lookupOpportunityPartyOptions,
  persistOpportunityContactRole,
} from "../utils/opportunityViewModelHelpers";

/** Detail ViewModel hook for Deal 360 powered by TanStack Query v5. */
export function useOpportunityDetailViewModel(opportunityId: string, enabled = true) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [fulfillmentOverride, setFulfillmentOverride] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const detailQuery = useQuery<OpportunityDetailResult>(
    {
      queryKey: qk.crm.opportunityDetail(tenantId, opportunityId),
      queryFn: () => getCrmContainer().opportunityRepository.getOpportunityById(opportunityId),
      enabled: enabled && Boolean(opportunityId),
      staleTime: 30_000,
    },
    safeQueryClient
  );

  const pipelineQuery = useQuery<PipelineDefinition | null>(
    {
      queryKey: qk.crm.pipelines(tenantId),
      queryFn: async () => {
        const wfRepo = getCrmContainer().workflowRepository;
        if (typeof wfRepo?.getPipelines !== "function") return null;
        const pipes = await wfRepo.getPipelines("deal");
        return pipes.find((p) => p.isDefault) ?? pipes[0] ?? null;
      },
      enabled,
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const rolesQuery = useQuery<DealContactRole[]>(
    {
      queryKey: [...qk.crm.opportunityDetail(tenantId, opportunityId), "roles"],
      queryFn: async () => {
        const repo = getCrmContainer().opportunityRepository;
        return typeof repo?.getContactRoles === "function" ? repo.getContactRoles(opportunityId) : [];
      },
      enabled: enabled && Boolean(opportunityId),
      staleTime: 30_000,
    },
    safeQueryClient
  );

  const fulfillmentQuery = useQuery<boolean>(
    {
      queryKey: qk.crm.activities(tenantId, { opportunityId, activityKind: "FulfillmentRequested" }),
      queryFn: async () => {
        const actRepo = getCrmContainer().activityRepository;
        if (typeof actRepo?.getActivities !== "function") return false;
        const res = await actRepo.getActivities({ opportunityId, activityKind: "FulfillmentRequested", page: 1, pageSize: 5 });
        return Boolean((res.items && res.items.length > 0) || (res.totalCount && res.totalCount > 0));
      },
      enabled: enabled && Boolean(opportunityId),
      staleTime: 30_000,
    },
    safeQueryClient
  );

  const invalidateDetail = useCallback(async () => {
    await safeQueryClient.invalidateQueries({ queryKey: qk.crm.opportunityDetail(tenantId, opportunityId) });
    await safeQueryClient.invalidateQueries({ queryKey: ["crm", "activities", tenantId] });
    await safeQueryClient.invalidateQueries({ queryKey: qk.crm.opportunities(tenantId) });
  }, [opportunityId, safeQueryClient, tenantId]);

  const runDetailMutation = useCallback(
    async (op: () => Promise<void>, fallbackError: string) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        await op();
        await invalidateDetail();
        setIsSubmitting(false);
        return true;
      } catch (err: unknown) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : fallbackError);
        return false;
      }
    },
    [invalidateDetail],
  );

  const handleMoveStage = (input: MoveOpportunityStageInput) =>
    runDetailMutation(async () => {
      await getCrmContainer().opportunityRepository.moveStage(input);
      if (input.customFieldValues && Object.keys(input.customFieldValues).length > 0) {
        try {
          const normalized = normalizeCustomFieldValuesForSave(input.customFieldValues);
          if (Object.keys(normalized).length > 0) {
            await getCustomFieldsExtension()?.saveValues("crm.opportunity", input.opportunityId, normalized);
          }
        } catch { /* non-blocking custom fields write */ }
      }
    }, "Failed to move stage");

  const handleCloseOpportunity = (input: CloseOpportunityInput) =>
    runDetailMutation(() => getCrmContainer().opportunityRepository.closeOpportunity(input).then(() => undefined), "Failed to close opportunity");

  const handleReopenOpportunity = (input: ReopenOpportunityInput) =>
    runDetailMutation(() => getCrmContainer().opportunityRepository.reopenOpportunity(input).then(() => undefined), "Failed to reopen opportunity");

  const handleAssignOwner = (input: AssignOpportunityOwnerInput) =>
    runDetailMutation(() => getCrmContainer().opportunityRepository.assignOwner(input).then(() => undefined), "Failed to assign owner");

  const handleRequestFulfillment = async (): Promise<boolean> => {
    const opp = detailQuery.data?.opportunity;
    if (!opp) return false;
    setSubmitError(null);
    try {
      const actRepo = getCrmContainer().activityRepository;
      if (typeof actRepo?.createActivity !== "function") {
        setSubmitError("Activity repository is unavailable for fulfillment dispatch.");
        return false;
      }
      await actRepo.createActivity({
        activityKind: "FulfillmentRequested",
        summary: `HQ Commercial Fulfillment Handoff Requested: ${opp.title}`,
        bodyText: `Commercial deal (${opp.dealKind} - ${opp.currencyCode} ${opp.estimatedAmount ?? 0}) submitted for platform tenant provisioning & contract activation.`,
        opportunityId: opp.id,
        accountId: opp.accountId ?? undefined,
        containsPii: false,
      });
      setFulfillmentOverride(true);
      await invalidateDetail();
      return true;
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Failed to dispatch HQ fulfillment handoff.");
      return false;
    }
  };

  const handleAddContactRole = async (input: {
    contactPartyId: string;
    contactName: string;
    stakeholderRole: DealContactRole["stakeholderRole"];
    isPrimary: boolean;
    influenceNotes?: string;
  }) => {
    const opp = detailQuery.data?.opportunity;
    if (!opp) return;
    setSubmitError(null);
    try {
      await persistOpportunityContactRole(getCrmContainer().opportunityRepository, opp.id, input);
      await invalidateDetail();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Unable to add stakeholder role");
    }
  };

  const handleRemoveContactRole = async (roleId: string) => {
    const opp = detailQuery.data?.opportunity;
    if (!opp) return;
    setSubmitError(null);
    try {
      const repo = getCrmContainer().opportunityRepository;
      if (typeof repo?.removeContactRole === "function") await repo.removeContactRole(opp.id, roleId);
      await invalidateDetail();
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Unable to remove stakeholder role");
    }
  };

  return {
    loading: detailQuery.isLoading,
    error: detailQuery.error instanceof Error ? detailQuery.error.message : null,
    data: detailQuery.data ?? null,
    pipeline: pipelineQuery.data ?? null,
    contactRoles: rolesQuery.data ?? [],
    loadData: () => detailQuery.refetch().then(() => undefined),
    lookupPartyOptions: (query?: string) =>
      lookupOpportunityPartyOptions(getCrmContainer().accountRepository, query),
    isAssignOwnerOpen,
    setIsAssignOwnerOpen,
    fulfillmentRequested: fulfillmentOverride || Boolean(fulfillmentQuery.data),
    isSubmitting,
    submitError,
    setSubmitError,
    handleMoveStage,
    handleCloseOpportunity,
    handleReopenOpportunity,
    handleAssignOwner,
    handleRequestFulfillment,
    handleAddContactRole,
    handleRemoveContactRole,
  };
}
