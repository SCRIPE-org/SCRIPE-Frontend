import type {
  CrmStageColorToken,
  CrmWorkflowEntityType,
  CrmWorkflowStageCategory,
} from "@modules/crm/shared";

export * from "./crmWorkflowRuleDefinitions";
import type {
  CrmWorkflowRuleCategory,
  CrmWorkflowRuleCatalogTemplate,
} from "./crmWorkflowRuleDefinitions";

/** Dynamic stage node inside a CRM Workflow (2..N stages). */
export interface CrmWorkflowStage {
  stageKey: string;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  category: CrmWorkflowStageCategory;
  color?: CrmStageColorToken;
  customColorHex?: string;
  winProbabilityPercent: number;
  requiredExitFields: string[];
  requiresVerifiedParty?: boolean;
  triggerDealConversion?: boolean;
  triggersDealConversion?: boolean;
  allowInboundFromAny?: boolean;
  slaDays?: number;
  properties?: Record<string, string>;
  position?: { x: number; y: number };
}
/** Alias for CrmWorkflowStage. */
export type CrmWorkflowStageDef = CrmWorkflowStage;
/** Alias for CrmWorkflowStage used in Studio dialogs. */
export type CrmWorkflowStageNode = CrmWorkflowStage;

/** A single rule instance from the 4-Category Rule Catalog attached to a transition. */
export interface CrmWorkflowCatalogRule {
  id: string;
  category: CrmWorkflowRuleCategory;
  ruleTypeKey: string;
  titleEn: string;
  titleAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  config?: Record<string, string>;
}



/** Rules attached to a workflow transition (4 categories: Restrict, Request Input, Validate, Actions). */
export interface CrmWorkflowTransitionRules {
  allowRollback: boolean;
  requiredPermission: string | null;
  blockIfLinkedDealProgressed: boolean;
  blockRevertIfDealProgressed?: boolean;
  promptForComment: boolean;
  promptFields: string[];
  requireVerifiedParty: boolean;
  requireEstimatedAmountPositive: boolean;
  requireEstimatedAmount?: boolean;
  requireTargetCloseDate: boolean;
  requiredFieldKeys: string[];
  triggerDealConversion: boolean;
  autoConvertLeadToDeal?: boolean;
  autoCreateWorkTask: boolean;
}

/** Explicit directed, multi-source, or Any-status transition between workflow stages. */
export interface CrmWorkflowTransition {
  id: string;
  nameEn: string;
  nameAr: string;
  fromStageKey: string;
  fromStageKeys?: string[];
  toStageKey: string;
  direction: "forward" | "backward" | "global";
  domainEventKey?: string;
  triggers?: string[];
  properties?: Record<string, string>;
  catalogRules?: CrmWorkflowCatalogRule[];
  rules: CrmWorkflowTransitionRules;
}
/** Alias for CrmWorkflowTransition. */
export type CrmWorkflowTransitionDef = CrmWorkflowTransition;

/** Complete dynamic CRM Workflow definition for Deals (Opportunities) or Leads. */
export interface CrmWorkflowDefinition {
  id: string;
  code: string;
  entityType: CrmWorkflowEntityType;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  isActive: boolean;
  isTemplate?: boolean;
  industryCategory?: string;
  version: number;
  stages: CrmWorkflowStage[];
  transitions: CrmWorkflowTransition[];
  properties?: Record<string, string>;
  updatedAtUtc: string;
}

/** Result of evaluating a stage transition on a Kanban board or detail page. */
export interface EvaluatedWorkflowTransition {
  allowed: boolean;
  status: "allowed_instant" | "allowed_screen_required" | "blocked";
  reason?: string;
  reasonIfBlocked?: string;
  actionLabel?: string;
  matchedTransition?: CrmWorkflowTransition;
  matchedTransitions?: CrmWorkflowTransition[];
  targetStage?: CrmWorkflowStage;
  shouldTriggerDealConversion: boolean;
  triggerDealConversion: boolean;
  requiredFields: string[];
  promptForComment: boolean;
  isBackward: boolean;
  domainEventKey?: string;
  postActions?: string[];
  approvalRequirement?: {
    required: boolean;
    roles: string[];
    quorum: "any" | "all";
    matchedTierLabel?: string;
  };
  requiresScreen?: boolean;
  missingFields?: string[];
  promptFields?: string[];
  requiresVerifiedParty?: boolean;
  requiresLossReason?: boolean;
  requiresCloseNotes?: boolean;
  requiresReopenReason?: boolean;
  requiresFinancialForecast?: boolean;
}

/** Factory helper for constructing a CrmWorkflowTransition with safe rule defaults. */
export function makeWorkflowTransition(
  id: string, fromStageKey: string, toStageKey: string, direction: "forward" | "backward" | "global",
  nameEn: string, nameAr: string,
  opts?: Partial<CrmWorkflowTransitionRules> & {
    fromStageKeys?: string[]; domainEventKey?: string; triggers?: string[];
    properties?: Record<string, string>; catalogRules?: CrmWorkflowCatalogRule[];
  }
): CrmWorkflowTransition {
  return {
    id, nameEn, nameAr, fromStageKey,
    fromStageKeys: opts?.fromStageKeys ?? (fromStageKey === "*" ? ["*"] : [fromStageKey]),
    toStageKey, direction, domainEventKey: opts?.domainEventKey ?? "GenericEvent",
    triggers: opts?.triggers ?? [], properties: opts?.properties ?? {}, catalogRules: opts?.catalogRules ?? [],
    rules: {
      allowRollback: opts?.allowRollback ?? true,
      requiredPermission: opts?.requiredPermission ?? null,
      blockIfLinkedDealProgressed: opts?.blockIfLinkedDealProgressed ?? false,
      promptForComment: opts?.promptForComment ?? false,
      promptFields: opts?.promptFields ?? [],
      requireVerifiedParty: opts?.requireVerifiedParty ?? false,
      requireEstimatedAmountPositive: opts?.requireEstimatedAmountPositive ?? false,
      requireTargetCloseDate: opts?.requireTargetCloseDate ?? false,
      requiredFieldKeys: opts?.requiredFieldKeys ?? [],
      triggerDealConversion: opts?.triggerDealConversion ?? false,
      autoCreateWorkTask: opts?.autoCreateWorkTask ?? false,
    },
  };
}

/** Normalizes stage keys for prefix-agnostic transition matching across boards. */
export function normalizeStageKeyForMatch(key: string): string {
  const trimmed = key.trim().toLowerCase().replace(/^lead\./, "").replace(/^default\./, "");
  if (trimmed === "terminal-won" || trimmed === "closed_won" || trimmed === "won") return "closed_won";
  if (trimmed === "terminal-lost" || trimmed === "closed_lost" || trimmed === "lost") return "closed_lost";
  return trimmed;
}

/** Checks if a transition originates from the specified stage key (including multi-source fromStageKeys). */
export function transitionMatchesSourceStage(t: CrmWorkflowTransition, fromStageKey: string): boolean {
  const normFrom = normalizeStageKeyForMatch(fromStageKey);
  if (t.fromStageKey !== "*" && normalizeStageKeyForMatch(t.fromStageKey) === normFrom) return true;
  return Array.isArray(t.fromStageKeys) && t.fromStageKeys.some((k) => k !== "*" && normalizeStageKeyForMatch(k) === normFrom);
}
