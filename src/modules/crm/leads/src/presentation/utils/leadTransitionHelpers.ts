"use client";

import {
  INITIAL_CRM_WORKFLOWS,
  useCrmWorkflowsStore,
  type CrmWorkflowDefinition,
  type CrmWorkflowTransitionSubmitPayload,
  type TransitionRecordContext,
} from "@modules/crm";
import type { CrmLead, LeadStatus, MoveLeadStageInput } from "../../domain/entities/LeadEntity";

/** Derives target Opportunity stages for lead conversion from the active deal workflow (with store baseline fallback). */
export function buildLeadConversionStageOptions(
  activeDealWorkflow: CrmWorkflowDefinition | null | undefined,
  isRtl: boolean,
  partyReqSuffix: string,
  initialSuffix: string
) {
  const baselineDealWorkflow = INITIAL_CRM_WORKFLOWS.find((w) => w.entityType === "deal");
  const stagesSource =
    activeDealWorkflow?.stages && activeDealWorkflow.stages.length >= 2
      ? activeDealWorkflow.stages
      : baselineDealWorkflow?.stages ?? [];

  return [...stagesSource]
    .filter((s) => s.category !== "done" && s.category !== "lost")
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((s, idx) => {
      const requiresParty = Boolean(
        s.requiresVerifiedParty || s.requiredExitFields?.includes("partyId")
      );
      const baseLabel = isRtl && s.labelAr ? s.labelAr : s.labelEn;
      const suffix = requiresParty ? partyReqSuffix : idx === 0 ? initialSuffix : "";
      return {
        key: s.stageKey,
        label: `${idx + 1}. ${baseLabel}${suffix ? ` (${suffix})` : ""}`,
        requiresParty,
      };
    });
}

/** Normalizes a lead status or label into its canonical workflow stage key. */
export function toLeadStageKey(
  statusOrKey: string,
  stages?: Array<{ stageKey: string; labelEn: string; labelAr?: string | null }>
): string {
  const wfStages = stages ?? useCrmWorkflowsStore.getState().getActiveWorkflow("lead")?.stages;
  const matched = wfStages?.find(
    (s) =>
      s.stageKey.toLowerCase() === statusOrKey.toLowerCase() ||
      s.labelEn.toLowerCase() === statusOrKey.toLowerCase() ||
      s.labelAr === statusOrKey
  );
  if (matched) return matched.stageKey;
  if (statusOrKey.startsWith("lead.")) return statusOrKey;
  return `lead.${statusOrKey.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")}`;
}

/** Maps a canonical lead workflow stage key back to a domain `LeadStatus`. */
export function stageKeyToLeadStatus(
  stageKey: string,
  labelEn: string,
  fallback: LeadStatus
): LeadStatus {
  if (stageKey === "lead.new") return "New";
  if (stageKey === "lead.working") return "Working";
  if (stageKey === "lead.qualified") return "Qualified";
  if (stageKey === "lead.converted") return "Converted";
  if (stageKey === "lead.disqualified") return "Disqualified";
  return (labelEn || fallback || stageKey.replace(/^lead\./, "")) as LeadStatus;
}

/** Evaluates a lead workflow transition with full entity, BANT, and contact context. */
export function evaluateLeadStageTransition(
  lead: CrmLead,
  fromStageKey: string,
  targetStageKey: string,
  isRtl: boolean
) {
  const leadExtras = lead as unknown as {
    qualificationNotes?: string;
    customFields?: Record<string, unknown>;
  };
  return useCrmWorkflowsStore.getState().evaluateTransition("lead", fromStageKey, targetStageKey, {
    hasVerifiedParty: Boolean(lead.organizationPartyId || lead.personPartyId || lead.verifiedPartyId || lead.accountId),
    partyId: lead.verifiedPartyId || lead.organizationPartyId || lead.personPartyId || null,
    accountId: lead.accountId ?? null,
    ownerUserId: lead.ownerUserId ?? null,
    estimatedAmount: lead.estimatedValue ?? null,
    estimatedValue: lead.estimatedValue ?? null,
    leadPhoneOrEmail: lead.email || lead.phone || null,
    leadSourceChannel: lead.leadSourceChannel || lead.source || null,
    leadBantNotes: lead.leadBantNotes || lead.notes || null,
    targetCloseDate: null,
    disqualificationReason: lead.disqualificationReason ?? null,
    qualificationNotes: leadExtras.qualificationNotes ?? null,
    fields: leadExtras.customFields,
    locale: isRtl ? "ar" : "en",
  });
}

/** Builds a rich TransitionRecordContext for CrmWorkflowTransitionDialog on leads. */
export function buildLeadTransitionRecord(lead: CrmLead): TransitionRecordContext {
  const leadExtras = lead as unknown as {
    qualificationNotes?: string;
    customFields?: Record<string, unknown>;
  };
  return {
    id: lead.id,
    title: lead.title,
    firstName: lead.firstName,
    lastName: lead.lastName,
    fullName: lead.fullName,
    companyName: lead.companyName,
    email: lead.email,
    phone: lead.phone,
    partyId: lead.verifiedPartyId || lead.organizationPartyId || lead.personPartyId,
    partyDisplayName: lead.organizationDisplayName || lead.companyName || lead.fullName,
    accountId: lead.accountId,
    accountDisplayName: lead.accountDisplayName || lead.companyName,
    contactDisplayName: lead.personDisplayName || lead.fullName,
    ownerUserId: lead.ownerUserId,
    ownerDisplayName: lead.ownerDisplayName,
    organizationPartyId: lead.organizationPartyId,
    personPartyId: lead.personPartyId,
    estimatedValue: lead.estimatedValue,
    estimatedAmount: lead.estimatedValue,
    currency: lead.currency,
    currencyCode: lead.currency,
    leadPhoneOrEmail: lead.email || lead.phone || null,
    leadSourceChannel: lead.leadSourceChannel || lead.source || null,
    leadBantNotes: lead.leadBantNotes || lead.notes || null,
    rowVersion: lead.rowVersion,
    qualificationNotes: leadExtras.qualificationNotes,
    customFields: leadExtras.customFields,
  };
}

