import { en as crmOverviewEn } from "../../../locales/crm-overview.en";
import { ar as crmOverviewAr } from "../../../locales/crm-overview.ar";
import {
  type CrmWorkflowDefinition,
  type CrmWorkflowStage,
  type CrmWorkflowTransition,
  makeWorkflowTransition,
  normalizeStageKeyForMatch,
  transitionMatchesSourceStage,
} from "./crmWorkflowRuleCatalogAndEval";

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
      formatEngineText(crmOverviewEn.crm.workflowEngine.moveToStage, { stage: toStage.labelEn }),
      formatEngineText(crmOverviewAr.crm.workflowEngine.moveToStage, { stage: toStage.labelAr || toStage.labelEn }),
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
