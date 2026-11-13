import {
  type CrmWorkflowDefinition,
  type EvaluatedWorkflowTransition,
  makeWorkflowTransition,
  normalizeStageKeyForMatch,
  transitionMatchesSourceStage,
} from "./crmWorkflowRuleCatalogAndEval";

export interface RecordTransitionContext {
  hasVerifiedParty?: boolean; partyId?: string | null; accountId?: string | null;
  estimatedAmount?: number | null; estimatedValue?: number | null; targetCloseDate?: string | null;
  lossReasonCode?: string | null; disqualificationReason?: string | null; hasOpenSubtasks?: boolean;
  hasManagerApproval?: boolean; actorUserId?: string; lastMovedByUserId?: string; contactRoles?: string[];
  solutionFitConfirmed?: boolean | null; primaryContactRole?: string | null; qualificationNotes?: string | null;
  visitedStageKeys?: string[]; customFields?: Record<string, unknown>; fields?: Record<string, unknown>;
  userRoles?: string[]; permissions?: string[]; rowVersion?: string; locale?: "en" | "ar";
}

/** Determines whether a specific exit or validation field is satisfied by record context. */
export function isFieldSatisfiedOnRecord(fieldKey: string, ctx?: RecordTransitionContext): boolean {
  if (!ctx) return false;
  const key = fieldKey.trim();
  if (key === "partyId" || key === "verifiedPartyId" || key === "organizationPartyId" || key === "accountId") {
    return Boolean(ctx.hasVerifiedParty || (ctx.partyId && ctx.partyId.trim() !== "") || (ctx.accountId && ctx.accountId.trim() !== ""));
  }
  if (key === "estimatedAmount" || key === "estimatedValue") return (ctx.estimatedAmount ?? ctx.estimatedValue ?? 0) > 0;
  if (key === "targetCloseDate" || key === "expectedCloseDate") return Boolean(ctx.targetCloseDate && ctx.targetCloseDate.trim() !== "");
  if (key === "lossReasonCode" || key === "disqualificationReason" || key === "disqualificationReasonCode" || key === "reason") {
    return Boolean(ctx.lossReasonCode || ctx.disqualificationReason);
  }
  if (key === "solutionFitConfirmed") {
    return Boolean(ctx.solutionFitConfirmed || ctx.fields?.solutionFitConfirmed || ctx.customFields?.solutionFitConfirmed);
  }
  if (key === "primaryContactRole") return Boolean(ctx.primaryContactRole || (ctx.contactRoles && ctx.contactRoles.length > 0));
  if (key === "qualificationNotes" && Boolean(ctx.qualificationNotes)) return true;
  if (ctx.fields?.[key] !== undefined && ctx.fields?.[key] !== null && ctx.fields?.[key] !== "") return true;
  if (ctx.customFields?.[key] !== undefined && ctx.customFields?.[key] !== null && ctx.customFields?.[key] !== "") return true;
  const inDirect = (ctx as Record<string, unknown>)[key];
  return inDirect !== undefined && inDirect !== null && inDirect !== "";
}

