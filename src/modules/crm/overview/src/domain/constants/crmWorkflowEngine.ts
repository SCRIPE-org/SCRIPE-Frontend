import { en as crmOverviewEn } from "../../../locales/crm-overview.en";
import { ar as crmOverviewAr } from "../../../locales/crm-overview.ar";
import {
  type CrmWorkflowDefinition,
  type EvaluatedWorkflowTransition,
  normalizeStageKeyForMatch,
} from "./crmWorkflowRuleCatalogAndEval";
import {
  evaluateFieldValueRuleConfig,
  evaluateRolesPermissionsTokens,
  isTargetCloseDateFutureOrToday,
} from "./crmWorkflowRuleEvalHelpers";

import {
  formatEngineText,
  isFieldSatisfiedOnRecord,
  type RecordTransitionContext,
  resolveWorkflowTransitionMatch,
} from "./crmWorkflowTransitionContext";

export { isFieldSatisfiedOnRecord, type RecordTransitionContext };

export function evaluateWorkflowTransition(
  wf: CrmWorkflowDefinition,
  fromStageKey: string,
  toStageKey: string,
  recordContext?: RecordTransitionContext
): EvaluatedWorkflowTransition {
  const normFrom = normalizeStageKeyForMatch(fromStageKey);
  const normTo = normalizeStageKeyForMatch(toStageKey);
  const isAr = recordContext?.locale === "ar";
  const wfDict = (isAr ? crmOverviewAr : crmOverviewEn).crm.workflowEngine;
  const fromStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normFrom);
  const toStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normTo);
  const isBackward = Boolean(fromStage && toStage && toStage.sortOrder < fromStage.sortOrder);
  const isReopen = Boolean(
    fromStage && toStage &&
    (fromStage.category === "done" || fromStage.category === "lost") &&
    (toStage.category === "todo" || toStage.category === "in_progress")
  );
  const { matched, matchedTransitions } = resolveWorkflowTransitionMatch(wf, fromStageKey, normFrom, normTo, toStage);

  const fromLabel = isAr ? (fromStage?.labelAr || fromStage?.labelEn || fromStageKey) : (fromStage?.labelEn || fromStageKey);
  const toLabel = isAr ? (toStage?.labelAr || toStage?.labelEn || toStageKey) : (toStage?.labelEn || toStageKey);
  const wfName = isAr ? (wf.nameAr || wf.nameEn) : wf.nameEn;

  const block = (
    msg: string, requiredFields: string[] = [], approvalRequirement?: EvaluatedWorkflowTransition["approvalRequirement"]
  ): EvaluatedWorkflowTransition => ({
    allowed: false, status: "blocked", reason: msg, reasonIfBlocked: msg, actionLabel: wfDict.blockedLabel,
    matchedTransition: matched, matchedTransitions, targetStage: toStage, shouldTriggerDealConversion: false,
    triggerDealConversion: false, requiredFields, promptForComment: false, isBackward, approvalRequirement, requiresScreen: false,
  });

  if (!matched) {
    return block(formatEngineText(wfDict.noTransitionConfigured, { from: fromLabel, to: toLabel, workflow: wfName }));
  }

  const isExplicitBackward =
    matched.direction === "backward" ||
    (isBackward &&
      matched.direction !== "global" &&
      matched.fromStageKey !== "*" &&
      !matched.fromStageKeys?.includes("*") &&
      toStage?.category !== "lost" &&
      toStage?.category !== "done");
  if (isExplicitBackward && !matched.rules.allowRollback) {
    return block(formatEngineText(wfDict.rollbackRestricted, { from: fromLabel, to: toLabel, workflow: wfName }));
  }

  const catalogRules = matched.catalogRules ?? [];
  let approvalRequirement: EvaluatedWorkflowTransition["approvalRequirement"] = undefined;
  const dynamicPromptedFields: string[] = [];
  const trName = isAr ? (matched.nameAr || matched.nameEn) : matched.nameEn;

  for (const cRule of catalogRules) {
    if (cRule.ruleTypeKey === "restrict.api_only") {
      return block(formatEngineText(wfDict.apiOnlyRestricted, { transition: trName }));
    }
    if (cRule.ruleTypeKey === "restrict.approval_required") {
      const roles = (cRule.config?.principals || cRule.config?.approverRole || "role:sales_manager").split(",").map((s) => s.trim()).filter(Boolean);
      approvalRequirement = { required: true, roles, quorum: cRule.config?.quorum === "all" ? "all" : "any" };
      if (recordContext?.hasManagerApproval === false) {
        return block(formatEngineText(wfDict.approvalRequired, { transition: trName, roles: roles.join(", ") }), [], approvalRequirement);
      }
    }
    if (cRule.ruleTypeKey === "restrict.approval_matrix") {
      const t1Min = Number(cRule.config?.tier1MinAmount ?? 100000);
      const t1Roles = (cRule.config?.tier1Roles || "role:sales_manager").split(",").map((s) => s.trim()).filter(Boolean);
      const t2Min = Number(cRule.config?.tier2MinAmount ?? 500000);
      const t2Roles = (cRule.config?.tier2Roles || "role:commercial_director,role:finance_controller").split(",").map((s) => s.trim()).filter(Boolean);
      const amt = recordContext?.estimatedAmount ?? recordContext?.estimatedValue ?? t1Min;
      if (amt >= t2Min) approvalRequirement = { required: true, roles: t2Roles, quorum: cRule.config?.quorum === "any" ? "any" : "all", matchedTierLabel: `Tier 2 (>= ${t2Min.toLocaleString()})` };
      else if (amt >= t1Min) approvalRequirement = { required: true, roles: t1Roles, quorum: "any", matchedTierLabel: `Tier 1 (>= ${t1Min.toLocaleString()})` };
      if (approvalRequirement?.required && recordContext?.hasManagerApproval === false) {
        return block(formatEngineText(wfDict.approvalMatrixRequired, { transition: trName, tier: approvalRequirement.matchedTierLabel ?? "", roles: approvalRequirement.roles.join(", ") }), [], approvalRequirement);
      }
    }
    if (cRule.ruleTypeKey === "restrict.subtasks_completed" && recordContext?.hasOpenSubtasks === true) {
      return block(formatEngineText(wfDict.subtasksIncomplete, { transition: trName }));
    }
    if (cRule.ruleTypeKey === "restrict.separation_of_duties" && recordContext?.actorUserId && recordContext?.lastMovedByUserId && recordContext.actorUserId === recordContext.lastMovedByUserId) {
      return block(formatEngineText(wfDict.separationOfDuties, { transition: trName }));
    }
    if (cRule.ruleTypeKey === "restrict.prior_status" && cRule.config?.requiredStageKey && recordContext?.visitedStageKeys) {
      const reqNorm = normalizeStageKeyForMatch(cRule.config.requiredStageKey);
      if (!recordContext.visitedStageKeys.some((k) => normalizeStageKeyForMatch(k) === reqNorm)) {
        return block(formatEngineText(wfDict.priorStatusRequired, { transition: trName, stage: cRule.config.requiredStageKey }));
      }
    }
    if (cRule.ruleTypeKey === "restrict.field_value" && recordContext) {
      const fieldEval = evaluateFieldValueRuleConfig(cRule.config, recordContext);
      if (!fieldEval.passed) {
        return block(formatEngineText(wfDict.fieldConditionFailed, { field: fieldEval.field, operator: fieldEval.operator, expected: fieldEval.expected, transition: trName }));
      }
    }
    if (cRule.ruleTypeKey === "restrict.roles_permissions" && recordContext && (recordContext.permissions !== undefined || recordContext.userRoles !== undefined)) {
      const roleEval = evaluateRolesPermissionsTokens(cRule.config, recordContext);
      if (!roleEval.passed) {
        return block(formatEngineText(wfDict.roleOrPermissionRequired, { transition: trName, requirements: roleEval.requirements }));
      }
    }
    if (cRule.ruleTypeKey === "input.prompt_fields" && cRule.config?.fields) {
      dynamicPromptedFields.push(...cRule.config.fields.split(",").map((s) => s.trim()).filter(Boolean));
    }
    if (cRule.ruleTypeKey === "validate.active_quote" && recordContext) {
      const hasQuote = Boolean(
        recordContext.hasActiveQuote ||
        recordContext.quoteId ||
        recordContext.fields?.quoteId ||
        recordContext.customFields?.quoteId
      );
      if (!hasQuote) {
        return block(formatEngineText(wfDict.activeQuoteRequired, { transition: trName }), ["activeQuote"]);
      }
    }
    if (cRule.ruleTypeKey === "validate.buying_committee_role") {
      dynamicPromptedFields.push("primaryContactRole");
      if (recordContext?.contactRoles) {
        const reqRole = (cRule.config?.requiredRoles || cRule.config?.requiredRole || cRule.config?.role || "DecisionMaker").split(",")[0].trim();
        if (!recordContext.contactRoles.includes(reqRole)) {
          return block(formatEngineText(wfDict.buyingCommitteeRequired, { role: reqRole, transition: trName }), [`contactRole:${reqRole}`]);
        }
      }
    }
  }

  if (matched.rules.requiredPermission && recordContext?.permissions !== undefined) {
    const reqPerm = matched.rules.requiredPermission;
    if (!recordContext.permissions.includes("*") && !recordContext.permissions.includes(reqPerm)) {
      return block(formatEngineText(wfDict.roleOrPermissionRequired, { transition: trName, requirements: reqPerm }));
    }
  }

  const forecastRule = catalogRules.find((r) => r.ruleTypeKey === "validate.financial_forecast");
  const forecastMinAmount = Number(forecastRule?.config?.minAmount ?? 0);
  const requiresParty = Boolean(matched.rules.requireVerifiedParty || toStage?.requiresVerifiedParty || catalogRules.some((r) => r.ruleTypeKey === "validate.verified_party"));
  const hasFinancialAmountRule = Boolean(matched.rules.requireEstimatedAmountPositive || matched.rules.requireEstimatedAmount || forecastRule);
  const hasTargetCloseDateRule = Boolean(matched.rules.requireTargetCloseDate || forecastRule);

  const isMovingForwardToActive = !isBackward && toStage?.category !== "lost";
  const candidateExitFields = isMovingForwardToActive ? fromStage?.requiredExitFields ?? [] : [];

  const rawRequiredFields = Array.from(new Set([
    ...candidateExitFields, ...matched.rules.requiredFieldKeys,
    ...(requiresParty ? ["partyId"] : []),
    ...(hasFinancialAmountRule ? ["estimatedAmount"] : []),
    ...(hasTargetCloseDateRule ? ["targetCloseDate"] : []),
  ]));

  const unfulfilledFields = rawRequiredFields.filter((f) => {
    if (!isFieldSatisfiedOnRecord(f, recordContext)) return true;
    if (forecastRule && (f === "estimatedAmount" || f === "estimatedValue") && Number.isFinite(forecastMinAmount) && forecastMinAmount > 0) {
      const amt = recordContext?.estimatedAmount ?? recordContext?.estimatedValue ?? 0;
      return amt < forecastMinAmount;
    }
    if (forecastRule && (f === "targetCloseDate" || f === "expectedCloseDate") && recordContext?.targetCloseDate) {
      return !isTargetCloseDateFutureOrToday(recordContext.targetCloseDate);
    }
    return false;
  });
  const shouldConvert = Boolean(matched.rules.triggerDealConversion || catalogRules.some((r) => r.ruleTypeKey === "action.convert_lead_to_deal") || (!isBackward && toStage?.triggerDealConversion));
  const configuredFields = [...rawRequiredFields, ...(matched.rules.promptFields ?? []), ...dynamicPromptedFields];
  const requiresLossReasonRule = Boolean(
    configuredFields.some((f) => f === "lossReasonCode" || f === "disqualificationReasonCode") ||
    catalogRules.some((r) => r.ruleTypeKey === "input.capture_loss_reason")
  );
  const missingLossReason = requiresLossReasonRule && !isFieldSatisfiedOnRecord("lossReasonCode", recordContext);
  const hasPromptCommentRule = Boolean(matched.rules.promptForComment || catalogRules.some((r) => r.ruleTypeKey === "input.require_reason_and_note"));
  const requiresCloseNotesFlag = Boolean(
    hasPromptCommentRule ||
    rawRequiredFields.includes("closeNotes") ||
    (matched.rules.promptFields ?? []).includes("closeNotes") ||
    dynamicPromptedFields.includes("closeNotes")
  );
  const unsatisfiedPromptFields = (matched.rules.promptFields ?? []).concat(dynamicPromptedFields).filter((f) => !isFieldSatisfiedOnRecord(f, recordContext));
  const hasPromptFieldsRule = Boolean(unsatisfiedPromptFields.length > 0 || catalogRules.some((r) => r.ruleTypeKey === "input.prompt_fields") || missingLossReason);
  const hasMultipleParallelTransitions = matchedTransitions.length > 1;

  const requiresScreen = Boolean(
    unfulfilledFields.length > 0 || hasPromptCommentRule || hasPromptFieldsRule ||
    shouldConvert || missingLossReason || hasMultipleParallelTransitions
  );

  const status: "allowed_instant" | "allowed_screen_required" = requiresScreen ? "allowed_screen_required" : "allowed_instant";
  const actionLabel = status === "allowed_instant" ? wfDict.dropToMove : wfDict.opensTransitionScreen;
  const reason = status === "allowed_instant" ? wfDict.instantReason : wfDict.screenRequiredReason;

  return {
    allowed: true, status, requiresScreen, actionLabel, reason,
    matchedTransition: matched, matchedTransitions, targetStage: toStage,
    shouldTriggerDealConversion: shouldConvert, triggerDealConversion: shouldConvert,
    requiredFields: unfulfilledFields, missingFields: unfulfilledFields,
    promptFields: Array.from(new Set([...matched.rules.promptFields, ...dynamicPromptedFields])),
    promptForComment: hasPromptCommentRule, isBackward,
    requiresVerifiedParty: requiresParty && !isFieldSatisfiedOnRecord("partyId", recordContext),
    requiresLossReason: missingLossReason, requiresCloseNotes: requiresCloseNotesFlag,
    requiresReopenReason: isReopen && hasPromptCommentRule,
    requiresFinancialForecast: hasFinancialAmountRule || hasTargetCloseDateRule,
    domainEventKey: matched.domainEventKey ?? (shouldConvert ? "LeadConvertedEvent" : "GenericEvent"),
    postActions: catalogRules.filter((r) => r.category === "actions").map((r) => r.ruleTypeKey),
    approvalRequirement,
  };
}

export const evaluateCrmTransition = evaluateWorkflowTransition;
