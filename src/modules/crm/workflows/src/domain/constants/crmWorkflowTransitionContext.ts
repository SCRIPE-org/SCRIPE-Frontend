import {
  type CrmWorkflowDefinition,
  type CrmWorkflowStage,
  type CrmWorkflowTransition,
  makeWorkflowTransition,
  normalizeStageKeyForMatch,
  transitionMatchesSourceStage,
} from "./crmWorkflowRuleCatalogAndEval";

/** Localized template dictionary consumed by the pure workflow evaluation engine. */
export interface CrmWorkflowEngineMessages {
  moveToStage: string;
  blockedLabel: string;
  noTransitionConfigured: string;
  rollbackRestricted: string;
  apiOnlyRestricted: string;
  approvalRequired: string;
  approvalMatrixRequired: string;
  subtasksIncomplete: string;
  separationOfDuties: string;
  priorStatusRequired: string;
  fieldConditionFailed: string;
  roleOrPermissionRequired: string;
  activeQuoteRequired: string;
  buyingCommitteeRequired: string;
  dropToMove: string;
  opensTransitionScreen: string;
  instantReason: string;
  screenRequiredReason: string;
}

/** Pure domain English fallback messages so `evaluateWorkflowTransition` never imports locale barrels. */
export const DEFAULT_ENGINE_MESSAGES_EN: CrmWorkflowEngineMessages = {
  moveToStage: "Move to {{stage}}",
  blockedLabel: "Blocked",
  noTransitionConfigured: 'No transition is configured from "{{from}}" to "{{to}}" in workflow "{{workflow}}".',
  rollbackRestricted: 'Rollback from "{{from}}" to "{{to}}" is restricted or locked in active workflow "{{workflow}}".',
  apiOnlyRestricted: 'Transition "{{transition}}" is restricted to automated API/system events only.',
  approvalRequired: 'Transition "{{transition}}" is blocked until Approval ({{roles}}) is granted.',
  approvalMatrixRequired: 'Transition "{{transition}}" requires {{tier}} approval ({{roles}}).',
  subtasksIncomplete: 'Transition "{{transition}}" is blocked because open subtasks or activities remain incomplete.',
  separationOfDuties: 'Four-Eyes Principle: the user who performed the previous stage move cannot execute "{{transition}}".',
  priorStatusRequired: 'Transition "{{transition}}" requires the record to have previously visited stage "{{stage}}".',
  fieldConditionFailed: 'Field "{{field}}" does not satisfy condition "{{operator}} {{expected}}" for "{{transition}}".',
  roleOrPermissionRequired: 'Transition "{{transition}}" requires role, principal, or permission ({{requirements}}).',
  activeQuoteRequired: 'An active Commercial Quote must be attached before executing "{{transition}}".',
  buyingCommitteeRequired: 'A Buying Committee Contact with role "{{role}}" must be linked before executing "{{transition}}".',
  dropToMove: "⚡ Drop to Move",
  opensTransitionScreen: "ⓘ Opens Transition Screen",
  instantReason: "Transition is valid and available immediately.",
  screenRequiredReason: "Transition requires confirmation or input fields.",
};

/** Pure domain Arabic fallback messages used when `locale: "ar"` is passed without caller dictionary injection. */
export const DEFAULT_ENGINE_MESSAGES_AR: CrmWorkflowEngineMessages = {
  moveToStage: "الانتقال إلى {{stage}}",
  blockedLabel: "محظور",
  noTransitionConfigured: 'لا يوجد انتقال مُعدّ من "{{from}}" إلى "{{to}}" في مسار العمل "{{workflow}}".',
  rollbackRestricted: 'التراجع من "{{from}}" إلى "{{to}}" مقيد أو مقفل في مسار العمل النشط "{{workflow}}".',
  apiOnlyRestricted: 'الانتقال "{{transition}}" مقيد للأحداث البرمجية التلقائية (API) فقط.',
  approvalRequired: 'الانتقال "{{transition}}" محظور حتى يتم منح الموافقة ({{roles}}).',
  approvalMatrixRequired: 'الانتقال "{{transition}}" يتطلب موافقة {{tier}} ({{roles}}).',
  subtasksIncomplete: 'الانتقال "{{transition}}" محظور لوجود مهام فرعية أو أنشطة غير مكتملة.',
  separationOfDuties: 'مبدأ الرقابة المزدوجة: لا يمكن لنفس المستخدم الذي نفذ الانتقال السابق تنفيذ "{{transition}}".',
  priorStatusRequired: 'الانتقال "{{transition}}" يتطلب أن يكون السجل قد مرّ مسبقاً بمرحلة "{{stage}}".',
  fieldConditionFailed: 'الحقل "{{field}}" لا يستوفي شرط "{{operator}} {{expected}}" للانتقال "{{transition}}".',
  roleOrPermissionRequired: 'الانتقال "{{transition}}" يتطلب دوراً أو صلاحية ({{requirements}}).',
  activeQuoteRequired: 'يجب إرفاق عرض سعر تجاري نشط قبل تنفيذ "{{transition}}".',
  buyingCommitteeRequired: 'يجب ربط جهة اتصال من لجنة الشراء بدور "{{role}}" قبل تنفيذ "{{transition}}".',
  dropToMove: "⚡ أفلت للنقل",
  opensTransitionScreen: "ⓘ يفتح شاشة الانتقال",
  instantReason: "الانتقال متاح فوراً.",
  screenRequiredReason: "الانتقال يتطلب تأكيداً أو حقول إدخال.",
};

