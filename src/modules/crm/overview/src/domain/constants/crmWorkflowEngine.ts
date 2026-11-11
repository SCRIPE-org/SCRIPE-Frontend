import {
  type CrmWorkflowDefinition,
  type EvaluatedWorkflowTransition,
  makeWorkflowTransition,
  normalizeStageKeyForMatch,
  transitionMatchesSourceStage,
} from "./crmWorkflowRuleCatalogAndEval";

export function evaluateWorkflowTransition(
  wf: CrmWorkflowDefinition,
  fromStageKey: string,
  toStageKey: string,
  recordContext?: {
    hasVerifiedParty?: boolean;
    partyId?: string | null;
    accountId?: string | null;
    estimatedAmount?: number | null;
    estimatedValue?: number | null;
    targetCloseDate?: string | null;
    hasOpenSubtasks?: boolean;
    hasManagerApproval?: boolean;
    actorUserId?: string;
    lastMovedByUserId?: string;
    contactRoles?: string[];
    visitedStageKeys?: string[];
    customFields?: Record<string, unknown>;
    userRoles?: string[];
    permissions?: string[];
    rowVersion?: string;
  }
): EvaluatedWorkflowTransition {
  const normFrom = normalizeStageKeyForMatch(fromStageKey);
  const normTo = normalizeStageKeyForMatch(toStageKey);
  const fromStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normFrom);
  const toStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normTo);
  const isBackward = Boolean(fromStage && toStage && toStage.sortOrder < fromStage.sortOrder);
  const isReopen = Boolean(
    fromStage && toStage &&
    (fromStage.category === "done" || fromStage.category === "lost") &&
    (toStage.category === "todo" || toStage.category === "in_progress")
  );

  // Specific-Wins + Bidirectional Precedence:
  // 1) Direct edge (fromStageKey -> toStageKey, neither wildcard)
  const allDirectMatches = wf.transitions.filter(
    (t) => t.fromStageKey !== "*" && !t.fromStageKeys?.includes("*") &&
      transitionMatchesSourceStage(t, fromStageKey) && normalizeStageKeyForMatch(t.toStageKey) === normTo
  );
  let directMatch = allDirectMatches[0];
  if (!directMatch && normTo === "closed_won" && (normFrom === "solution_fit" || normFrom === "proposal" || normFrom === "negotiation")) {
    const wonTr = wf.transitions.find((t) => normalizeStageKeyForMatch(t.toStageKey) === "closed_won");
    if (wonTr) directMatch = wonTr;
  }
  if (!directMatch && normTo === "discovery") {
    const reopenTr = wf.transitions.find(
      (t) => normalizeStageKeyForMatch(t.toStageKey) === "discovery" &&
        (t.id.includes("reopen") || t.id.includes("lost") || t.nameEn.toLowerCase().includes("reopen"))
    );
    if (reopenTr) directMatch = reopenTr;
  }
  // 2) Outbound wildcard (fromStageKey -> *)
  const outboundWildcard = wf.transitions.find(
    (t) => t.fromStageKey !== "*" && transitionMatchesSourceStage(t, fromStageKey) &&
      (t.toStageKey === "*" || normalizeStageKeyForMatch(t.toStageKey) === "*")
  );
  // 3) Global Inbound (* -> toStageKey OR toStage?.allowInboundFromAny)
  const globalInbound = wf.transitions.find(
    (t) => (t.fromStageKey === "*" || t.fromStageKeys?.includes("*")) &&
      normalizeStageKeyForMatch(t.toStageKey) === normTo
  );

  let matched = directMatch ?? outboundWildcard ?? globalInbound;
  const matchedTransitions = allDirectMatches.length > 0 ? allDirectMatches : (matched ? [matched] : []);

  // Synthesize global inbound when target stage explicitly allows inbound from any and no transition was configured
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

  const block = (
    msg: string,
    requiredFields: string[] = [],
    approvalRequirement?: EvaluatedWorkflowTransition["approvalRequirement"]
  ): EvaluatedWorkflowTransition => ({
    allowed: false,
    status: "blocked",
    reason: msg,
    reasonIfBlocked: msg,
    matchedTransition: matched,
    matchedTransitions,
    targetStage: toStage,
    shouldTriggerDealConversion: false,
    triggerDealConversion: false,
    requiredFields,
    promptForComment: false,
    isBackward,
    approvalRequirement,
    requiresScreen: false,
  });

  if (!matched) {
    return block(
      isBackward
        ? `Rollback from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" is restricted or locked in active workflow "${wf.nameEn}".`
        : `Transition from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" is restricted or locked in active workflow "${wf.nameEn}".`
    );
  }

  // Enforce rollback lock only when moving backward:
  if (isBackward && !matched.rules.allowRollback) {
    return block(`Rollback from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" is restricted or locked in active workflow "${wf.nameEn}".`);
  }

  const catalogRules = matched.catalogRules ?? [];
  let approvalRequirement: EvaluatedWorkflowTransition["approvalRequirement"] = undefined;
  const dynamicPromptedFields: string[] = [];

  for (const cRule of catalogRules) {
    if (cRule.ruleTypeKey === "restrict.api_only") {
      return block(`Transition "${matched.nameEn}" is restricted to automated API/system events only.`);
    }
    if (cRule.ruleTypeKey === "restrict.approval_required") {
      const roles = (cRule.config?.principals || cRule.config?.approverRole || "role:sales_manager").split(",").map((s) => s.trim()).filter(Boolean);
      approvalRequirement = { required: true, roles, quorum: cRule.config?.quorum === "all" ? "all" : "any" };
      if (recordContext?.hasManagerApproval === false) {
        return block(`Transition "${matched.nameEn}" is blocked until Approval (${roles.join(", ")}) is granted.`, [], approvalRequirement);
      }
    }
    if (cRule.ruleTypeKey === "restrict.approval_matrix") {
      const t1Min = Number(cRule.config?.tier1MinAmount ?? 100000);
      const t1Roles = (cRule.config?.tier1Roles || "role:sales_manager").split(",").map((s) => s.trim()).filter(Boolean);
      const t2Min = Number(cRule.config?.tier2MinAmount ?? 500000);
      const t2Roles = (cRule.config?.tier2Roles || "role:commercial_director,role:finance_controller").split(",").map((s) => s.trim()).filter(Boolean);
      const amt = recordContext?.estimatedAmount ?? recordContext?.estimatedValue ?? t1Min;
      if (amt >= t2Min) {
        approvalRequirement = { required: true, roles: t2Roles, quorum: cRule.config?.quorum === "any" ? "any" : "all", matchedTierLabel: `Tier 2 (>= ${t2Min.toLocaleString()})` };
      } else if (amt >= t1Min) {
        approvalRequirement = { required: true, roles: t1Roles, quorum: "any", matchedTierLabel: `Tier 1 (>= ${t1Min.toLocaleString()})` };
      }
      if (approvalRequirement?.required && recordContext?.hasManagerApproval === false) {
        return block(`Transition "${matched.nameEn}" requires ${approvalRequirement.matchedTierLabel} approval (${approvalRequirement.roles.join(", ")}).`, [], approvalRequirement);
      }
    }
    if (cRule.ruleTypeKey === "restrict.subtasks_completed" && recordContext?.hasOpenSubtasks === true) {
      return block(`Transition "${matched.nameEn}" is blocked because open subtasks or activities remain incomplete.`);
    }
    if (cRule.ruleTypeKey === "restrict.separation_of_duties" && recordContext?.actorUserId && recordContext?.lastMovedByUserId && recordContext.actorUserId === recordContext.lastMovedByUserId) {
      return block(`Four-Eyes Principle: the user who performed the previous stage move cannot execute "${matched.nameEn}".`);
    }
    if (cRule.ruleTypeKey === "restrict.prior_status" && cRule.config?.requiredStageKey && recordContext?.visitedStageKeys) {
      const reqNorm = normalizeStageKeyForMatch(cRule.config.requiredStageKey);
      const hasVisited = recordContext.visitedStageKeys.some((k) => normalizeStageKeyForMatch(k) === reqNorm);
      if (!hasVisited) {
        return block(`Transition "${matched.nameEn}" requires the record to have previously visited stage "${cRule.config.requiredStageKey}".`);
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
          return block(`A Buying Committee Contact with role "${reqRole}" must be linked before executing "${matched.nameEn}".`, [`contactRole:${reqRole}`]);
        }
      }
    }
  }

  // Party requirement
  const requiresParty = Boolean(
    matched.rules.requireVerifiedParty || toStage?.requiresVerifiedParty || catalogRules.some((r) => r.ruleTypeKey === "validate.verified_party")
  );
  const hasParty = Boolean(
    recordContext?.hasVerifiedParty === true ||
    (recordContext?.partyId && recordContext.partyId.trim() !== "") ||
    (recordContext?.accountId && recordContext.accountId.trim() !== "")
  );

  // Financial requirement
  const hasFinancialRule = Boolean(
    matched.rules.requireEstimatedAmountPositive || matched.rules.requireTargetCloseDate || catalogRules.some((r) => r.ruleTypeKey === "validate.financial_forecast")
  );
  const currentAmount = recordContext?.estimatedAmount ?? recordContext?.estimatedValue ?? null;
  const missingAmount = hasFinancialRule && (currentAmount == null || currentAmount <= 0);
  const missingCloseDate = (matched.rules.requireTargetCloseDate || catalogRules.some((r) => r.ruleTypeKey === "validate.financial_forecast")) && !recordContext?.targetCloseDate;

  // Exit gates: only forward moves into non-lost stages require exit fields of departed stage
  const isMovingForwardToActive = !isBackward && toStage?.category !== "lost";
  const unfulfilledExitFields = isMovingForwardToActive ? fromStage?.requiredExitFields ?? [] : [];

  const requiredFields = Array.from(new Set([
    ...unfulfilledExitFields, ...matched.rules.requiredFieldKeys, ...matched.rules.promptFields, ...dynamicPromptedFields,
    ...(requiresParty ? ["partyId"] : []),
    ...(missingAmount ? ["estimatedAmount"] : []),
    ...(missingCloseDate ? ["targetCloseDate"] : []),
  ]));

  const shouldConvert = Boolean(
    matched.rules.triggerDealConversion || catalogRules.some((r) => r.ruleTypeKey === "action.convert_lead_to_deal") || (!isBackward && toStage?.triggerDealConversion)
  );

  const promptComment = Boolean(
    matched.rules.promptForComment || catalogRules.some((r) => r.ruleTypeKey === "input.require_reason_and_note") || isBackward || isReopen
  );

  const isTargetDone = toStage?.category === "done";
  const isTargetLost = toStage?.category === "lost";
  const requiresLossReason = isTargetLost;
  const requiresCloseNotes = isTargetDone || isTargetLost;
  const requiresReopenReason = isReopen;
  const requiresPartyPrompt = requiresParty && !hasParty;
  const hasExplicitPromptFields = (matched.rules.promptFields && matched.rules.promptFields.length > 0) || dynamicPromptedFields.length > 0;
  const hasUnsatisfiedExitFields = unfulfilledExitFields.length > 0;

  const hasMultipleParallelTransitions = matchedTransitions.length > 1;

  const requiresScreen = Boolean(
    hasMultipleParallelTransitions ||
    isTargetDone || isTargetLost || requiresReopenReason || requiresPartyPrompt ||
    missingAmount || missingCloseDate || hasExplicitPromptFields || hasUnsatisfiedExitFields || promptComment
  );

  const status: "allowed_instant" | "allowed_screen_required" = requiresScreen ? "allowed_screen_required" : "allowed_instant";

  return {
    allowed: true,
    status,
    requiresScreen,
    matchedTransition: matched,
    matchedTransitions,
    targetStage: toStage,
    shouldTriggerDealConversion: shouldConvert,
    triggerDealConversion: shouldConvert,
    requiredFields,
    missingFields: requiredFields,
    promptFields: Array.from(new Set([...matched.rules.promptFields, ...dynamicPromptedFields])),
    promptForComment: promptComment,
    isBackward,
    requiresVerifiedParty: requiresParty,
    requiresLossReason,
    requiresCloseNotes,
    requiresReopenReason,
    requiresFinancialForecast: hasFinancialRule,
    domainEventKey: matched.domainEventKey ?? (shouldConvert ? "LeadConvertedEvent" : "GenericEvent"),
    postActions: catalogRules.filter((r) => r.category === "actions").map((r) => r.ruleTypeKey),
    approvalRequirement,
  };
}
