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
  solutionFitConfirmed?: boolean | null;
  primaryContactRole?: string | null;
  qualificationNotes?: string | null;
}

/** Form values captured by CrmWorkflowTransitionDialog. */
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
  solutionFitConfirmed?: boolean;
  primaryContactRole?: string;
  qualificationNotes?: string;
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

/** Canonical buying committee stakeholder role options. */
export const STAKEHOLDER_ROLES = [
  { value: "Decision Maker", labelKey: "crm.transitionDialog.roleDecisionMaker" },
  { value: "Executive Sponsor", labelKey: "crm.transitionDialog.roleExecutiveSponsor" },
  { value: "Technical Evaluator", labelKey: "crm.transitionDialog.roleTechnicalEvaluator" },
  { value: "Procurement / Commercial", labelKey: "crm.transitionDialog.roleProcurementCommercial" },
  { value: "Champion", labelKey: "crm.transitionDialog.roleChampion" },
];

/** Normalized boolean requirements computed strictly from evaluated transition rules. */
export interface TransitionDialogFlags {
  isDone: boolean;
  requiresReopenReason: boolean;
  requiresCloseNotes: boolean;
  requiresLossReason: boolean;
  requiresParty: boolean;
  requiresFinance: boolean;
  isLeadConvert: boolean;
  needsSolutionFit: boolean;
  requireSolutionFit: boolean;
  needsPrimaryContactRole: boolean;
  requirePrimaryContactRole: boolean;
  needsQualificationNotes: boolean;
  requireQualificationNotes: boolean;
  requiresReasonPrompt: boolean;
}

/** Derives required and prompted dialog sections dynamically from `evalResult`. */
export function deriveTransitionDialogFlags(
  evalResult: EvaluatedWorkflowTransition | null | undefined,
  record: TransitionRecordContext | null,
  entityType: "deal" | "lead"
): TransitionDialogFlags {
  const reqFields = new Set(evalResult?.requiredFields ?? []);
  const promptFields = new Set(evalResult?.promptFields ?? []);
  const allFields = new Set([...reqFields, ...promptFields]);
  const isDone = evalResult?.targetStage?.category === "done";
  const requiresReopenReason = Boolean(evalResult?.requiresReopenReason || allFields.has("reopenReason"));
  const requiresCloseNotes = Boolean(
    (evalResult?.requiresCloseNotes && !requiresReopenReason) || allFields.has("closeNotes")
  );
  const requiresLossReason = Boolean(
    evalResult?.requiresLossReason ||
      allFields.has("lossReasonCode") ||
      allFields.has("disqualificationReasonCode")
  );
  const requiresParty = Boolean(
    (evalResult?.requiresVerifiedParty || allFields.has("partyId")) &&
      !record?.partyId &&
      !record?.organizationPartyId &&
      !record?.personPartyId
  );
  const requiresFinance = Boolean(
    evalResult?.requiresFinancialForecast ||
      allFields.has("estimatedAmount") ||
      allFields.has("targetCloseDate")
  );
  const isLeadConvert = Boolean(
    entityType === "lead" &&
      (evalResult?.shouldTriggerDealConversion || evalResult?.triggerDealConversion)
  );
  const needsSolutionFit = Boolean(allFields.has("solutionFitConfirmed") && !record?.solutionFitConfirmed);
  const requireSolutionFit = Boolean(needsSolutionFit && reqFields.has("solutionFitConfirmed"));
  const needsPrimaryContactRole = Boolean(allFields.has("primaryContactRole") && !record?.primaryContactRole);
  const requirePrimaryContactRole = Boolean(needsPrimaryContactRole && reqFields.has("primaryContactRole"));
  const needsQualificationNotes = Boolean(allFields.has("qualificationNotes") && !record?.qualificationNotes);
  const requireQualificationNotes = Boolean(needsQualificationNotes && reqFields.has("qualificationNotes"));
  const requiresReasonPrompt = Boolean(
    (evalResult?.promptForComment && !requiresReopenReason && !requiresCloseNotes) ||
      (allFields.has("reason") && !requiresReopenReason)
  );
  return {
    isDone,
    requiresReopenReason,
    requiresCloseNotes,
    requiresLossReason,
    requiresParty,
    requiresFinance,
    isLeadConvert,
    needsSolutionFit,
    requireSolutionFit,
    needsPrimaryContactRole,
    requirePrimaryContactRole,
    needsQualificationNotes,
    requireQualificationNotes,
    requiresReasonPrompt,
  };
}

export interface BuildTransitionSchemaParams {
  flags: TransitionDialogFlags;
  entityType: "deal" | "lead";
  t: (key: string, params?: Record<string, string | number>) => string;
}

export function buildTransitionSchema(params: BuildTransitionSchemaParams): z.ZodType<CrmWorkflowTransitionFormData> {
  const { flags, entityType, t } = params;
  return z
    .object({
      transitionId: z.string().optional(),
      partyId: flags.requiresParty ? z.string().min(1, t("crm.transitionDialog.partyLabel")) : z.string().optional(),
      estimatedAmount: flags.requiresFinance ? z.coerce.number().positive() : z.coerce.number().optional(),
      actualAmount: z.coerce.number().optional(),
      targetCloseDate: z.string().optional(),
      closeNotes: flags.requiresCloseNotes ? z.string().min(1, t("crm.transitionDialog.closeNotesLabel")) : z.string().optional(),
      lossReasonCode: flags.requiresLossReason && entityType === "deal" ? z.string().min(1) : z.string().optional(),
      competitorName: z.string().optional(),
      disqualificationReasonCode: flags.requiresLossReason && entityType === "lead" ? z.string().min(1) : z.string().optional(),
      reopenReason: flags.requiresReopenReason ? z.string().min(1, t("crm.transitionDialog.reopenReasonLabel")) : z.string().optional(),
      reason: flags.requiresReasonPrompt ? z.string().min(1, t("crm.transitionDialog.reasonLabel")) : z.string().optional(),
      auditNote: z.string().optional(),
      convertDealTitle: flags.isLeadConvert ? z.string().min(1, t("crm.transitionDialog.convertDealTitleLabel")) : z.string().optional(),
      solutionFitConfirmed: flags.requireSolutionFit
        ? z.boolean().refine((v) => v === true, t("crm.transitionDialog.solutionFitConfirmedRequired"))
        : z.boolean().optional(),
      primaryContactRole: flags.requirePrimaryContactRole
        ? z.string().min(1, t("crm.transitionDialog.primaryContactRoleRequired"))
        : z.string().optional(),
      qualificationNotes: flags.requireQualificationNotes
        ? z.string().min(1, t("crm.transitionDialog.qualificationNotesRequired"))
        : z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (flags.requiresLossReason && entityType === "deal" && data.lossReasonCode === "COMPETITOR" && !data.competitorName?.trim()) {
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
    solutionFitConfirmed: Boolean(record?.solutionFitConfirmed),
    primaryContactRole: record?.primaryContactRole || "",
    qualificationNotes: record?.qualificationNotes || "",
  };
}
