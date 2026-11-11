import { z } from "zod";
import type { EvaluatedWorkflowTransition } from "../../domain/constants/crmWorkflowRuleCatalogAndEval";

export interface TransitionRecordContext {
  id: string;
  title?: string;
  partyId?: string | null;
  accountId?: string | null;
  organizationPartyId?: string | null;
  personPartyId?: string | null;
  estimatedAmount?: number | null;
  estimatedValue?: number | null;
  currency?: string;
  currencyCode?: string;
  targetCloseDate?: string | null;
  rowVersion?: string;
  customFields?: Record<string, unknown>;
}

export interface CrmWorkflowTransitionFormData {
  transitionId?: string;
  partyId?: string;
  estimatedAmount?: number;
  actualAmount?: number;
  targetCloseDate?: string;
  closeNotes?: string;
  lossReasonCode?: string;
  competitorName?: string;
  disqualificationReasonCode?: string;
  reopenReason?: string;
  reason?: string;
  auditNote?: string;
  convertDealTitle?: string;
}

export interface CrmWorkflowTransitionSubmitPayload {
  entityId: string;
  targetStageKey: string;
  transitionId?: string;
  reason?: string;
  auditNote?: string;
  partyId?: string;
  accountId?: string;
  estimatedAmount?: number;
  actualAmount?: number;
  targetCloseDate?: string;
  closeNotes?: string;
  lossReasonCode?: string;
  competitorName?: string;
  winReasonCode?: string;
  disqualificationReasonCode?: string;
  reopenReason?: string;
  convertDealTitle?: string;
  targetDealPipelineId?: string;
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
  evalResult?: EvaluatedWorkflowTransition | null;
  onSubmit: (data: CrmWorkflowTransitionSubmitPayload) => Promise<boolean | void>;
  isSubmitting?: boolean;
}

export const LOSS_REASONS = [
  { code: "PRICE", labelKey: "crm.transitionDialog.lossReasonPrice" },
  { code: "COMPETITOR", labelKey: "crm.transitionDialog.lossReasonCompetitor" },
  { code: "TIMING", labelKey: "crm.transitionDialog.lossReasonTiming" },
  { code: "AUTHORITY", labelKey: "crm.transitionDialog.lossReasonAuthority" },
  { code: "FEATURE_GAP", labelKey: "crm.transitionDialog.lossReasonFeatureGap" },
  { code: "OTHER", labelKey: "crm.transitionDialog.lossReasonOther" },
];

export const DISQUALIFICATION_REASONS = [
  { code: "BUDGET", labelKey: "crm.transitionDialog.disqualificationBudget" },
  { code: "NO_AUTHORITY", labelKey: "crm.transitionDialog.disqualificationNoAuthority" },
  { code: "NO_NEED", labelKey: "crm.transitionDialog.disqualificationNoNeed" },
  { code: "TIMING", labelKey: "crm.transitionDialog.disqualificationTiming" },
  { code: "FAKE_CONTACT", labelKey: "crm.transitionDialog.disqualificationFakeContact" },
  { code: "OTHER", labelKey: "crm.transitionDialog.disqualificationOther" },
];

export interface BuildTransitionSchemaParams {
  requiresParty: boolean;
  requiresFinance: boolean;
  isDone: boolean;
  isLost: boolean;
  isReopen: boolean;
  isLeadConvert: boolean;
  entityType: "deal" | "lead";
  evalResult?: EvaluatedWorkflowTransition | null;
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function buildTransitionSchema(params: BuildTransitionSchemaParams): z.ZodType<CrmWorkflowTransitionFormData> {
  const { requiresParty, requiresFinance, isDone, isLost, isReopen, isLeadConvert, entityType, evalResult, t } = params;
  return z
    .object({
      transitionId: z.string().optional(),
      partyId: requiresParty ? z.string().min(1, t("crm.transitionDialog.partyLabel")) : z.string().optional(),
      estimatedAmount: requiresFinance ? z.coerce.number().positive() : z.coerce.number().optional(),
      actualAmount: z.coerce.number().optional(),
      targetCloseDate: z.string().optional(),
      closeNotes: isDone || isLost ? z.string().min(1, t("crm.transitionDialog.closeNotesLabel")) : z.string().optional(),
      lossReasonCode: isLost && entityType === "deal" ? z.string().min(1) : z.string().optional(),
      competitorName: z.string().optional(),
      disqualificationReasonCode: isLost && entityType === "lead" ? z.string().min(1) : z.string().optional(),
      reopenReason: isReopen ? z.string().min(1, t("crm.transitionDialog.reopenReasonLabel")) : z.string().optional(),
      reason: evalResult?.promptForComment && !isReopen && !isLost && !isDone ? z.string().min(1) : z.string().optional(),
      auditNote: z.string().optional(),
      convertDealTitle: isLeadConvert ? z.string().min(1, t("crm.transitionDialog.convertDealTitleLabel")) : z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (isLost && entityType === "deal" && data.lossReasonCode === "COMPETITOR" && !data.competitorName?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["competitorName"],
          message: t("crm.transitionDialog.competitorNameRequired", {
            defaultValue: "Competitor name is required when lost to competitor",
          }),
        });
      }
    });
}

export function getDefaultTransitionValues(record: TransitionRecordContext | null): Partial<CrmWorkflowTransitionFormData> {
  return {
    partyId: record?.partyId || record?.organizationPartyId || record?.personPartyId || "",
    estimatedAmount: record?.estimatedAmount || record?.estimatedValue || undefined,
    actualAmount: record?.estimatedAmount || record?.estimatedValue || undefined,
    targetCloseDate: record?.targetCloseDate || "",
    closeNotes: "",
    lossReasonCode: "PRICE",
    competitorName: "",
    disqualificationReasonCode: "BUDGET",
    reopenReason: "",
    reason: "",
    auditNote: "",
    convertDealTitle: record?.title ? `${record.title} - Opportunity` : "",
  };
}