export function evaluateWorkflowTransition(
  wf: CrmWorkflowDefinition,
  fromStageKey: string,
  toStageKey: string,
  recordContext?: RecordTransitionContext
): EvaluatedWorkflowTransition {
  const normFrom = normalizeStageKeyForMatch(fromStageKey);
  const normTo = normalizeStageKeyForMatch(toStageKey);
  const isAr = recordContext?.locale === "ar";
  const fromStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normFrom);
  const toStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normTo);
  const isBackward = Boolean(fromStage && toStage && toStage.sortOrder < fromStage.sortOrder);
  const isReopen = Boolean(
    fromStage && toStage &&
    (fromStage.category === "done" || fromStage.category === "lost") &&
    (toStage.category === "todo" || toStage.category === "in_progress")
  );

  const allDirectMatches = wf.transitions.filter(
    (t) => t.fromStageKey !== "*" && !t.fromStageKeys?.includes("*") &&
      transitionMatchesSourceStage(t, fromStageKey) && normalizeStageKeyForMatch(t.toStageKey) === normTo
  );
  const directMatch = allDirectMatches[0];

  const outboundWildcard = wf.transitions.find(
    (t) => t.fromStageKey !== "*" && transitionMatchesSourceStage(t, fromStageKey) &&
      (t.toStageKey === "*" || normalizeStageKeyForMatch(t.toStageKey) === "*")
  );
  const globalInbound = wf.transitions.find(
    (t) => (t.fromStageKey === "*" || t.fromStageKeys?.includes("*")) &&
      normalizeStageKeyForMatch(t.toStageKey) === normTo
  );

  let matched = directMatch ?? outboundWildcard ?? globalInbound;
  const matchedTransitions = allDirectMatches.length > 0 ? allDirectMatches : (matched ? [matched] : []);

  if (!matched && toStage?.allowInboundFromAny && normFrom !== normTo) {
    matched = makeWorkflowTransition(
      `auto-any-${toStage.stageKey}`, "*", toStage.stageKey, "global",
      `Move to ${toStage.labelEn}`, `الانتقال إلى ${toStage.labelAr || toStage.labelEn}`,
      {
        allowRollback: true,
        requiredFieldKeys: toStage.requiredExitFields ? [...toStage.requiredExitFields] : [],
        requireVerifiedParty: Boolean(toStage.requiresVerifiedParty),
        triggerDealConversion: Boolean(toStage.triggerDealConversion),
      }
    );
  }

  const fromLabel = isAr ? (fromStage?.labelAr || fromStage?.labelEn || fromStageKey) : (fromStage?.labelEn || fromStageKey);
  const toLabel = isAr ? (toStage?.labelAr || toStage?.labelEn || toStageKey) : (toStage?.labelEn || toStageKey);
  const wfName = isAr ? (wf.nameAr || wf.nameEn) : wf.nameEn;

  const block = (
    msg: string, requiredFields: string[] = [], approvalRequirement?: EvaluatedWorkflowTransition["approvalRequirement"]
  ): EvaluatedWorkflowTransition => ({
    allowed: false, status: "blocked", reason: msg, reasonIfBlocked: msg, actionLabel: isAr ? "محظور" : "Blocked",
    matchedTransition: matched, matchedTransitions, targetStage: toStage, shouldTriggerDealConversion: false,
    triggerDealConversion: false, requiredFields, promptForComment: false, isBackward, approvalRequirement, requiresScreen: false,
  });

  if (!matched) {
    return block(
      isAr
        ? `لا يوجد انتقال مُعدّ من "${fromLabel}" إلى "${toLabel}" في سير العمل "${wfName}".`
        : `No transition is configured from "${fromLabel}" to "${toLabel}" in workflow "${wfName}".`
    );
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
    return block(isAr ? `التراجع من "${fromLabel}" إلى "${toLabel}" مقيد أو مغلق في سير العمل "${wfName}".` : `Rollback from "${fromLabel}" to "${toLabel}" is restricted or locked in active workflow "${wfName}".`);
  }

  const catalogRules = matched.catalogRules ?? [];
  let approvalRequirement: EvaluatedWorkflowTransition["approvalRequirement"] = undefined;
  const dynamicPromptedFields: string[] = [];
  const trName = isAr ? (matched.nameAr || matched.nameEn) : matched.nameEn;

  for (const cRule of catalogRules) {
    if (cRule.ruleTypeKey === "restrict.api_only") {
      return block(isAr ? `الانتقال "${trName}" مقصور على أحداث النظام التلقائية.` : `Transition "${trName}" is restricted to automated API/system events only.`);
    }
    if (cRule.ruleTypeKey === "restrict.approval_required") {
      const roles = (cRule.config?.principals || cRule.config?.approverRole || "role:sales_manager").split(",").map((s) => s.trim()).filter(Boolean);
      approvalRequirement = { required: true, roles, quorum: cRule.config?.quorum === "all" ? "all" : "any" };
      if (recordContext?.hasManagerApproval === false) {
        return block(isAr ? `الانتقال "${trName}" معلق حتى اعتماد (${roles.join(", ")}).` : `Transition "${trName}" is blocked until Approval (${roles.join(", ")}) is granted.`, [], approvalRequirement);
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
        return block(isAr ? `الانتقال "${trName}" يتطلب اعتماد ${approvalRequirement.matchedTierLabel} (${approvalRequirement.roles.join(", ")}).` : `Transition "${trName}" requires ${approvalRequirement.matchedTierLabel} approval (${approvalRequirement.roles.join(", ")}).`, [], approvalRequirement);
      }
    }
    if (cRule.ruleTypeKey === "restrict.subtasks_completed" && recordContext?.hasOpenSubtasks === true) {
      return block(isAr ? `الانتقال "${trName}" معلق لوجود مهام فرعية غير مكتملة.` : `Transition "${trName}" is blocked because open subtasks or activities remain incomplete.`);
    }
    if (cRule.ruleTypeKey === "restrict.separation_of_duties" && recordContext?.actorUserId && recordContext?.lastMovedByUserId && recordContext.actorUserId === recordContext.lastMovedByUserId) {
      return block(isAr ? `مبدأ الرقابة الثنائية: المستخدم الذي نفذ النقل السابق لا يمكنه تنفيذ "${trName}".` : `Four-Eyes Principle: the user who performed the previous stage move cannot execute "${trName}".`);
    }
    if (cRule.ruleTypeKey === "restrict.prior_status" && cRule.config?.requiredStageKey && recordContext?.visitedStageKeys) {
      const reqNorm = normalizeStageKeyForMatch(cRule.config.requiredStageKey);
      if (!recordContext.visitedStageKeys.some((k) => normalizeStageKeyForMatch(k) === reqNorm)) {
        return block(isAr ? `الانتقال "${trName}" يتطلب زيارة المرحلة "${cRule.config.requiredStageKey}" مسبقاً.` : `Transition "${trName}" requires the record to have previously visited stage "${cRule.config.requiredStageKey}".`);
      }
    }
    if (cRule.ruleTypeKey === "input.prompt_fields" && cRule.config?.fields) {
      dynamicPromptedFields.push(...cRule.config.fields.split(",").map((s) => s.trim()).filter(Boolean));
    }
    if (cRule.ruleTypeKey === "validate.buying_committee_role") {
      dynamicPromptedFields.push("primaryContactRole");
      if (recordContext?.contactRoles) {
        const reqRole = (cRule.config?.requiredRoles || cRule.config?.requiredRole || cRule.config?.role || "DecisionMaker").split(",")[0].trim();
        if (!recordContext.contactRoles.includes(reqRole)) {
          return block(isAr ? `يجب ربط جهة اتصال بلجنة الشراء بالدور "${reqRole}" قبل تنفيذ "${trName}".` : `A Buying Committee Contact with role "${reqRole}" must be linked before executing "${trName}".`, [`contactRole:${reqRole}`]);
        }
      }
    }
  }

  const requiresParty = Boolean(matched.rules.requireVerifiedParty || toStage?.requiresVerifiedParty || catalogRules.some((r) => r.ruleTypeKey === "validate.verified_party"));
  const hasFinancialAmountRule = Boolean(matched.rules.requireEstimatedAmountPositive || matched.rules.requireEstimatedAmount || catalogRules.some((r) => r.ruleTypeKey === "validate.financial_forecast"));
  const hasTargetCloseDateRule = Boolean(matched.rules.requireTargetCloseDate || catalogRules.some((r) => r.ruleTypeKey === "validate.financial_forecast"));

  const isMovingForwardToActive = !isBackward && toStage?.category !== "lost";
  const candidateExitFields = isMovingForwardToActive ? fromStage?.requiredExitFields ?? [] : [];

  const rawRequiredFields = Array.from(new Set([
    ...candidateExitFields, ...matched.rules.requiredFieldKeys,
    ...(requiresParty ? ["partyId"] : []),
    ...(hasFinancialAmountRule ? ["estimatedAmount"] : []),
    ...(hasTargetCloseDateRule ? ["targetCloseDate"] : []),
  ]));

  const unfulfilledFields = rawRequiredFields.filter((f) => !isFieldSatisfiedOnRecord(f, recordContext));
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
  const actionLabel = status === "allowed_instant"
    ? (isAr ? "⚡ أفلت للنقل" : "⚡ Drop to Move")
    : (isAr ? "ⓘ فتح شاشة الانتقال" : "ⓘ Opens Transition Screen");
  const reason = status === "allowed_instant"
    ? (isAr ? "الانتقال متاح فوراً." : "Transition is valid and available immediately.")
    : (isAr ? "يتطلب الانتقال تأكيداً أو استيفاء حقول." : "Transition requires confirmation or input fields.");

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
