"use client";

import { z } from "zod";
import type {
  CrmWorkflowTransitionCustomFieldSpec,
  CrmWorkflowTransitionFormData,
  CrmWorkflowTransitionSubmitPayload,
  TransitionDialogFlags,
  TransitionRecordContext,
} from "../components/transition/crmTransitionTypes";

/** Parameters required to dynamically construct the Zod schema for a workflow transition dialog. */
export interface BuildTransitionSchemaParams {
  flags: TransitionDialogFlags;
  entityType: "deal" | "lead";
  customFields?: CrmWorkflowTransitionCustomFieldSpec[];
  t: (key: string, params?: Record<string, string | number>) => string;
}

function toOptionalNumber(val: unknown): number | undefined {
  if (val === "" || val === null || val === undefined) return undefined;
  const num = Number(val);
  return Number.isNaN(num) ? undefined : num;
}

/** Builds Zod validation schema matching active stage transition gate requirements. */
export function buildTransitionSchema(
  params: BuildTransitionSchemaParams
): z.ZodType<CrmWorkflowTransitionFormData> {
  const { flags, entityType, customFields = [], t } = params;
  const discountErr = t("crm.transitionDialog.discountPercentRangeError", {
    defaultValue: "Discount must be between 0 and 100%",
  });
  const discountBase = z.number().min(0, discountErr).max(100, discountErr);

  return z
    .object({
      transitionId: z.string().optional(),
      partyId: flags.requiresParty
        ? z.string().min(1, t("crm.transitionDialog.partyLabel"))
        : z.string().optional(),
      contactId: flags.requireContactId
        ? z.string().min(1, t("crm.transitionDialog.contactRequired"))
        : z.string().optional(),
      accountId: flags.requireAccountId
        ? z.string().min(1, t("crm.transitionDialog.accountRequired"))
        : z.string().optional(),
      ownerUserId: flags.requireOwnerUserId
        ? z.string().min(1, t("crm.transitionDialog.ownerUserRequired"))
        : z.string().optional(),
      estimatedAmount: z.preprocess(
        toOptionalNumber,
        flags.requiresFinance ? z.number().positive() : z.number().optional()
      ) as z.ZodType<number | undefined>,
      actualAmount: z.preprocess(toOptionalNumber, z.number().optional()) as z.ZodType<number | undefined>,
      targetCloseDate: z.string().optional(),
      discountPercent: z.preprocess(
        toOptionalNumber,
        flags.requireDiscountPercent ? discountBase : discountBase.optional()
      ) as z.ZodType<number | undefined>,
      nextStepSummary: flags.requireNextStepSummary
        ? z.string().min(1, t("crm.transitionDialog.nextStepSummaryRequired"))
        : z.string().optional(),
      leadPhoneOrEmail: flags.requireLeadPhoneOrEmail
        ? z.string().min(1, t("crm.transitionDialog.leadPhoneOrEmailRequired"))
        : z.string().optional(),
      leadSourceChannel: flags.requireLeadSourceChannel
        ? z.string().min(1, t("crm.transitionDialog.leadSourceChannelRequired"))
        : z.string().optional(),
      leadBantNotes: flags.requireLeadBantNotes
        ? z.string().min(1, t("crm.transitionDialog.leadBantNotesRequired"))
        : z.string().optional(),
      closeNotes: flags.requiresCloseNotes
        ? z.string().min(1, t("crm.transitionDialog.closeNotesLabel"))
        : z.string().optional(),
      lossReasonCode: flags.requiresLossReason && entityType === "deal" ? z.string().min(1) : z.string().optional(),
      competitorName: z.string().optional(),
      disqualificationReasonCode:
        flags.requiresLossReason && entityType === "lead" ? z.string().min(1) : z.string().optional(),
      reopenReason: flags.requiresReopenReason
        ? z.string().min(1, t("crm.transitionDialog.reopenReasonLabel"))
        : z.string().optional(),
      reason: flags.requiresReasonPrompt
        ? z.string().min(1, t("crm.transitionDialog.reasonLabel"))
        : z.string().optional(),
      auditNote: z.string().optional(),
      convertDealTitle: flags.isLeadConvert
        ? z.string().min(1, t("crm.transitionDialog.convertDealTitleLabel"))
        : z.string().optional(),
      solutionFitConfirmed: flags.requireSolutionFit
        ? z.boolean().refine((v) => v === true, t("crm.transitionDialog.solutionFitConfirmedRequired"))
        : z.boolean().optional(),
      primaryContactRole: flags.requirePrimaryContactRole
        ? z.string().min(1, t("crm.transitionDialog.primaryContactRoleRequired"))
        : z.string().optional(),
      qualificationNotes: flags.requireQualificationNotes
        ? z.string().min(1, t("crm.transitionDialog.qualificationNotesRequired"))
        : z.string().optional(),
      customFields: z.record(z.string(), z.unknown()).optional(),
    })
    .superRefine((data, ctx) => {
      if (
        flags.requiresLossReason &&
        entityType === "deal" &&
        data.lossReasonCode === "COMPETITOR" &&
        !data.competitorName?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["competitorName"],
          message: t("crm.transitionDialog.competitorNameRequired", {
            defaultValue: "Competitor name is required when lost to competitor",
          }),
        });
      }
      for (const cf of customFields) {
        if (!cf.isRequired) continue;
        const val = data.customFields?.[cf.key];
        const isMissing =
          cf.valueType === "Boolean"
            ? val !== true
            : val === undefined || val === null || String(val).trim() === "";
        if (isMissing) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["customFields", cf.key],
            message: t("crm.transitionDialog.customFieldRequired", {
              defaultValue: "This custom field is required for this transition",
            }),
          });
        }
      }
    });
}

