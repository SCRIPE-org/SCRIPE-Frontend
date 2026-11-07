"use client";

import { useState, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import { useCrmWorkflowsStore } from "@modules/crm";
import type {
  CrmLead,
  QualifyLeadInput,
  QualificationDecision,
  LinkPartyToLeadInput,
  ConvertLeadInput,
  ConvertLeadResult,
  LeadStatus,
} from "../../domain/models/crm-lead.types";

function toLeadStageKey(statusOrKey: string): string {
  const wf = useCrmWorkflowsStore.getState().getActiveWorkflow("lead");
  const matchedStage = wf?.stages?.find(
    (s) =>
      s.stageKey.toLowerCase() === statusOrKey.toLowerCase() ||
      s.labelEn.toLowerCase() === statusOrKey.toLowerCase() ||
      s.labelAr === statusOrKey
  );
  if (matchedStage) return matchedStage.stageKey;
  if (statusOrKey.startsWith("lead.")) return statusOrKey;
  return `lead.${statusOrKey.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

const STANDARD_LEAD_STATUSES = new Set(["New", "Working", "Qualified", "Converted", "Disqualified"]);

export function useLeadWorkflowActions(
  items: CrmLead[],
  page: number,
  pageSize: number,
  search: string,
  statusFilter: LeadStatus | undefined,
  loadLeads: (page?: number, searchQuery?: string, status?: LeadStatus, size?: number) => Promise<void>,
  setStateItemsAndError: (items: CrmLead[], error: string | null) => void,
  setStateError: (error: string | null) => void,
  setIsSubmitting: (val: boolean) => void,
  setSubmitError: (val: string | null) => void,
) {
  const [isQualifyOpen, setIsQualifyOpen] = useState(false);
  const [qualifyDefaultDecision, setQualifyDefaultDecision] = useState<QualificationDecision>("Qualified");
  const [isLinkPartyOpen, setIsLinkPartyOpen] = useState(false);
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<CrmLead | null>(null);

  const handleSetIsQualifyOpen = useCallback(
    (open: boolean) => {
      setIsQualifyOpen(open);
      if (!open) {
        setSubmitError(null);
        setActiveLead(null);
      }
    },
    [setSubmitError],
  );

  const handleSetIsLinkPartyOpen = useCallback(
    (open: boolean) => {
      setIsLinkPartyOpen(open);
      if (!open) {
        setSubmitError(null);
        setActiveLead(null);
      }
    },
    [setSubmitError],
  );

  const handleSetIsConvertOpen = useCallback(
    (open: boolean) => {
      setIsConvertOpen(open);
      if (!open) {
        setSubmitError(null);
        setActiveLead(null);
      }
    },
    [setSubmitError],
  );

  const openQualifyDialog = useCallback(
    (lead: CrmLead, defaultDecision: QualificationDecision = "Qualified") => {
      setActiveLead(lead);
      setQualifyDefaultDecision(defaultDecision);
      setSubmitError(null);
      setIsQualifyOpen(true);
    },
    [setSubmitError],
  );

  const openLinkPartyDialog = useCallback(
    (lead: CrmLead) => {
      setActiveLead(lead);
      setSubmitError(null);
      setIsLinkPartyOpen(true);
    },
    [setSubmitError],
  );

  const openConvertDialog = useCallback(
    (lead: CrmLead) => {
      setActiveLead(lead);
      setSubmitError(null);
      setIsConvertOpen(true);
    },
    [setSubmitError],
  );

  const handleUpdateLeadStatus = useCallback(
    async (lead: CrmLead, newStatus: string): Promise<boolean> => {
      if (lead.status === newStatus && lead.stageKey === toLeadStageKey(newStatus)) return true;
      const fromKey = lead.stageKey || toLeadStageKey(lead.status);
      const toKey = toLeadStageKey(newStatus);
      const evalResult = useCrmWorkflowsStore.getState().evaluateTransition("lead", fromKey, toKey, {
        hasVerifiedParty: Boolean(lead.organizationPartyId || lead.personPartyId),
        estimatedAmount: lead.estimatedValue ?? null,
        targetCloseDate: null,
      });

      if (!evalResult.allowed) {
        const msg = evalResult.reason || "Status transition blocked by active Lead workflow.";
        setSubmitError(msg);
        setStateError(msg);
        return false;
      }
      if (newStatus === "Disqualified") {
        openQualifyDialog(lead, "Disqualified");
        return false;
      }
      if ((newStatus === "Qualified" || (evalResult.promptForComment && newStatus !== "New" && newStatus !== "Working")) && !evalResult.shouldTriggerDealConversion && lead.status !== "Converted") {
        openQualifyDialog(lead, "Qualified");
        return false;
      }

      const previousItems = items;
      setSubmitError(null);
      setStateItemsAndError(
        items.map((item) =>
          item.id === lead.id
            ? { ...item, status: newStatus as LeadStatus, statusName: newStatus, stageKey: toKey }
            : item,
        ),
        null,
      );

      try {
        const container = getCrmContainer();
        const isCustomStage = !STANDARD_LEAD_STATUSES.has(newStatus);
        if (typeof container.leadRepository.moveLeadStage === "function" && (isCustomStage || evalResult.shouldTriggerDealConversion || lead.status !== "Converted")) {
          const moved = await container.leadRepository.moveLeadStage({
            leadId: lead.id,
            targetStageKey: toKey,
            reason: "Kanban stage step transition",
            expectedRowVersion: lead.rowVersion,
          });
          if (evalResult.shouldTriggerDealConversion || moved?.triggerDealConversion) {
            openConvertDialog(moved ?? lead);
          }
        } else {
          await container.leadRepository.updateLead({
            leadId: lead.id,
            markWorking: newStatus === "Working",
            targetStatus: (STANDARD_LEAD_STATUSES.has(newStatus) ? newStatus : "Working") as LeadStatus,
            expectedRowVersion: lead.rowVersion,
          });
          if (evalResult.shouldTriggerDealConversion) {
            openConvertDialog(lead);
          }
        }
        await loadLeads(page, search, statusFilter, pageSize);
        return true;
      } catch (err) {
        if (evalResult.shouldTriggerDealConversion) {
          openConvertDialog(lead);
          return false;
        }
        const errMsg = err instanceof Error ? err.message : "Failed to update lead status";
        setSubmitError(errMsg);
        setStateItemsAndError(previousItems, errMsg);
        return false;
      }
    },
    [
      items,
      page,
      pageSize,
      search,
      statusFilter,
      loadLeads,
      openConvertDialog,
      openQualifyDialog,
      setStateError,
      setStateItemsAndError,
      setSubmitError,
    ],
  );

  const handleQualifyLead = useCallback(
    async (input: QualifyLeadInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        await container.leadRepository.qualifyLead(input);
        setIsSubmitting(false);
        setIsQualifyOpen(false);
        setActiveLead(null);
        loadLeads(page, search, statusFilter, pageSize);
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to qualify lead");
        return false;
      }
    },
    [loadLeads, page, pageSize, search, statusFilter, setIsSubmitting, setSubmitError],
  );

  const handleLinkParty = useCallback(
    async (input: LinkPartyToLeadInput): Promise<boolean> => {
      setIsSubmitting(true);
      setSubmitError(null);
      try {
        const container = getCrmContainer();
        await container.leadRepository.linkParty(input);
        setIsSubmitting(false);
        setIsLinkPartyOpen(false);
        setActiveLead(null);
        loadLeads(page, search, statusFilter, pageSize);
        return true;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to link contact or organization");
        return false;
      }
    },
    [loadLeads, page, pageSize, search, statusFilter, setIsSubmitting, setSubmitError],
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
        setActiveLead(null);
        loadLeads(page, search, statusFilter, pageSize);
        return result;
      } catch (err) {
        setIsSubmitting(false);
        setSubmitError(err instanceof Error ? err.message : "Failed to convert lead");
        return null;
      }
    },
    [loadLeads, page, pageSize, search, statusFilter, setIsSubmitting, setSubmitError],
  );

  const lookupCandidateParties = useCallback(
    async (query?: string, partyKind?: "Organization" | "Person") => {
      const container = getCrmContainer();
      return container.accountRepository.lookupCandidateParties(query, partyKind);
    },
    [],
  );

  return {
    isQualifyOpen,
    qualifyDefaultDecision,
    isLinkPartyOpen,
    isConvertOpen,
    activeLead,
    setActiveLead,
    setIsQualifyOpen: handleSetIsQualifyOpen,
    setIsLinkPartyOpen: handleSetIsLinkPartyOpen,
    setIsConvertOpen: handleSetIsConvertOpen,
    openQualifyDialog,
    openLinkPartyDialog,
    openConvertDialog,
    handleUpdateLeadStatus,
    handleQualifyLead,
    handleLinkParty,
    handleConvertLead,
    lookupCandidateParties,
  };
}
