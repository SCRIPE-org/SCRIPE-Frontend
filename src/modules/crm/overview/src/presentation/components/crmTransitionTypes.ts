import type { EvaluatedWorkflowTransition } from "../../domain/constants/crmWorkflowRuleCatalogAndEval";

export type CrmTransitionCustomFieldValueType =
  | "Text"
  | "Number"
  | "Currency"
  | "Date"
  | "Boolean"
  | "Select"
  | "EntityReference"
  | "UserReference";

export interface CrmWorkflowTransitionCustomFieldSpec {
  key: string;
  labelEn: string;
  labelAr?: string;
  valueType: CrmTransitionCustomFieldValueType;
  isRequired: boolean;
  options?: string[];
  referenceEntityKind?: "party" | "account" | "contact";
}

export interface TransitionRecordContext {
  id: string;
  title?: string;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string | null;
  companyName?: string | null;
  email?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  partyId?: string | null;
  partyDisplayName?: string | null;
  accountId?: string | null;
  accountDisplayName?: string | null;
  contactId?: string | null;
  contactDisplayName?: string | null;
  primaryContactName?: string | null;
  ownerUserId?: string | null;
  ownerDisplayName?: string | null;
  organizationPartyId?: string | null;
  personPartyId?: string | null;
  estimatedAmount?: number | null;
  estimatedValue?: number | null;
  currency?: string;
  currencyCode?: string;
  targetCloseDate?: string | null;
  discountPercent?: number | null;
  nextStepSummary?: string | null;
  leadPhoneOrEmail?: string | null;
  leadSourceChannel?: string | null;
  leadBantNotes?: string | null;
  rowVersion?: string;
  customFields?: Record<string, unknown>;
  solutionFitConfirmed?: boolean | null;
  primaryContactRole?: string | null;
  qualificationNotes?: string | null;
}

/** Form values captured by CrmWorkflowTransitionDialog. */
export interface CrmWorkflowTransitionFormData {
  transitionId?: string;
  partyId?: string;
  contactId?: string;
  accountId?: string;
  ownerUserId?: string;
  estimatedAmount?: number;
  actualAmount?: number;
  targetCloseDate?: string;
  discountPercent?: number;
  nextStepSummary?: string;
  leadPhoneOrEmail?: string;
  leadSourceChannel?: string;
  leadBantNotes?: string;
  closeNotes?: string;
  lossReasonCode?: string;
  competitorName?: string;
  disqualificationReasonCode?: string;
  reopenReason?: string;
  reason?: string;
  auditNote?: string;
  convertDealTitle?: string;
  solutionFitConfirmed?: boolean;
  primaryContactRole?: string;
  qualificationNotes?: string;
  customFields?: Record<string, unknown>;
}

/** Payload submitted by CrmWorkflowTransitionDialog to execute a stage transition. */
export interface CrmWorkflowTransitionSubmitPayload {
  entityId: string;
  targetStageKey: string;
  transitionId?: string;
  reason?: string;
  auditNote?: string;
  partyId?: string;
  accountId?: string;
  contactId?: string;
  ownerUserId?: string;
  estimatedAmount?: number;
  actualAmount?: number;
  targetCloseDate?: string;
  discountPercent?: number;
  nextStepSummary?: string;
  leadPhoneOrEmail?: string;
  leadSourceChannel?: string;
  leadBantNotes?: string;
  closeNotes?: string;
  lossReasonCode?: string;
  competitorName?: string;
  winReasonCode?: string;
  disqualificationReasonCode?: string;
  reopenReason?: string;
  convertDealTitle?: string;
  targetDealPipelineId?: string;
  solutionFitConfirmed?: boolean;
  primaryContactRole?: string;
  qualificationNotes?: string;
  customFields?: Record<string, unknown>;
  expectedRowVersion?: string;
}

export interface PartyOption {
  id: string;
  name: string;
}

export interface CrmWorkflowTransitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: "deal" | "lead";
  record: TransitionRecordContext | null;
  fromStageKey: string;
  toStageKey: string;
  fromStageLabel?: string;
  toStageLabel?: string;
  partyOptions?: PartyOption[];
  customFieldsCatalog?: CrmWorkflowTransitionCustomFieldSpec[];
  evalResult?: EvaluatedWorkflowTransition | null;
  onSubmit: (data: CrmWorkflowTransitionSubmitPayload) => Promise<boolean | void>;
  isSubmitting?: boolean;
}

export {
  LOSS_REASONS,
  DISQUALIFICATION_REASONS,
  STAKEHOLDER_ROLES,
} from "../../domain/constants/crmReasonAndRoleCatalog";

/** Normalized boolean requirements computed strictly from evaluated transition rules. */
export interface TransitionDialogFlags {
  isDone: boolean;
  requiresReopenReason: boolean;
  requiresCloseNotes: boolean;
  requiresLossReason: boolean;
  requiresParty: boolean;
  requiresFinance: boolean;
  isLeadConvert: boolean;
  needsContactId: boolean;
  requireContactId: boolean;
  needsAccountId: boolean;
  requireAccountId: boolean;
  needsOwnerUserId: boolean;
  requireOwnerUserId: boolean;
  needsDiscountPercent: boolean;
  requireDiscountPercent: boolean;
  needsNextStepSummary: boolean;
  requireNextStepSummary: boolean;
  needsLeadPhoneOrEmail: boolean;
  requireLeadPhoneOrEmail: boolean;
  needsLeadSourceChannel: boolean;
  requireLeadSourceChannel: boolean;
  needsLeadBantNotes: boolean;
  requireLeadBantNotes: boolean;
  needsSolutionFit: boolean;
  requireSolutionFit: boolean;
  needsPrimaryContactRole: boolean;
  requirePrimaryContactRole: boolean;
  needsQualificationNotes: boolean;
  requireQualificationNotes: boolean;
  requiresReasonPrompt: boolean;
}

export { deriveTransitionDialogFlags, resolveTransitionCustomFields } from "./crmTransitionFlagsHelper";
export {
  buildTransitionSchema,
  getDefaultTransitionValues,
  buildTransitionSubmitPayload,
} from "./crmTransitionSchemaHelpers";

/** Derives Quick-Create default field values from an active Lead or Deal record. */
export function buildTransitionQuickCreateDefaults(
  record: TransitionRecordContext | null,
  kind: "party" | "account" | "contact"
) {
  const accountNameEn = (
    record?.companyName ||
    record?.accountDisplayName ||
    record?.partyDisplayName ||
    record?.title ||
    ""
  ).trim();
  const contactNameEn = (
    record?.fullName ||
    [record?.firstName, record?.lastName].filter(Boolean).join(" ") ||
    record?.contactDisplayName ||
    record?.primaryContactName ||
    ""
  ).trim();
  const email = (
    record?.email ||
    (record?.leadPhoneOrEmail?.includes("@") ? record.leadPhoneOrEmail : "") ||
    ""
  ).trim();
  const phone = (
    record?.phone ||
    (record?.leadPhoneOrEmail && !record.leadPhoneOrEmail.includes("@")
      ? record.leadPhoneOrEmail
      : "") ||
    ""
  ).trim();

  return {
    nameEn: (kind === "contact" ? contactNameEn : accountNameEn || contactNameEn) || undefined,
    accountNameEn: accountNameEn || undefined,
    contactNameEn: contactNameEn || undefined,
    email: email || undefined,
    phone: phone || undefined,
    jobTitle: record?.jobTitle?.trim() || undefined,
  };
}
