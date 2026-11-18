"use client";

import { useState, useEffect, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
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

export interface LeadDetailState {
  stage: "loading" | "success" | "failed";
  lead: CrmLead | null;
  error: string | null;
}

/**
 * ViewModel hook for the Lead 360 Qualification & Conversion Workspace (/crm/leads/[id]).
 */
export function useLeadDetailViewModel(leadId: string) {
  const [state, setState] = useState<LeadDetailState>({ stage: "loading", lead: null, error: null });
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQualifyOpen, setIsQualifyOpen] = useState(false);
  const [qualifyDefaultDecision, setQualifyDefaultDecision] = useState<QualificationDecision>("Qualified");
  const [isLinkPartyOpen, setIsLinkPartyOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isAssignOwnerOpen, setIsAssignOwnerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadLead = useCallback(async () => {
    if (!leadId) return;
    setState((prev) => ({ ...prev, stage: "loading", error: null }));
    try {
      const lead = await getCrmContainer().leadRepository.getLeadById(leadId);
      setState({ stage: "success", lead, error: null });
    } catch (err) {
      setState({ stage: "failed", lead: null, error: err instanceof Error ? err.message : "Failed to load lead details" });
    }
  }, [leadId]);

  useEffect(() => { loadLead(); }, [loadLead]);

  const runLeadUpdate = useCallback(async (op: () => Promise<CrmLead>, fallbackError: string, onSuccess?: () => void) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const updated = await op();
      setState({ stage: "success", lead: updated, error: null });
      setIsSubmitting(false);
      onSuccess?.();
      return updated;
    } catch (err) {
      setIsSubmitting(false);
      setSubmitError(err instanceof Error ? err.message : fallbackError);
      return null;
    }
  }, []);

  const handleUpdateLead = useCallback(
    async (input: Omit<UpdateLeadInput, "leadId" | "expectedRowVersion">, customFieldValues?: Record<string, unknown>) => {
      if (!state.lead) return false;
      const leadIdToSave = state.lead.id;
      const expectedRowVersion = state.lead.rowVersion;
      const updated = await runLeadUpdate(async () => {
        const res = await getCrmContainer().leadRepository.updateLead({ ...input, leadId: leadIdToSave, expectedRowVersion });
        await saveLeadCustomFieldsIfPresent(leadIdToSave, customFieldValues);
        return res;
      }, "Failed to update lead", () => setIsEditOpen(false));
      return Boolean(updated);
    },
    [state.lead, runLeadUpdate]
  );

  const handleStatusProgression = useCallback(
    async (targetStatus: LeadStatus) => {
      if (!state.lead || state.lead.status === targetStatus) return true;
      if (targetStatus === "Converted") { setSubmitError(null); setIsConvertOpen(true); return false; }
      if (targetStatus === "Disqualified" || (targetStatus === "Qualified" && state.lead.status !== "Converted")) {
        setQualifyDefaultDecision(targetStatus === "Disqualified" ? "Disqualified" : "Qualified");
        setSubmitError(null);
        setIsQualifyOpen(true);
        return false;
      }
      const res = await runLeadUpdate(
        () => getCrmContainer().leadRepository.updateLead({
          leadId: state.lead!.id, markWorking: targetStatus === "Working",
          targetStatus, expectedRowVersion: state.lead!.rowVersion,
        }),
        "Failed to transition lead status"
      );
      return Boolean(res);
    },
    [state.lead, runLeadUpdate]
  );

  const handleTransitionSubmit = useCallback(
    async (payload: CrmWorkflowTransitionSubmitPayload) => {
      if (!state.lead) return false;
      const res = await runLeadUpdate(
        () => getCrmContainer().leadRepository.moveLeadStage(mapLeadTransitionPayload(payload, state.lead!.rowVersion)),
        "Failed to move stage"
      );
      return Boolean(res);
    },
    [state.lead, runLeadUpdate]
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
        await loadLead();
        return result;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to convert lead");
        return null;
      }
    },
    [loadLead]
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
    linkPartyBeforeConvert, lookupCandidateParties, refresh: loadLead,
  };
}
