"use client";

import { useState, useEffect, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import type { CrmWorkflowTransitionSubmitPayload } from "@modules/crm";
import type {
  CrmLead,
  UpdateLeadInput,
  QualifyLeadInput,
  QualificationDecision,
  LinkPartyToLeadInput,
  ConvertLeadInput,
  ConvertLeadResult,
  LeadStatus,
} from "../../domain/models/crm-lead.types";

export interface LeadDetailState {
  stage: "loading" | "success" | "failed";
  lead: CrmLead | null;
  error: string | null;
}

/**
 * ViewModel hook for the Lead 360 Qualification & Conversion Workspace (/crm/leads/[id]).
 */
export function useLeadDetailViewModel(leadId: string) {
  const [state, setState] = useState<LeadDetailState>({
    stage: "loading",
    lead: null,
    error: null,
  });

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isQualifyOpen, setIsQualifyOpen] = useState(false);
  const [qualifyDefaultDecision, setQualifyDefaultDecision] =
    useState<QualificationDecision>("Qualified");
  const [isLinkPartyOpen, setIsLinkPartyOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadLead = useCallback(async () => {
    if (!leadId) return;
    setState((prev) => ({ ...prev, stage: "loading", error: null }));
    try {
      const container = getCrmContainer();
      const lead = await container.leadRepository.getLeadById(leadId);
      setState({
        stage: "success",
        lead,
        error: null,
      });
    } catch (err) {
      setState({
        stage: "failed",
        lead: null,
        error: err instanceof Error ? err.message : "Failed to load lead details",
      });
    }
  }, [leadId]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  const handleUpdateLead = useCallback(
    async (
      input: Omit<UpdateLeadInput, "leadId" | "expectedRowVersion">,
      customFieldValues?: Record<string, unknown>
    ): Promise<boolean> => {
      if (!state.lead) return false;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        const updated = await container.leadRepository.updateLead({
          ...input,
          leadId: state.lead.id,
          expectedRowVersion: state.lead.rowVersion,
        });
        if (customFieldValues && Object.keys(customFieldValues).length > 0) {
          try {
            const { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } = await import(
              "@core/crud/customFieldsExtension"
            );
            const ext = getCustomFieldsExtension();
            const normalized = normalizeCustomFieldValuesForSave(customFieldValues);
            if (ext?.saveValues && Object.keys(normalized).length > 0) {
              await ext.saveValues("crm.lead", state.lead.id, normalized);
            }
          } catch {
            // Non-blocking custom fields persistence
          }
        }
        setState({ stage: "success", lead: updated, error: null });
        setIsSubmitting(false);
        setIsEditOpen(false);
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to update lead");
        return false;
      }
    },
    [state.lead]
  );

  const handleStatusProgression = useCallback(
    async (targetStatus: LeadStatus): Promise<boolean> => {
      if (!state.lead || state.lead.status === targetStatus) return true;

      if (targetStatus === "Converted") {
        setSubmitError(null);
        setIsConvertOpen(true);
        return false;
      }

      if (targetStatus === "Disqualified") {
        setQualifyDefaultDecision("Disqualified");
        setSubmitError(null);
        setIsQualifyOpen(true);
        return false;
      }

      if (targetStatus === "Qualified" && state.lead.status !== "Converted") {
        setQualifyDefaultDecision("Qualified");
        setSubmitError(null);
        setIsQualifyOpen(true);
        return false;
      }

      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        const updated = await container.leadRepository.updateLead({
          leadId: state.lead.id,
          markWorking: targetStatus === "Working",
          targetStatus,
          expectedRowVersion: state.lead.rowVersion,
        });
        setState({ stage: "success", lead: updated, error: null });
        setIsSubmitting(false);
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to transition lead status");
        return false;
      }
    },
    [state.lead]
  );

  const handleTransitionSubmit = useCallback(
    async (payload: CrmWorkflowTransitionSubmitPayload): Promise<boolean> => {
      if (!state.lead) return false;
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        const updated = await container.leadRepository.moveLeadStage({
          leadId: payload.entityId,
          targetStageKey: payload.targetStageKey,
          transitionId: payload.transitionId,
          expectedRowVersion: payload.expectedRowVersion || state.lead.rowVersion,
          partyId: payload.partyId,
          accountId: payload.accountId,
          estimatedValue: payload.estimatedAmount,
          closeNotes: payload.closeNotes,
          disqualificationReasonCode: payload.disqualificationReasonCode,
          reopenReason: payload.reopenReason,
          reason: payload.reason,
          auditNote: payload.auditNote,
          convertDealTitle: payload.convertDealTitle,
          targetDealPipelineId: payload.targetDealPipelineId,
        });
        setState({ stage: "success", lead: updated, error: null });
        setIsSubmitting(false);
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to move stage");
        return false;
      }
    },
    [state.lead]
  );

  const handleQualifyLead = useCallback(
    async (input: QualifyLeadInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        const updated = await container.leadRepository.qualifyLead(input);
        setState({ stage: "success", lead: updated, error: null });
        setIsSubmitting(false);
        setIsQualifyOpen(false);
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to qualify lead");
        return false;
      }
    },
    []
  );

  const handleLinkParty = useCallback(
    async (input: LinkPartyToLeadInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        const updated = await container.leadRepository.linkParty(input);
        setState({ stage: "success", lead: updated, error: null });
        setIsSubmitting(false);
        setIsLinkPartyOpen(false);
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to link party");
        return false;
      }
    },
    []
  );

  const handleConvertLead = useCallback(
    async (input: ConvertLeadInput): Promise<ConvertLeadResult | null> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        const result = await container.leadRepository.convertLead(input);
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
    async (query?: string, partyKind?: "Organization" | "Person") => {
      const container = getCrmContainer();
      return container.accountRepository.lookupCandidateParties(query, partyKind);
    },
    []
  );

  return {
    state,
    isEditOpen,
    setIsEditOpen,
    isQualifyOpen,
    setIsQualifyOpen,
    qualifyDefaultDecision,
    setQualifyDefaultDecision,
    isLinkPartyOpen,
    setIsLinkPartyOpen,
    isConvertOpen,
    setIsConvertOpen,
    isSubmitting,
    submitError,
    setSubmitError,
    handleUpdateLead,
    handleStatusProgression,
    handleTransitionSubmit,
    handleQualifyLead,
    handleLinkParty,
    handleConvertLead,
    lookupCandidateParties,
    refresh: loadLead,
  };
}
