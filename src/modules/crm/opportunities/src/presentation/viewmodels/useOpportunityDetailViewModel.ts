"use client";

import { useState, useEffect, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } from "@core/crud/customFieldsExtension";
import type {
  OpportunityDetailResult,
  OpportunityStatus,
  MoveOpportunityStageInput,
  CloseOpportunityInput,
  ReopenOpportunityInput,
  AssignOpportunityOwnerInput,
  PipelineDefinition,
  DealContactRoleDto,
} from "../../domain/entities/OpportunityEntity";
import { lookupOpportunityPartyOptions } from "./useOpportunityViewModelHelpers";

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

export function useOpportunityDetailViewModel(opportunityId: string) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<OpportunityDetailResult | null>(null);
  const [pipeline, setPipeline] = useState<PipelineDefinition | null>(null);
  const [contactRoles, setContactRoles] = useState<DealContactRoleDto[]>([]);

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
      const [result, pipelineRes, fulfillmentActivities, rolesRes] = await Promise.all([
        repo.getOpportunityById(opportunityId),
        typeof repo.getDefaultPipeline === "function" ? repo.getDefaultPipeline().catch(() => null) : Promise.resolve(null),
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
        typeof repo.getContactRoles === "function" ? repo.getContactRoles(opportunityId).catch(() => []) : Promise.resolve([]),
      ]);
      setData(result);
      if (pipelineRes) setPipeline(pipelineRes);
      if (Array.isArray(rolesRes)) setContactRoles(rolesRes);
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
            await getCustomFieldsExtension()?.saveValues("crm.opportunity", input.opportunityId, normalized);
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

  const handleAddContactRole = async (input: {
    contactPartyId: string;
    contactName: string;
    stakeholderRole: DealContactRoleDto["stakeholderRole"];
    isPrimary: boolean;
    influenceNotes?: string;
  }) => {
    const opp = data?.opportunity;
    if (!opp) return;
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      if (typeof repo?.addContactRole === "function") {
        const created = await repo.addContactRole({
          opportunityId: opp.id,
          contactPartyId: input.contactPartyId,
          contactName: input.contactName,
          stakeholderRole: input.stakeholderRole,
          isPrimary: input.isPrimary,
          influenceNotes: input.influenceNotes,
        });
        const normalizedRole: DealContactRoleDto = {
          ...created,
          id: created?.id || `role-${Date.now()}`,
          opportunityId: opp.id,
          contactPartyId: created?.contactPartyId || input.contactPartyId,
          contactName: created?.contactName || input.contactName,
          stakeholderRole: (created?.stakeholderRole || input.stakeholderRole) as DealContactRoleDto["stakeholderRole"],
          isPrimary: created?.isPrimary ?? input.isPrimary,
          influenceNotes: created?.influenceNotes ?? (created as any)?.notes ?? input.influenceNotes ?? null,
          createdAtUtc: created?.createdAtUtc ?? (created as any)?.createdAt ?? new Date().toISOString(),
        };
        setContactRoles((prev) => [normalizedRole, ...prev.filter((r) => r.id !== normalizedRole.id)]);
      }
    } catch {
      // Keep UI responsive even if offline
    }
  };

  const handleRemoveContactRole = async (roleId: string) => {
    const opp = data?.opportunity;
    if (!opp) return;
    try {
      const repo = (getCrmContainer() as any).opportunityRepository;
      if (typeof repo?.removeContactRole === "function") {
        await repo.removeContactRole(opp.id, roleId);
      }
      setContactRoles((prev) => prev.filter((r) => r.id !== roleId));
    } catch {
      setContactRoles((prev) => prev.filter((r) => r.id !== roleId));
    }
  };

  return {
    loading,
    error,
    data,
    pipeline,
    contactRoles,
    loadData,
    lookupPartyOptions: lookupOpportunityPartyOptions,
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
    handleAddContactRole,
    handleRemoveContactRole,
  };
}
