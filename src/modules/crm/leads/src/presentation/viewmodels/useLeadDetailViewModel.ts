"use client";

import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmTenantScope, useSafeQueryClient } from "@modules/crm/shared";
import type { CrmWorkflowTransitionSubmitPayload } from "@modules/crm";
import type {
  CrmLead,
  UpdateLeadInput,
  AssignLeadOwnerInput,
  QualifyLeadInput,
  QualificationDecision,
  LinkPartyToLeadInput,
  ConvertLeadInput,
  ConvertLeadResult,
  LeadStatus,
} from "../../domain/models/crm-lead.types";
import { mapLeadTransitionPayload, saveLeadCustomFieldsIfPresent } from "../utils/leadTransitionHelpers";

/** State snapshot for the Lead 360 Qualification & Conversion Workspace. */
export interface LeadDetailState {
  stage: "loading" | "success" | "failed";
  lead: CrmLead | null;
  error: string | null;
}

/**
 * ViewModel hook for the Lead 360 Qualification & Conversion Workspace (`/crm/leads/[id]`)
 * powered by TanStack Query v5.
 */
export function useLeadDetailViewModel(leadId: string) {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId } = useCrmTenantScope();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQualifyOpen, setIsQualifyOpen] = useState(false);
  const [qualifyDefaultDecision, setQualifyDefaultDecision] = useState<QualificationDecision>("Qualified");
  const [isLinkPartyOpen, setIsLinkPartyOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const detailQuery = useQuery<CrmLead>(
    {
      queryKey: qk.crm.leadDetail(tenantId, leadId),
      queryFn: () => getCrmContainer().leadRepository.getLeadById(leadId),
      enabled: Boolean(leadId),
      staleTime: 30_000,
    },
    safeQueryClient
  );

  const currentLead = detailQuery.data ?? null;
  const errorMsg = detailQuery.error instanceof Error ? detailQuery.error.message : null;
  const state: LeadDetailState = {
    stage: detailQuery.isLoading ? "loading" : detailQuery.isError ? "failed" : "success",
    lead: currentLead,
    error: errorMsg,
  };

  const runLeadUpdate = useCallback(
    async (op: () => Promise<CrmLead>, fallbackError: string, onSuccess?: () => void) => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const updated = await op();
        safeQueryClient.setQueryData(qk.crm.leadDetail(tenantId, leadId), updated);
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.leadDetail(tenantId, leadId) });
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.leads(tenantId) });
        setIsSubmitting(false);
        onSuccess?.();
        return updated;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : fallbackError);
        return null;
      }
    },
    [leadId, safeQueryClient, tenantId]
  );

  const handleUpdateLead = useCallback(
    async (input: Omit<UpdateLeadInput, "leadId" | "expectedRowVersion">, customFieldValues?: Record<string, unknown>) => {
      if (!currentLead) return false;
      const leadIdToSave = currentLead.id;
      const expectedRowVersion = currentLead.rowVersion;
      const updated = await runLeadUpdate(async () => {
        const res = await getCrmContainer().leadRepository.updateLead({ ...input, leadId: leadIdToSave, expectedRowVersion });
        await saveLeadCustomFieldsIfPresent(leadIdToSave, customFieldValues);
        return res;
      }, "Failed to update lead", () => setIsEditOpen(false));
      return Boolean(updated);
    },
    [currentLead, runLeadUpdate]
  );

  const handleStatusProgression = useCallback(
    async (targetStatus: LeadStatus) => {
      if (!currentLead || currentLead.status === targetStatus) return true;
      if (targetStatus === "Converted") { setSubmitError(null); setIsConvertOpen(true); return false; }
      if (targetStatus === "Disqualified" || (targetStatus === "Qualified" && currentLead.status !== "Converted")) {
        setQualifyDefaultDecision(targetStatus === "Disqualified" ? "Disqualified" : "Qualified");
        setSubmitError(null);
        setIsQualifyOpen(true);
        return false;
      }
      const res = await runLeadUpdate(
        () => getCrmContainer().leadRepository.updateLead({
          leadId: currentLead.id,
          markWorking: targetStatus === "Working",
          targetStatus,
          expectedRowVersion: currentLead.rowVersion,
        }),
        "Failed to transition lead status"
      );
      return Boolean(res);
    },
    [currentLead, runLeadUpdate]
  );

  const handleTransitionSubmit = useCallback(
    async (payload: CrmWorkflowTransitionSubmitPayload) => {
      if (!currentLead) return false;
      const res = await runLeadUpdate(
        () => getCrmContainer().leadRepository.moveLeadStage(mapLeadTransitionPayload(payload, currentLead.rowVersion)),
        "Failed to move stage"
      );
      return Boolean(res);
    },
    [currentLead, runLeadUpdate]
  );

  const handleAssignLeadOwner = useCallback(async (input: AssignLeadOwnerInput) => {
    const repo = getCrmContainer().leadRepository;
    const res = await runLeadUpdate(() => {
      if (!repo.assignOwner) throw new Error("Lead owner assignment unavailable");
      return repo.assignOwner(input);
    }, "Failed to assign lead owner", () => setIsAssignOwnerOpen(false));
    return Boolean(res);
  }, [runLeadUpdate]);

  const linkPartyBeforeConvert = useCallback(
    (input: LinkPartyToLeadInput) => runLeadUpdate(() => getCrmContainer().leadRepository.linkParty(input), "Failed to link party"),
    [runLeadUpdate]
  );

  const handleQualifyLead = useCallback(
    async (input: QualifyLeadInput) => Boolean(await runLeadUpdate(() => getCrmContainer().leadRepository.qualifyLead(input), "Failed to qualify lead", () => setIsQualifyOpen(false))),
    [runLeadUpdate]
  );

  const handleLinkParty = useCallback(
    async (input: LinkPartyToLeadInput) => Boolean(await runLeadUpdate(() => getCrmContainer().leadRepository.linkParty(input), "Failed to link party", () => setIsLinkPartyOpen(false))),
    [runLeadUpdate]
  );

  const handleConvertLead = useCallback(
    async (input: ConvertLeadInput): Promise<ConvertLeadResult | null> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const result = await getCrmContainer().leadRepository.convertLead(input);
        setIsSubmitting(false);
        setIsConvertOpen(false);
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.leadDetail(tenantId, leadId) });
        await safeQueryClient.invalidateQueries({ queryKey: qk.crm.leads(tenantId) });
        return result;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to convert lead");
        return null;
      }
    },
    [leadId, safeQueryClient, tenantId]
  );

  const lookupCandidateParties = useCallback(
    (query?: string, partyKind?: "Organization" | "Person") =>
      getCrmContainer().accountRepository.lookupCandidateParties(query, partyKind),
    []
  );

  return {
    state, isEditOpen, setIsEditOpen, isQualifyOpen, setIsQualifyOpen,
    qualifyDefaultDecision, setQualifyDefaultDecision, isLinkPartyOpen, setIsLinkPartyOpen,
    isConvertOpen, setIsConvertOpen, isAssignOwnerOpen, setIsAssignOwnerOpen,
    isSubmitting, submitError, setSubmitError,
    handleUpdateLead, handleStatusProgression, handleTransitionSubmit,
    handleQualifyLead, handleLinkParty, handleConvertLead, handleAssignLeadOwner,
    linkPartyBeforeConvert, lookupCandidateParties, refresh: () => detailQuery.refetch().then(() => undefined),
  };
}
