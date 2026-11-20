"use client";

import type { CrmCustomFieldDefinition } from "@modules/crm/shared";
import type { EvaluatedWorkflowTransition } from "../../domain/constants/crmWorkflowRuleCatalogAndEval";
import type {
  CrmTransitionCustomFieldValueType,
  CrmWorkflowTransitionCustomFieldSpec,
  TransitionDialogFlags,
  TransitionRecordContext,
} from "../components/transition/crmTransitionTypes";

function prettifyFieldKey(rawKey: string): string {
  const clean = rawKey.replace(/^custom:/, "");
  return clean
    .split(/[_.-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function mapStoreValueType(valueType: string | undefined): CrmTransitionCustomFieldValueType {
  switch (valueType) {
    case "Number":
    case "Currency":
    case "Date":
    case "Boolean":
    case "Select":
    case "EntityReference":
    case "UserReference":
      return valueType;
    default:
      return "Text";
  }
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
      allFields.has("targetCloseDate") ||
      allFields.has("expectedCloseDate")
  );
  const isLeadConvert = Boolean(
    entityType === "lead" &&
      (evalResult?.shouldTriggerDealConversion || evalResult?.triggerDealConversion)
  );
  const needsContactId = Boolean(allFields.has("contactId") && !record?.contactId);
  const requireContactId = Boolean(needsContactId && reqFields.has("contactId"));
  const needsAccountId = Boolean(allFields.has("accountId") && !record?.accountId);
  const requireAccountId = Boolean(needsAccountId && reqFields.has("accountId"));
  const needsOwnerUserId = Boolean(allFields.has("ownerUserId") && !record?.ownerUserId);
  const requireOwnerUserId = Boolean(needsOwnerUserId && reqFields.has("ownerUserId"));
  const needsDiscountPercent = Boolean(allFields.has("discountPercent"));
  const requireDiscountPercent = Boolean(needsDiscountPercent && reqFields.has("discountPercent"));
  const needsNextStepSummary = Boolean(allFields.has("nextStepSummary"));
  const requireNextStepSummary = Boolean(needsNextStepSummary && reqFields.has("nextStepSummary"));
  const needsLeadPhoneOrEmail = Boolean(
    entityType === "lead" && allFields.has("leadPhoneOrEmail") && !record?.leadPhoneOrEmail
  );
  const requireLeadPhoneOrEmail = Boolean(needsLeadPhoneOrEmail && reqFields.has("leadPhoneOrEmail"));
  const needsLeadSourceChannel = Boolean(
    entityType === "lead" &&
      (allFields.has("leadSourceChannel") || allFields.has("leadSource")) &&
      !record?.leadSourceChannel
  );
  const requireLeadSourceChannel = Boolean(
    needsLeadSourceChannel && (reqFields.has("leadSourceChannel") || reqFields.has("leadSource"))
  );
  const needsLeadBantNotes = Boolean(
    entityType === "lead" && allFields.has("leadBantNotes") && !record?.leadBantNotes
  );
  const requireLeadBantNotes = Boolean(needsLeadBantNotes && reqFields.has("leadBantNotes"));
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
    needsContactId,
    requireContactId,
    needsAccountId,
    requireAccountId,
    needsOwnerUserId,
    requireOwnerUserId,
    needsDiscountPercent,
    requireDiscountPercent,
    needsNextStepSummary,
    requireNextStepSummary,
    needsLeadPhoneOrEmail,
    requireLeadPhoneOrEmail,
    needsLeadSourceChannel,
    requireLeadSourceChannel,
    needsLeadBantNotes,
    requireLeadBantNotes,
    needsSolutionFit,
    requireSolutionFit,
    needsPrimaryContactRole,
    requirePrimaryContactRole,
    needsQualificationNotes,
    requireQualificationNotes,
    requiresReasonPrompt,
  };
}

/**
 * Merges transition `custom:*` rule keys with tenant Custom Fields Studio definitions
 * bound to the target entity/stage so all custom gates render with proper widgets.
 */
export function resolveTransitionCustomFields(
  evalResult: EvaluatedWorkflowTransition | null | undefined,
  storeFields: CrmCustomFieldDefinition[],
  entityType: "deal" | "lead",
  toStageKey: string,
  extraCatalog: CrmWorkflowTransitionCustomFieldSpec[] = []
): CrmWorkflowTransitionCustomFieldSpec[] {
  const targetEntityType = entityType === "deal" ? "crm.opportunity" : "crm.lead";
  const reqSet = new Set(evalResult?.requiredFields ?? []);
  const promptSet = new Set(evalResult?.promptFields ?? []);
  const byKey = new Map<string, CrmWorkflowTransitionCustomFieldSpec>();

  for (const extra of extraCatalog) {
    byKey.set(extra.key, extra);
  }

  for (const cf of storeFields) {
    if (cf.entityTypeKey !== targetEntityType) continue;
    const rawKey = `custom:${cf.key}`;
    const inRule = reqSet.has(rawKey) || promptSet.has(rawKey) || reqSet.has(cf.key) || promptSet.has(cf.key);
    const boundToStage = Boolean(cf.defaultStageGateKey && cf.defaultStageGateKey === toStageKey);
    if (!inRule && !boundToStage) continue;
    byKey.set(cf.key, {
      key: cf.key,
      labelEn: cf.labelEn,
      labelAr: cf.labelAr,
      valueType: mapStoreValueType(cf.valueType),
      isRequired: Boolean(reqSet.has(rawKey) || reqSet.has(cf.key) || (boundToStage && cf.isRequired)),
      options: cf.options,
    });
  }

  for (const rawKey of [...reqSet, ...promptSet]) {
    if (!rawKey.startsWith("custom:")) continue;
    const key = rawKey.slice("custom:".length);
    if (!key || byKey.has(key)) continue;
    const matchedStore = storeFields.find((f) => f.key === key && f.entityTypeKey === targetEntityType);
    byKey.set(key, {
      key,
      labelEn: matchedStore?.labelEn || prettifyFieldKey(key),
      labelAr: matchedStore?.labelAr,
      valueType: mapStoreValueType(matchedStore?.valueType),
      isRequired: reqSet.has(rawKey),
      options: matchedStore?.options,
    });
  }

  return Array.from(byKey.values());
}
