/** Entity types supported by the CRM Workflow Engine. */
export type CrmWorkflowEntityType = "deal" | "lead";
/** Visual and lifecycle category of a workflow stage node. */
export type CrmWorkflowStageCategory = "todo" | "in_progress" | "done" | "lost";

/** Dynamic stage node inside a CRM Workflow (2..N stages). */
export interface CrmWorkflowStage {
  stageKey: string;
  labelEn: string;
  labelAr: string;
  sortOrder: number;
  category: CrmWorkflowStageCategory;
  winProbabilityPercent: number;
  requiredExitFields: string[];
  requiresVerifiedParty?: boolean;
  triggerDealConversion?: boolean;
  triggersDealConversion?: boolean;
  allowInboundFromAny?: boolean;
  position?: { x: number; y: number };
}
/** Alias for CrmWorkflowStage. */
export type CrmWorkflowStageDef = CrmWorkflowStage;
/** Alias for CrmWorkflowStage used in Studio dialogs. */
export type CrmWorkflowStageNode = CrmWorkflowStage;

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

/** Explicit directed or Any-status transition between workflow stages. */
export interface CrmWorkflowTransition {
  id: string;
  nameEn: string;
  nameAr: string;
  fromStageKey: string;
  toStageKey: string;
  direction: "forward" | "backward" | "global";
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
  version: number;
  stages: CrmWorkflowStage[];
  transitions: CrmWorkflowTransition[];
  updatedAtUtc: string;
}

/** Result of evaluating a stage transition on a Kanban board or detail page. */
export interface EvaluatedWorkflowTransition {
  allowed: boolean;
  reason?: string;
  reasonIfBlocked?: string;
  matchedTransition?: CrmWorkflowTransition;
  targetStage?: CrmWorkflowStage;
  shouldTriggerDealConversion: boolean;
  triggerDealConversion: boolean;
  requiredFields: string[];
  promptForComment: boolean;
  isBackward: boolean;
}

/** Factory helper for constructing a CrmWorkflowTransition with safe rule defaults. */
export function makeWorkflowTransition(
  id: string,
  fromStageKey: string,
  toStageKey: string,
  direction: "forward" | "backward" | "global",
  nameEn: string,
  nameAr: string,
  opts?: Partial<CrmWorkflowTransitionRules>
): CrmWorkflowTransition {
  return {
    id, nameEn, nameAr, fromStageKey, toStageKey, direction,
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
  return key.trim().toLowerCase().replace(/^lead\./, "").replace(/^default\./, "");
}

/** Evaluates a stage transition against the given workflow's stages, transitions, and record context. */
export function evaluateWorkflowTransition(
  wf: CrmWorkflowDefinition,
  fromStageKey: string,
  toStageKey: string,
  recordContext?: { hasVerifiedParty?: boolean; estimatedAmount?: number | null; targetCloseDate?: string | null }
): EvaluatedWorkflowTransition {
  const normFrom = normalizeStageKeyForMatch(fromStageKey);
  const normTo = normalizeStageKeyForMatch(toStageKey);
  const fromStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normFrom);
  const toStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normTo);
  const isBackward = Boolean(fromStage && toStage && toStage.sortOrder < fromStage.sortOrder);

  const directMatch = wf.transitions.find(
    (t) => t.fromStageKey !== "*" && normalizeStageKeyForMatch(t.fromStageKey) === normFrom && normalizeStageKeyForMatch(t.toStageKey) === normTo
  );
  const anyMatch = wf.transitions.find(
    (t) => (t.fromStageKey === "*" || toStage?.allowInboundFromAny) && normalizeStageKeyForMatch(t.toStageKey) === normTo
  );
  const matched = directMatch ?? anyMatch;

  if (!matched) {
    const msg = isBackward
      ? `Rollback from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" is disabled in active workflow "${wf.nameEn}".`
      : `No configured transition from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" in active workflow "${wf.nameEn}".`;
    return { allowed: false, reason: msg, reasonIfBlocked: msg, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: [], promptForComment: false, isBackward };
  }

  if (!matched.rules.allowRollback) {
    const msg = `Transition "${matched.nameEn}" is restricted or locked in active workflow "${wf.nameEn}".`;
    return { allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: [], promptForComment: false, isBackward };
  }

  if (recordContext && (matched.rules.requireVerifiedParty || toStage?.requiresVerifiedParty) && recordContext.hasVerifiedParty === false) {
    const msg = `A verified Company Account or Contact must be linked before moving to "${toStage?.labelEn || toStageKey}".`;
    return { allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: ["partyId"], promptForComment: false, isBackward };
  }

  const requiredFields = Array.from(
    new Set([
      ...(fromStage?.requiredExitFields ?? []),
      ...matched.rules.requiredFieldKeys,
      ...matched.rules.promptFields,
      ...(matched.rules.requireVerifiedParty || toStage?.requiresVerifiedParty ? ["partyId"] : []),
      ...(matched.rules.requireEstimatedAmountPositive ? ["estimatedAmount"] : []),
      ...(matched.rules.requireTargetCloseDate ? ["targetCloseDate"] : []),
    ])
  );
  const shouldConvert = Boolean(matched.rules.triggerDealConversion || (!isBackward && toStage?.triggerDealConversion));

  return {
    allowed: true,
    matchedTransition: matched,
    targetStage: toStage,
    shouldTriggerDealConversion: shouldConvert,
    triggerDealConversion: shouldConvert,
    requiredFields,
    promptForComment: Boolean(matched.rules.promptForComment || isBackward),
    isBackward,
  };
}