/** Maps a CrmWorkflowTransitionDialog payload into a domain MoveLeadStageInput. */
export function mapLeadTransitionPayload(
  payload: CrmWorkflowTransitionSubmitPayload,
  fallbackRowVersion?: string
): MoveLeadStageInput {
  const serializedCustomFields = payload.customFields
    ? Object.fromEntries(
        Object.entries(payload.customFields)
          .filter(([, val]) => val !== undefined && val !== null && val !== "")
          .map(([key, val]) => [key, String(val)])
      )
    : undefined;

  return {
    leadId: payload.entityId,
    targetStageKey: payload.targetStageKey,
    transitionId: payload.transitionId,
    expectedRowVersion: payload.expectedRowVersion || fallbackRowVersion,
    partyId: payload.partyId,
    accountId: payload.accountId,
    contactId: payload.contactId,
    ownerUserId: payload.ownerUserId,
    leadPhoneOrEmail: payload.leadPhoneOrEmail,
    leadSourceChannel: payload.leadSourceChannel,
    leadBantNotes: payload.leadBantNotes,
    estimatedValue: payload.estimatedAmount,
    closeNotes: payload.closeNotes,
    qualificationNotes: payload.qualificationNotes,
    disqualificationReasonCode: payload.disqualificationReasonCode,
    reopenReason: payload.reopenReason,
    reason: payload.reason,
    auditNote: payload.auditNote,
    nextStepSummary: payload.nextStepSummary,
    convertDealTitle: payload.convertDealTitle,
    targetDealPipelineId: payload.targetDealPipelineId,
    customFields:
      serializedCustomFields && Object.keys(serializedCustomFields).length > 0
        ? serializedCustomFields
        : undefined,
  };
}

/** Builds standardized GenericCrudView pagination state for Leads. */
export function buildLeadsPagination(
  page: number,
  pageSize: number,
  totalCount: number,
  onPageChange: (p: number) => void,
  onPageSizeChange: (s: number) => void
) {
  const safeSize = pageSize || 20;
  const pagesCount = Math.max(1, Math.ceil(totalCount / safeSize));
  return {
    page: page || 1,
    currentPage: page || 1,
    pageSize: safeSize,
    itemsCount: totalCount,
    pagesCount,
    totalCount,
    totalPages: pagesCount,
    hasNextPage: (page || 1) * safeSize < totalCount,
    hasPreviousPage: (page || 1) > 1,
    onPageChange,
    onPageSizeChange,
  };
}

/** Persists non-empty custom fields for a newly created or updated Lead (non-blocking). */
export async function saveLeadCustomFieldsIfPresent(
  leadId: string | undefined,
  customFieldValues?: Record<string, unknown>
): Promise<void> {
  if (!leadId || !customFieldValues || Object.keys(customFieldValues).length === 0) return;
  try {
    const { getCustomFieldsExtension, normalizeCustomFieldValuesForSave } = await import(
      "@core/crud/customFieldsExtension"
    );
    const ext = getCustomFieldsExtension();
    const normalized = normalizeCustomFieldValuesForSave(customFieldValues);
    if (ext?.saveValues && Object.keys(normalized).length > 0) {
      await ext.saveValues("crm.lead", leadId, normalized);
    }
  } catch {
    // Non-blocking custom fields persistence
  }
}

/** Builds Quick-Create defaults directly from an active Lead record. */
export function buildLeadQuickCreateDefaults(
  lead: CrmLead | null,
  kind: "account" | "contact"
) {
  if (!lead) return undefined;
  const accountName = (lead.companyName || lead.title || "").trim();
  const contactName = (
    lead.fullName?.trim() ||
    [lead.firstName, lead.lastName].filter(Boolean).join(" ").trim()
  );
  return {
    nameEn: (kind === "contact" ? contactName : accountName) || undefined,
    accountNameEn: accountName || undefined,
    contactNameEn: contactName || undefined,
    email: lead.email || undefined,
    phone: lead.phone || undefined,
  };
}

/** Resolves localized source and target stage labels for CrmWorkflowTransitionDialog. */
export function resolveLeadTransitionStageLabels(
  activeLeadWorkflow: CrmWorkflowDefinition | null | undefined,
  fromKey: string,
  toKey: string,
  isRtl: boolean
) {
  const pickLabel = (stageKey: string) => {
    const stg = activeLeadWorkflow?.stages.find((s) => s.stageKey === stageKey);
    return stg ? (isRtl && stg.labelAr ? stg.labelAr : stg.labelEn) : undefined;
  };
  return { fromStageLabel: pickLabel(fromKey), toStageLabel: pickLabel(toKey) };
}
