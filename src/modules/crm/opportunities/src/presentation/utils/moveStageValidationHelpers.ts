import { encodeCustomFieldName } from "@core/crud/customFieldsExtension";
import type { CrmCustomFieldDefinition } from "@modules/crm";
import { CANONICAL_KANBAN_STAGES } from "../../domain/constants/crmCanonicalStages";
import type { PipelineStageConfig } from "../../domain/entities/OpportunityEntity";

export function buildMoveStageCustomFieldConfigs(
  rawOppCf: any[],
  storeCustomFields: CrmCustomFieldDefinition[],
  isRtl: boolean
) {
  return [
    ...rawOppCf,
    ...storeCustomFields
      .filter((f) => f.entityTypeKey === "crm.opportunity" && !rawOppCf.some((r) => r.name === encodeCustomFieldName(f.key) || r.name === f.key))
      .map((f) => ({
        name: encodeCustomFieldName(f.key),
        label: isRtl && f.labelAr ? f.labelAr : f.labelEn,
        type: (f.valueType === "Number" || f.valueType === "Currency" ? "number" : f.valueType === "Date" ? "date" : f.valueType === "Boolean" ? "checkbox" : "text") as any,
        required: f.isRequired,
        defaultValue: undefined,
      })),
  ];
}

export function resolveMoveStageOptions(sourceStages: PipelineStageConfig[]) {
  if (sourceStages.length > 0) {
    return [...sourceStages]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((s) => ({
        key: s.stageKey,
        order: s.sortOrder,
        labelEn: s.labelEn,
        labelAr: s.labelAr || s.labelEn,
        partyRequired:
          s.requiresVerifiedParty ||
          Boolean(s.requiredExitFields?.includes("partyId")) ||
          s.stageKey === "default.proposal" ||
          s.stageKey === "default.negotiation",
        requiredExitFields: s.requiredExitFields ?? [],
      }));
  }
  return CANONICAL_KANBAN_STAGES.map((s) => ({
    key: s.key,
    order: s.sortOrder,
    labelEn: s.defaultLabelEn,
    labelAr: s.labelAr || s.defaultLabelEn,
    partyRequired: Boolean(s.requiresParty),
    requiredExitFields: [] as string[],
  }));
}

export interface ValidateMoveStageParams {
  t: (key: string, params?: Record<string, string | number>) => string;
  isRtl: boolean;
  currentStageKey: string;
  targetStageKey: string;
  evalAllowed: boolean;
  evalReason?: string | null;
  lacksParty: boolean;
  estimatedAmount: string;
  needsAmountInput: boolean;
  needsCloseDateInput: boolean;
  targetCloseDate: string;
  needsContactRoleInput: boolean;
  primaryContactRole: string;
  needsSolutionFitInput: boolean;
  solutionFitConfirmed: boolean;
  needsContactIdInput: boolean;
  selectedContactId: string;
  needsAccountIdInput: boolean;
  selectedAccountId: string;
  needsOwnerUserIdInput: boolean;
  selectedOwnerUserId: string;
  needsDiscountPercentInput: boolean;
  discountPercent: string;
  needsNextStepInput: boolean;
  nextStepSummary: string;
  requiredCustomFieldKeys: string[];
  storeCustomFields: CrmCustomFieldDefinition[];
  customFieldValues: Record<string, unknown>;
  isAdjacentForward: boolean;
  reason: string;
}