/** Seeded default and template CRM Workflows for Deals (Opportunities) and Leads. */
export const INITIAL_CRM_WORKFLOWS: CrmWorkflowDefinition[] = [
  {
    id: "wf-deal-default", code: "default", entityType: "deal",
    nameEn: "Standard Commercial Pipeline", nameAr: "مسار المبيعات التجاري القياسي",
    descriptionEn: "5-stage B2B sports commercial pipeline with forward & backward transitions and Customer Verification gates.",
    descriptionAr: "مسار مبيعات تجاري من 5 مراحل مع انتقالات أمامية وعكسية وبوابة التحقق من الحساب.",
    isActive: true, isTemplate: false, version: 2, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, category: "todo", winProbabilityPercent: 10, requiredExitFields: [] },
      { stageKey: "default.qualification", labelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2, category: "in_progress", winProbabilityPercent: 25, requiredExitFields: [] },
      { stageKey: "default.solution_fit", labelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3, category: "in_progress", winProbabilityPercent: 50, requiredExitFields: ["solutionFitConfirmed"] },
      { stageKey: "default.proposal", labelEn: "Proposal", labelAr: "عرض السعر", sortOrder: 4, category: "in_progress", winProbabilityPercent: 75, requiredExitFields: ["partyId", "estimatedAmount"], requiresVerifiedParty: true },
      { stageKey: "default.negotiation", labelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, category: "in_progress", winProbabilityPercent: 90, requiredExitFields: ["partyId", "targetCloseDate"], requiresVerifiedParty: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-deal-1-2", "default.discovery", "default.qualification", "forward", "Qualify Deal", "تأهيل الصفقة"),
      makeWorkflowTransition("tr-deal-2-1", "default.qualification", "default.discovery", "backward", "Return to Discovery", "إرجاع للاستكشاف", { promptForComment: true }),
      makeWorkflowTransition("tr-deal-2-3", "default.qualification", "default.solution_fit", "forward", "Confirm Solution Fit", "تأكيد ملاءمة الحل"),
      makeWorkflowTransition("tr-deal-3-2", "default.solution_fit", "default.qualification", "backward", "Re-Qualify", "إعادة التأهيل", { promptForComment: true }),
      makeWorkflowTransition("tr-deal-3-4", "default.solution_fit", "default.proposal", "forward", "Submit Proposal", "تقديم العرض", { requireVerifiedParty: true, requiredFieldKeys: ["solutionFitConfirmed", "partyId"] }),
      makeWorkflowTransition("tr-deal-4-3", "default.proposal", "default.solution_fit", "backward", "Revise Solution", "مراجعة الحل", { promptForComment: true }),
      makeWorkflowTransition("tr-deal-4-5", "default.proposal", "default.negotiation", "forward", "Enter Negotiation", "بدء التفاوض", { requireVerifiedParty: true, requireEstimatedAmountPositive: true, requiredFieldKeys: ["partyId", "estimatedAmount"] }),
      makeWorkflowTransition("tr-deal-5-4", "default.negotiation", "default.proposal", "backward", "Revise Proposal", "مراجعة عرض السعر", { promptForComment: true }),
    ],
  },
  {
    id: "wf-deal-fast-track", code: "deal.fast_track", entityType: "deal",
    nameEn: "2-Stage Fast-Track Deal Flow", nameAr: "مسار الصفقات السريع (مرحلتان)",
    descriptionEn: "Streamlined 2-stage deal pipeline (Pitch & Qualification → Contract Closing) for rapid sponsorships.",
    descriptionAr: "مسار صفقات مبسط من مرحلتين فقط لإغلاق الرعايات السريعة.",
    isActive: false, isTemplate: true, version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "default.discovery", labelEn: "Pitch & Qualification", labelAr: "العرض والتأهيل", sortOrder: 1, category: "todo", winProbabilityPercent: 35, requiredExitFields: ["estimatedAmount"] },
      { stageKey: "default.proposal", labelEn: "Contract Closing", labelAr: "إغلاق العقد", sortOrder: 2, category: "in_progress", winProbabilityPercent: 85, requiredExitFields: ["partyId", "targetCloseDate"], requiresVerifiedParty: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-ft-1-2", "default.discovery", "default.proposal", "forward", "Advance to Closing", "الانتقال للإغلاق", { requireVerifiedParty: true, requireEstimatedAmountPositive: true, requiredFieldKeys: ["partyId", "estimatedAmount"] }),
      makeWorkflowTransition("tr-ft-2-1", "default.proposal", "default.discovery", "backward", "Return to Pitch", "إرجاع للعرض", { promptForComment: true }),
    ],
  },
  {
    id: "wf-lead-default", code: "lead.default", entityType: "lead",
    nameEn: "Standard Leads Qualification Workflow", nameAr: "مسار تأهيل العملاء المحتملين القياسي",
    descriptionEn: "5-status lead qualification flow with bidirectional transitions and automatic Deal conversion on Converted.",
    descriptionAr: "مسار تأهيل العملاء المحتملين مع انتقالات ثنائية الاتجاه وتحويل تلقائي لصفقة عند التحويل.",
    isActive: true, isTemplate: false, version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "lead.new", labelEn: "New Intake", labelAr: "جديد", sortOrder: 1, category: "todo", winProbabilityPercent: 10, requiredExitFields: [] },
      { stageKey: "lead.working", labelEn: "Working (In Progress)", labelAr: "قيد المتابعة", sortOrder: 2, category: "in_progress", winProbabilityPercent: 30, requiredExitFields: [] },
      { stageKey: "lead.qualified", labelEn: "Qualified", labelAr: "مؤهل", sortOrder: 3, category: "in_progress", winProbabilityPercent: 60, requiredExitFields: ["qualificationNotes"] },
      { stageKey: "lead.converted", labelEn: "Converted to Deal", labelAr: "تم التحويل", sortOrder: 4, category: "done", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: true },
      { stageKey: "lead.disqualified", labelEn: "Disqualified", labelAr: "مستبعد", sortOrder: 5, category: "done", winProbabilityPercent: 0, requiredExitFields: ["disqualificationReasonCode"], allowInboundFromAny: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-lead-1-2", "lead.new", "lead.working", "forward", "Start Working", "بدء المتابعة"),
      makeWorkflowTransition("tr-lead-2-1", "lead.working", "lead.new", "backward", "Return to New", "إرجاع لجديد"),
      makeWorkflowTransition("tr-lead-2-3", "lead.working", "lead.qualified", "forward", "Qualify Lead", "تأهيل العميل", { promptFields: ["qualificationNotes"] }),
      makeWorkflowTransition("tr-lead-3-2", "lead.qualified", "lead.working", "backward", "Return to Working", "إرجاع للمتابعة"),
      makeWorkflowTransition("tr-lead-3-4", "lead.qualified", "lead.converted", "forward", "Convert to Deal", "تحويل لصفقة", { triggerDealConversion: true }),
      makeWorkflowTransition("tr-lead-4-3", "lead.converted", "lead.qualified", "backward", "Revert to Qualified", "إرجاع إلى مؤهل", { blockIfLinkedDealProgressed: true }),
      makeWorkflowTransition("tr-lead-any-disq", "*", "lead.disqualified", "global", "Disqualify Lead", "استبعاد العميل", { promptFields: ["disqualificationReasonCode"] }),
      makeWorkflowTransition("tr-lead-disq-working", "lead.disqualified", "lead.working", "backward", "Reopen to Working", "إعادة فتح للمتابعة"),
    ],
  },
  {
    id: "wf-lead-2stage-fast", code: "lead.two_stage", entityType: "lead",
    nameEn: "2-Stage Express Leads (New → Converted)", nameAr: "مسار العملاء السريع (جديد ← تم التحويل)",
    descriptionEn: "Minimal 2-stage pipeline: start at New and move directly to Converted to create a Deal.",
    descriptionAr: "مسار من مرحلتين فقط: يبدأ من جديد وينتقل مباشرة إلى تم التحويل لإنشاء صفقة.",
    isActive: false, isTemplate: true, version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "lead.new", labelEn: "New", labelAr: "جديد", sortOrder: 1, category: "todo", winProbabilityPercent: 25, requiredExitFields: [] },
      { stageKey: "lead.converted", labelEn: "Converted", labelAr: "تم التحويل", sortOrder: 2, category: "done", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-l2-1-2", "lead.new", "lead.converted", "forward", "Convert to Deal", "تحويل لصفقة", { triggerDealConversion: true }),
      makeWorkflowTransition("tr-l2-2-1", "lead.converted", "lead.new", "backward", "Revert to New", "إرجاع لجديد", { blockIfLinkedDealProgressed: true }),
    ],
  },
  {
    id: "wf-lead-custom-3stage", code: "lead.three_stage_deal", entityType: "lead",
    nameEn: "3-Stage Custom Lead Pipeline (New → Converted → Deal)", nameAr: "مسار 3 مراحل (جديد ← محول مبدئياً ← صفقة)",
    descriptionEn: "Converted is an intermediate stage without deal creation; actual Deal conversion fires only on the 3rd 'Deal' stage with rollback locked.",
    descriptionAr: "مرحلة تم التحويل هي مرحلة وسطية، ويتم إنشاء الصفقة فعلياً في المرحلة الثالثة (صفقة) مع منع التراجع.",
    isActive: false, isTemplate: true, version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "lead.new", labelEn: "New", labelAr: "جديد", sortOrder: 1, category: "todo", winProbabilityPercent: 20, requiredExitFields: [] },
      { stageKey: "lead.converted", labelEn: "Converted", labelAr: "محول مبدئياً", sortOrder: 2, category: "in_progress", winProbabilityPercent: 65, requiredExitFields: [], triggerDealConversion: false },
      { stageKey: "lead.deal", labelEn: "Deal", labelAr: "صفقة", sortOrder: 3, category: "done", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-l3-1-2", "lead.new", "lead.converted", "forward", "Mark Converted (Pre-Deal)", "تحويل مبدئي", { triggerDealConversion: false }),
      makeWorkflowTransition("tr-l3-2-1", "lead.converted", "lead.new", "backward", "Return to New", "إرجاع لجديد", { allowRollback: true }),
      makeWorkflowTransition("tr-l3-2-3", "lead.converted", "lead.deal", "forward", "Convert to Deal", "ترقية لصفقة", { triggerDealConversion: true }),
      makeWorkflowTransition("tr-l3-3-2", "lead.deal", "lead.converted", "backward", "Locked Rollback", "تراجع مقفل", { allowRollback: false }),
    ],
  },
  {
    id: "wf-lead-standalone-manual", code: "lead.standalone_manual", entityType: "lead",
    nameEn: "Standalone Manual Leads (Decoupled from Deals)", nameAr: "مسار العملاء المستقل (بدون ربط تلقائي بالصفقات)",
    descriptionEn: "Manages leads independently through New → Working → Converted without forcing automatic Deal creation.",
    descriptionAr: "يدير العملاء المحتملين بشكل مستقل تماماً دون إجبار المستخدم على إنشاء صفقة عند التحويل.",
    isActive: false, isTemplate: true, version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "lead.new", labelEn: "New", labelAr: "جديد", sortOrder: 1, category: "todo", winProbabilityPercent: 20, requiredExitFields: [] },
      { stageKey: "lead.working", labelEn: "Working", labelAr: "قيد المتابعة", sortOrder: 2, category: "in_progress", winProbabilityPercent: 50, requiredExitFields: [] },
      { stageKey: "lead.converted", labelEn: "Converted (Standalone)", labelAr: "مكتمل (مستقل)", sortOrder: 3, category: "done", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: false },
    ],
    transitions: [
      makeWorkflowTransition("tr-ls-1-2", "lead.new", "lead.working", "forward", "Start Working", "بدء المتابعة"),
      makeWorkflowTransition("tr-ls-2-1", "lead.working", "lead.new", "backward", "Return to New", "إرجاع لجديد"),
      makeWorkflowTransition("tr-ls-2-3", "lead.working", "lead.converted", "forward", "Complete Lead Manually", "إكمال العميل يدوياً", { triggerDealConversion: false }),
    ],
  },
];