/** Record, user, and governance context evaluated against workflow transition rules. */
export interface RecordTransitionContext {
  hasVerifiedParty?: boolean; partyId?: string | null; accountId?: string | null;
  contactId?: string | null; ownerUserId?: string | null; discountPercent?: number | null;
  nextStepSummary?: string | null; leadPhoneOrEmail?: string | null; leadSourceChannel?: string | null;
  leadBantNotes?: string | null;
  estimatedAmount?: number | null; estimatedValue?: number | null; targetCloseDate?: string | null;
  lossReasonCode?: string | null; disqualificationReason?: string | null; hasOpenSubtasks?: boolean;
  hasManagerApproval?: boolean; hasActiveQuote?: boolean; quoteId?: string | null;
  actorUserId?: string; lastMovedByUserId?: string; contactRoles?: string[];
  solutionFitConfirmed?: boolean | null; primaryContactRole?: string | null; qualificationNotes?: string | null;
  visitedStageKeys?: string[]; customFields?: Record<string, unknown>; fields?: Record<string, unknown>;
  userRoles?: string[]; permissions?: string[]; rowVersion?: string; locale?: "en" | "ar";
  messages?: Partial<CrmWorkflowEngineMessages>;
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

/** Formats localized workflow engine template messages using `{{key}}` tokens. */
export function formatEngineText(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? "");
}

/** Resolves direct, wildcard, global-inbound, or implicit `allowInboundFromAny` transitions. */
export function resolveWorkflowTransitionMatch(
  wf: CrmWorkflowDefinition,
  fromStageKey: string,
  normFrom: string,
  normTo: string,
  toStage: CrmWorkflowStage | undefined
): { matched: CrmWorkflowTransition | undefined; matchedTransitions: CrmWorkflowTransition[] } {
  const allDirectMatches = wf.transitions.filter(
    (t) =>
      t.fromStageKey !== "*" &&
      !t.fromStageKeys?.includes("*") &&
      transitionMatchesSourceStage(t, fromStageKey) &&
      normalizeStageKeyForMatch(t.toStageKey) === normTo
  );
  const directMatch = allDirectMatches[0];

  const outboundWildcard = wf.transitions.find(
    (t) =>
      t.fromStageKey !== "*" &&
      transitionMatchesSourceStage(t, fromStageKey) &&
      (t.toStageKey === "*" || normalizeStageKeyForMatch(t.toStageKey) === "*")
  );
  const globalInbound = wf.transitions.find(
    (t) =>
      (t.fromStageKey === "*" || t.fromStageKeys?.includes("*")) &&
      normalizeStageKeyForMatch(t.toStageKey) === normTo
  );

  let matched = directMatch ?? outboundWildcard ?? globalInbound;
  const matchedTransitions = allDirectMatches.length > 0 ? allDirectMatches : matched ? [matched] : [];

  if (!matched && toStage?.allowInboundFromAny && normFrom !== normTo) {
    matched = makeWorkflowTransition(
      `auto-any-${toStage.stageKey}`,
      "*",
      toStage.stageKey,
      "global",
      formatEngineText(DEFAULT_ENGINE_MESSAGES_EN.moveToStage, { stage: toStage.labelEn }),
      formatEngineText(DEFAULT_ENGINE_MESSAGES_AR.moveToStage, { stage: toStage.labelAr || toStage.labelEn }),
      {
        allowRollback: true,
        requiredFieldKeys: toStage.requiredExitFields ? [...toStage.requiredExitFields] : [],
        requireVerifiedParty: Boolean(toStage.requiresVerifiedParty),
        triggerDealConversion: Boolean(toStage.triggerDealConversion),
      }
    );
  }

  return { matched, matchedTransitions };
}