/** Validates MoveStageDialog submission with localized messages and gate enforcement. */
export function validateMoveStageSubmission(p: ValidateMoveStageParams): string | null {
  const { t, isRtl } = p;
  if (p.targetStageKey === p.currentStageKey) return t("crmOpportunities.dialogs.stage.errSameStage");
  if (!p.evalAllowed) return p.evalReason || t("crmOpportunities.dialogs.stage.errRestrictedTransition");
  if (p.lacksParty) return t("crmOpportunities.dialogs.stage.partyNotice");
  if (p.estimatedAmount !== "" && (!Number.isFinite(Number(p.estimatedAmount)) || Number(p.estimatedAmount) < 0)) {
    return t("crmOpportunities.dialogs.stage.errNegativeAmount");
  }
  if (p.needsAmountInput && (!p.estimatedAmount || Number(p.estimatedAmount) <= 0)) {
    return t("crmOpportunities.dialogs.stage.errAmountRequired");
  }
  if (p.needsCloseDateInput && !p.targetCloseDate) return t("crmOpportunities.dialogs.stage.errCloseDateRequired");
  if (p.needsContactRoleInput && !p.primaryContactRole) return t("crmOpportunities.dialogs.stage.errContactRoleRequired");
  if (p.needsSolutionFitInput && !p.solutionFitConfirmed) return t("crmOpportunities.dialogs.stage.errSolutionFitRequired");
  if (p.needsContactIdInput && !p.selectedContactId.trim()) return t("crmOpportunities.dialogs.stage.errContactRequired");
  if (p.needsAccountIdInput && !p.selectedAccountId.trim()) return t("crmOpportunities.dialogs.stage.errAccountRequired");
  if (p.needsOwnerUserIdInput && !p.selectedOwnerUserId.trim()) return t("crmOpportunities.dialogs.stage.errOwnerRequired");
  if (p.discountPercent !== "") {
    const disc = Number(p.discountPercent);
    if (!Number.isFinite(disc) || disc < 0 || disc > 100) return t("crmOpportunities.dialogs.stage.errDiscountRange");
  } else if (p.needsDiscountPercentInput) {
    return t("crmOpportunities.dialogs.stage.errDiscountRange");
  }
  if (p.needsNextStepInput && !p.nextStepSummary.trim()) return t("crmOpportunities.dialogs.stage.errNextStepRequired");

  for (const cfKey of p.requiredCustomFieldKeys) {
    const def = p.storeCustomFields.find((f) => f.key === cfKey);
    const fieldName = (isRtl && def?.labelAr ? def.labelAr : def?.labelEn) || cfKey;
    const val = p.customFieldValues[encodeCustomFieldName(cfKey)] ?? p.customFieldValues[cfKey];
    if (def?.valueType === "Boolean") {
      if (val !== true && val !== "true") {
        return t("crmOpportunities.dialogs.stage.errCustomBoolRequired", { field: fieldName });
      }
    } else if (def?.valueType === "Number" || def?.valueType === "Currency") {
      if (val === undefined || val === null || String(val).trim() === "" || !Number.isFinite(Number(val))) {
        return t("crmOpportunities.dialogs.stage.errCustomNumberRequired", { field: fieldName });
      }
    } else if (val === undefined || val === null || String(val).trim() === "") {
      return t("crmOpportunities.dialogs.stage.errCustomTextRequired", { field: fieldName });
    }
  }

  if (!p.isAdjacentForward && (!p.reason.trim() || p.reason.trim().length < 5)) {
    return t("crmOpportunities.dialogs.stage.errReasonMinLength");
  }
  return null;
}

/** Computes which workflow exit fields and custom field gates are required for MoveStageDialog. */
export function computeMoveStageGateFlags(
  opportunity: { stageKey: string; partyId?: string | null },
  targetStageKey: string,
  effectiveStages: Array<{ key: string; partyRequired?: boolean; requiredExitFields?: string[] }>,
  evalTransition: { requiredFields?: string[]; matchedTransition?: { rules?: { requireVerifiedParty?: boolean } }; promptForComment?: boolean } | null,
  storeCustomFields: Array<{ entityTypeKey: string; key: string; defaultStageGateKey?: string }>
) {
  const currentStageIndex = effectiveStages.findIndex((s) => s.key === opportunity.stageKey);
  const targetStageIndex = effectiveStages.findIndex((s) => s.key === targetStageKey);
  const targetStageConfig = effectiveStages[targetStageIndex];
  const isForward = targetStageIndex > currentStageIndex;
  const isAdjacentForward = targetStageIndex === currentStageIndex + 1 && !evalTransition?.promptForComment;
  const isTargetProposalOrLater =
    targetStageConfig?.partyRequired ||
    Boolean(evalTransition?.matchedTransition?.rules?.requireVerifiedParty) ||
    targetStageKey === "default.proposal" ||
    targetStageKey === "default.negotiation";
  const stageExitFields = isForward
    ? Array.from(new Set(effectiveStages.slice(Math.max(0, currentStageIndex), targetStageIndex).flatMap((s) => s.requiredExitFields ?? [])))
    : [];
  const exitFields = Array.from(new Set([...stageExitFields, ...(evalTransition?.requiredFields ?? [])]));
  const requiredCustomFieldKeys = Array.from(
    new Set([
      ...exitFields.filter((f) => f.startsWith("custom:")).map((f) => f.slice("custom:".length)),
      ...storeCustomFields
        .filter((f) => f.entityTypeKey === "crm.opportunity" && Boolean(f.defaultStageGateKey) && (f.defaultStageGateKey === opportunity.stageKey || f.defaultStageGateKey === targetStageKey))
        .map((f) => f.key),
    ])
  );
  return {
    isAdjacentForward,
    needsPartyInput: (isTargetProposalOrLater || exitFields.includes("partyId")) && !opportunity.partyId,
    isTargetProposalOrLater,
    exitFields,
    requiredCustomFieldKeys,
    needsAmountInput: exitFields.includes("estimatedAmount"),
    needsCloseDateInput: exitFields.includes("targetCloseDate"),
    needsContactRoleInput: exitFields.includes("primaryContactRole"),
    needsSolutionFitInput: exitFields.includes("solutionFitConfirmed"),
    needsContactIdInput: exitFields.includes("contactId"),
    needsAccountIdInput: exitFields.includes("accountId"),
    needsOwnerUserIdInput: exitFields.includes("ownerUserId"),
    needsDiscountPercentInput: exitFields.includes("discountPercent"),
    needsNextStepInput: exitFields.includes("nextStepSummary"),
  };
}