/** Computes fresh form defaults from the target record so previous card values never bleed over. */
export function getDefaultTransitionValues(
  record: TransitionRecordContext | null,
  customFields: CrmWorkflowTransitionCustomFieldSpec[] = []
): Partial<CrmWorkflowTransitionFormData> {
  const initialCustom: Record<string, string | number | boolean> = {};
  const sourceCustom = record?.customFields ?? {};
  for (const cf of customFields) {
    const existing = sourceCustom[cf.key] ?? sourceCustom[`custom:${cf.key}`];
    if (existing !== undefined && existing !== null) {
      initialCustom[cf.key] = existing as string | number | boolean;
    } else if (cf.valueType === "Boolean") {
      initialCustom[cf.key] = false;
    } else {
      initialCustom[cf.key] = "";
    }
  }

  return {
    partyId: record?.partyId || record?.organizationPartyId || record?.personPartyId || "",
    contactId: record?.contactId || "",
    accountId: record?.accountId || "",
    ownerUserId: record?.ownerUserId || "",
    estimatedAmount: record?.estimatedAmount ?? record?.estimatedValue ?? undefined,
    actualAmount: record?.estimatedAmount ?? record?.estimatedValue ?? undefined,
    targetCloseDate: record?.targetCloseDate || "",
    discountPercent: record?.discountPercent ?? undefined,
    nextStepSummary: record?.nextStepSummary || "",
    leadPhoneOrEmail: record?.leadPhoneOrEmail || "",
    leadSourceChannel: record?.leadSourceChannel || "",
    leadBantNotes: record?.leadBantNotes || "",
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
    customFields: initialCustom,
  };
}

/** Maps validated form state into API transition payload. */
export function buildTransitionSubmitPayload(args: {
  record: TransitionRecordContext;
  toStageKey: string;
  selectedTransitionId: string;
  flags: TransitionDialogFlags;
  data: CrmWorkflowTransitionFormData;
  hasCustomFields: boolean;
}): CrmWorkflowTransitionSubmitPayload {
  const { record, toStageKey, selectedTransitionId, flags, data, hasCustomFields } = args;
  return {
    entityId: record.id,
    targetStageKey: toStageKey,
    transitionId: selectedTransitionId || undefined,
    expectedRowVersion: record.rowVersion,
    partyId: data.partyId || undefined,
    accountId: data.accountId || undefined,
    contactId: data.contactId || undefined,
    ownerUserId: data.ownerUserId || undefined,
    estimatedAmount: data.estimatedAmount,
    actualAmount: data.actualAmount,
    targetCloseDate: data.targetCloseDate || undefined,
    discountPercent: data.discountPercent,
    nextStepSummary: data.nextStepSummary || undefined,
    leadPhoneOrEmail: data.leadPhoneOrEmail || undefined,
    leadSourceChannel: data.leadSourceChannel || undefined,
    leadBantNotes: data.leadBantNotes || undefined,
    closeNotes: data.closeNotes || undefined,
    lossReasonCode: data.lossReasonCode || undefined,
    competitorName: data.competitorName || undefined,
    disqualificationReasonCode: data.disqualificationReasonCode || undefined,
    reopenReason: data.reopenReason || undefined,
    reason: data.reason || data.reopenReason || undefined,
    auditNote: data.auditNote || undefined,
    convertDealTitle: data.convertDealTitle || undefined,
    solutionFitConfirmed: flags.needsSolutionFit ? Boolean(data.solutionFitConfirmed) : undefined,
    primaryContactRole: flags.needsPrimaryContactRole && data.primaryContactRole ? data.primaryContactRole : undefined,
    qualificationNotes: data.qualificationNotes || undefined,
    customFields: hasCustomFields ? data.customFields : undefined,
  };
}
