export * from "./crmWorkflowGovernanceCatalog";
export * from "./crmWorkflowColorPalette";
export * from "./crmWorkflowRuleCatalogAndEval";

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
    estimatedAmount?: number | null;
    targetCloseDate?: string | null;
    hasOpenSubtasks?: boolean;
    hasManagerApproval?: boolean;
    actorUserId?: string;
    lastMovedByUserId?: string;
    contactRoles?: string[];
  }
): EvaluatedWorkflowTransition {
  const normFrom = normalizeStageKeyForMatch(fromStageKey);
  const normTo = normalizeStageKeyForMatch(toStageKey);
  const fromStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normFrom);
  const toStage = wf.stages.find((s) => normalizeStageKeyForMatch(s.stageKey) === normTo);
  const isBackward = Boolean(fromStage && toStage && toStage.sortOrder < fromStage.sortOrder);

  const directMatch = wf.transitions.find(
    (t) => transitionMatchesSourceStage(t, fromStageKey) && normalizeStageKeyForMatch(t.toStageKey) === normTo
  );
  const anyMatch = wf.transitions.find(
    (t) => (t.fromStageKey === "*" || t.fromStageKeys?.includes("*") || toStage?.allowInboundFromAny) && normalizeStageKeyForMatch(t.toStageKey) === normTo
  );
  const matched = directMatch ?? anyMatch;

  const block = (msg: string, requiredFields: string[] = [], approvalRequirement?: EvaluatedWorkflowTransition["approvalRequirement"]): EvaluatedWorkflowTransition => ({
    allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage,
    shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields, promptForComment: false, isBackward, approvalRequirement,
  });

  if (!matched) {
    return block(
      isBackward
        ? `Rollback from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" is disabled in active workflow "${wf.nameEn}".`
        : `No configured transition from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" in active workflow "${wf.nameEn}".`
    );
  }
  if (!matched.rules.allowRollback) return block(`Transition "${matched.nameEn}" is restricted or locked in active workflow "${wf.nameEn}".`);

  const catalogRules = matched.catalogRules ?? [];
  let approvalRequirement: EvaluatedWorkflowTransition["approvalRequirement"] = undefined;
  const dynamicPromptedFields: string[] = [];

  for (const cRule of catalogRules) {
    if (cRule.ruleTypeKey === "restrict.api_only") return block(`Transition "${matched.nameEn}" is restricted to automated API/system events only.`);
    if (cRule.ruleTypeKey === "restrict.approval_required") {
      const roles = (cRule.config?.principals || cRule.config?.approverRole || "role:sales_manager").split(",").map((s) => s.trim()).filter(Boolean);
      approvalRequirement = { required: true, roles, quorum: cRule.config?.quorum === "all" ? "all" : "any" };
      if (recordContext?.hasManagerApproval === false) return block(`Transition "${matched.nameEn}" is blocked until Approval (${roles.join(", ")}) is granted.`, [], approvalRequirement);
    }
    if (cRule.ruleTypeKey === "restrict.approval_matrix") {
      const t1Min = Number(cRule.config?.tier1MinAmount ?? 100000);
      const t1Roles = (cRule.config?.tier1Roles || "role:sales_manager").split(",").map((s) => s.trim()).filter(Boolean);
      const t2Min = Number(cRule.config?.tier2MinAmount ?? 500000);
      const t2Roles = (cRule.config?.tier2Roles || "role:commercial_director,role:finance_controller").split(",").map((s) => s.trim()).filter(Boolean);
      const amt = recordContext?.estimatedAmount ?? t1Min;
      if (amt >= t2Min) approvalRequirement = { required: true, roles: t2Roles, quorum: cRule.config?.quorum === "any" ? "any" : "all", matchedTierLabel: `Tier 2 (>= ${t2Min.toLocaleString()})` };
      else if (amt >= t1Min) approvalRequirement = { required: true, roles: t1Roles, quorum: "any", matchedTierLabel: `Tier 1 (>= ${t1Min.toLocaleString()})` };
      if (approvalRequirement?.required && recordContext?.hasManagerApproval === false) return block(`Transition "${matched.nameEn}" requires ${approvalRequirement.matchedTierLabel} approval (${approvalRequirement.roles.join(", ")}).`, [], approvalRequirement);
    }
    if (cRule.ruleTypeKey === "restrict.subtasks_completed" && recordContext?.hasOpenSubtasks === true) return block(`Transition "${matched.nameEn}" is blocked because open subtasks or activities remain incomplete.`);
    if (cRule.ruleTypeKey === "restrict.separation_of_duties" && recordContext?.actorUserId && recordContext?.lastMovedByUserId && recordContext.actorUserId === recordContext.lastMovedByUserId) {
      return block(`Four-Eyes Principle: the user who performed the previous stage move cannot execute "${matched.nameEn}".`);
    }
    if (cRule.ruleTypeKey === "input.prompt_fields" && cRule.config?.fields) dynamicPromptedFields.push(...cRule.config.fields.split(",").map((s) => s.trim()).filter(Boolean));
    if (cRule.ruleTypeKey === "validate.buying_committee_role") {
      dynamicPromptedFields.push("primaryContactRole");
      if (recordContext?.contactRoles) {
        const reqRole = (cRule.config?.requiredRoles || cRule.config?.requiredRole || cRule.config?.role || "DecisionMaker").split(",")[0].trim();
        if (!recordContext.contactRoles.includes(reqRole)) return block(`A Buying Committee Contact with role "${reqRole}" must be linked before executing "${matched.nameEn}".`, [`contactRole:${reqRole}`]);
      }
    }
  }

  const requiresParty = matched.rules.requireVerifiedParty || toStage?.requiresVerifiedParty || catalogRules.some((r) => r.ruleTypeKey === "validate.verified_party");
  if (recordContext && requiresParty && recordContext.hasVerifiedParty === false) {
    return block(`A verified Company Account or Contact must be linked before moving to "${toStage?.labelEn || toStageKey}".`, ["partyId"], approvalRequirement);
  }

  const hasFinancialRule = catalogRules.some((r) => r.ruleTypeKey === "validate.financial_forecast");
  const requiredFields = Array.from(
    new Set([
      ...(fromStage?.requiredExitFields ?? []), ...matched.rules.requiredFieldKeys, ...matched.rules.promptFields, ...dynamicPromptedFields,
      ...(requiresParty ? ["partyId"] : []),
      ...(matched.rules.requireEstimatedAmountPositive || hasFinancialRule ? ["estimatedAmount"] : []),
      ...(matched.rules.requireTargetCloseDate || hasFinancialRule ? ["targetCloseDate"] : []),
    ])
  );
  const shouldConvert = Boolean(matched.rules.triggerDealConversion || catalogRules.some((r) => r.ruleTypeKey === "action.convert_lead_to_deal") || (!isBackward && toStage?.triggerDealConversion));
  const promptComment = Boolean(matched.rules.promptForComment || catalogRules.some((r) => r.ruleTypeKey === "input.require_reason_and_note") || isBackward);

  return {
    allowed: true, matchedTransition: matched, targetStage: toStage,
    shouldTriggerDealConversion: shouldConvert, triggerDealConversion: shouldConvert,
    requiredFields, promptForComment: promptComment, isBackward,
    domainEventKey: matched.domainEventKey ?? (shouldConvert ? "LeadConvertedEvent" : "GenericEvent"),
    postActions: catalogRules.filter((r) => r.category === "actions").map((r) => r.ruleTypeKey),
    approvalRequirement,
  };
}

/** Seeded default and template CRM Workflows for Deals (Opportunities) and Leads. */
export const INITIAL_CRM_WORKFLOWS: CrmWorkflowDefinition[] = [
  {
    id: "wf-deal-default", code: "default", entityType: "deal",
    nameEn: "Standard Commercial Pipeline", nameAr: "مسار المبيعات التجاري القياسي",
    descriptionEn: "5-stage B2B sports commercial pipeline with multi-stage directed transitions and Customer Verification gates.",
    descriptionAr: "مسار مبيعات تجاري من 5 مراحل مع انتقالات موجهة متعددة وبوابة التحقق من الحساب.",
    isActive: true, isTemplate: false, industryCategory: "B2B Commercial", version: 2, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 10, slaDays: 7, requiredExitFields: [] },
      { stageKey: "default.qualification", labelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2, category: "in_progress", color: "cyan", winProbabilityPercent: 25, slaDays: 10, requiredExitFields: [] },
      { stageKey: "default.solution_fit", labelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3, category: "in_progress", color: "indigo", winProbabilityPercent: 50, slaDays: 14, requiredExitFields: ["solutionFitConfirmed"] },
      { stageKey: "default.proposal", labelEn: "Proposal", labelAr: "عرض السعر", sortOrder: 4, category: "in_progress", color: "violet", winProbabilityPercent: 75, slaDays: 14, requiredExitFields: ["partyId", "estimatedAmount"], requiresVerifiedParty: true },
      { stageKey: "default.negotiation", labelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, category: "in_progress", color: "amber", winProbabilityPercent: 90, slaDays: 21, requiredExitFields: ["partyId", "targetCloseDate"], requiresVerifiedParty: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-deal-1-2", "default.discovery", "default.qualification", "forward", "Qualify Deal", "تأهيل الصفقة"),
      makeWorkflowTransition("tr-deal-2-1", "default.qualification", "default.discovery", "backward", "Return to Discovery", "إرجاع للاستكشاف", { promptForComment: true }),
      makeWorkflowTransition("tr-deal-2-3", "default.qualification", "default.solution_fit", "forward", "Confirm Solution Fit", "تأكيد ملاءمة الحل"),
      makeWorkflowTransition("tr-deal-3-2", "default.solution_fit", "default.qualification", "backward", "Re-Qualify", "إعادة التأهيل", { promptForComment: true }),
      makeWorkflowTransition("tr-deal-3-4", "default.solution_fit", "default.proposal", "forward", "Submit Proposal", "تقديم العرض", { requireVerifiedParty: true, requiredFieldKeys: ["solutionFitConfirmed", "partyId"], domainEventKey: "ProposalSubmittedEvent" }),
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
    isActive: false, isTemplate: true, industryCategory: "Express Sponsorship", version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "default.discovery", labelEn: "Pitch & Qualification", labelAr: "العرض والتأهيل", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 35, slaDays: 5, requiredExitFields: ["estimatedAmount"] },
      { stageKey: "default.proposal", labelEn: "Contract Closing", labelAr: "إغلاق العقد", sortOrder: 2, category: "in_progress", color: "violet", winProbabilityPercent: 85, slaDays: 7, requiredExitFields: ["partyId", "targetCloseDate"], requiresVerifiedParty: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-ft-1-2", "default.discovery", "default.proposal", "forward", "Advance to Closing", "الانتقال للإغلاق", { requireVerifiedParty: true, requireEstimatedAmountPositive: true, requiredFieldKeys: ["partyId", "estimatedAmount"] }),
      makeWorkflowTransition("tr-ft-2-1", "default.proposal", "default.discovery", "backward", "Return to Pitch", "إرجاع للعرض", { promptForComment: true }),
    ],
  },
  {
    id: "wf-deal-sponsorship", code: "deal.sports_sponsorship", entityType: "deal",
    nameEn: "Sports Brand Sponsorship & Naming Rights", nameAr: "مسار الرعايات الرياضية وحقوق التسمية",
    descriptionEn: "4-stage sports sponsorship workflow with Rights Inventory Valuation, Brand Deck Pitch, Legal & Exclusivity Clearance, and Signing.",
    descriptionAr: "مسار متخصص للرعايات الرياضية وحقوق البث والتسمية من 4 مراحل مع بوابات التدقيق القانوني.",
    isActive: false, isTemplate: true, industryCategory: "Sports Sponsorship", version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "default.discovery", labelEn: "Rights Inventory Match", labelAr: "مطابقة أصول الرعاية", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 15, slaDays: 7, requiredExitFields: [] },
      { stageKey: "default.qualification", labelEn: "Brand Deck & Valuation", labelAr: "تقديم ملف الرعاية والتقييم", sortOrder: 2, category: "in_progress", color: "cyan", winProbabilityPercent: 45, slaDays: 10, requiredExitFields: ["estimatedAmount"] },
      { stageKey: "default.proposal", labelEn: "Category Exclusivity & Legal", labelAr: "الحصرية والمراجعة القانونية", sortOrder: 3, category: "in_progress", color: "violet", winProbabilityPercent: 75, slaDays: 14, requiredExitFields: ["partyId", "estimatedAmount"], requiresVerifiedParty: true },
      { stageKey: "default.negotiation", labelEn: "Board Sign-Off & Activation", labelAr: "اعتماد مجلس الإدارة والتفعيل", sortOrder: 4, category: "in_progress", color: "amber", winProbabilityPercent: 95, slaDays: 10, requiredExitFields: ["partyId", "targetCloseDate"], requiresVerifiedParty: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-sp-1-2", "default.discovery", "default.qualification", "forward", "Present Sponsorship Deck", "تقديم عرض الرعاية"),
      makeWorkflowTransition("tr-sp-2-3", "default.qualification", "default.proposal", "forward", "Submit Term Sheet", "تقديم مسودة الشروط", { requireVerifiedParty: true, requireEstimatedAmountPositive: true, fromStageKeys: ["default.discovery", "default.qualification"] }),
      makeWorkflowTransition("tr-sp-3-4", "default.proposal", "default.negotiation", "forward", "Send to Board Approval", "إرسال لاعتماد المجلس", { requireVerifiedParty: true, requireTargetCloseDate: true }),
      makeWorkflowTransition("tr-sp-4-3", "default.negotiation", "default.proposal", "backward", "Revise Exclusivity Terms", "تعديل شروط الحصرية", { promptForComment: true }),
    ],
  },
  {
    id: "wf-deal-venue-booking", code: "deal.venue_block_booking", entityType: "deal",
    nameEn: "Corporate Venue & Stadium Block Booking", nameAr: "مسار حجوزات الملاعب والفعاليات الكبرى",
    descriptionEn: "3-stage facility block booking workflow covering Schedule Conflict Check, Deposit & Security Quote, and Final Facility Allocation.",
    descriptionAr: "مسار حجوزات المنشآت والبطولات من 3 مراحل يشمل فحص التعارض، الدفعة المقدمة، والتخصيص النهائي.",
    isActive: false, isTemplate: true, industryCategory: "Venue Operations", version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "default.discovery", labelEn: "Topology & Slot Check", labelAr: "فحص توافر الملاعب", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 25, slaDays: 3, requiredExitFields: [] },
      { stageKey: "default.proposal", labelEn: "Deposit & Catering Quote", labelAr: "عرض السعر والتأمين", sortOrder: 2, category: "in_progress", color: "violet", winProbabilityPercent: 65, slaDays: 7, requiredExitFields: ["partyId", "estimatedAmount"], requiresVerifiedParty: true },
      { stageKey: "default.negotiation", labelEn: "Contract & Pitch Lock", labelAr: "تأكيد العقد وحجز الملعب", sortOrder: 3, category: "in_progress", color: "amber", winProbabilityPercent: 90, slaDays: 5, requiredExitFields: ["partyId", "targetCloseDate"], requiresVerifiedParty: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-vb-1-2", "default.discovery", "default.proposal", "forward", "Issue Venue Quote", "إصدار عرض حجز المنشأة", { requireVerifiedParty: true }),
      makeWorkflowTransition("tr-vb-2-3", "default.proposal", "default.negotiation", "forward", "Confirm Deposit & Lock Pitch", "تأكيد الدفعة وحجز الملعب", { requireVerifiedParty: true, requireEstimatedAmountPositive: true }),
      makeWorkflowTransition("tr-vb-3-2", "default.negotiation", "default.proposal", "backward", "Adjust Booking Dates", "تعديل مواعيد الحجز", { promptForComment: true }),
    ],
  },
  {
    id: "wf-lead-default", code: "lead.default", entityType: "lead",
    nameEn: "Standard Leads Qualification Workflow", nameAr: "مسار تأهيل العملاء المحتملين القياسي",
    descriptionEn: "5-status lead qualification flow with bidirectional transitions and automatic Deal conversion on Converted.",
    descriptionAr: "مسار تأهيل العملاء المحتملين مع انتقالات ثنائية الاتجاه وتحويل تلقائي لصفقة عند التحويل.",
    isActive: true, isTemplate: false, industryCategory: "B2B Commercial", version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "lead.new", labelEn: "New Intake", labelAr: "جديد", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 10, slaDays: 2, requiredExitFields: [] },
      { stageKey: "lead.working", labelEn: "Working (In Progress)", labelAr: "قيد المتابعة", sortOrder: 2, category: "in_progress", color: "cyan", winProbabilityPercent: 30, slaDays: 5, requiredExitFields: [] },
      { stageKey: "lead.qualified", labelEn: "Qualified", labelAr: "مؤهل", sortOrder: 3, category: "in_progress", color: "indigo", winProbabilityPercent: 60, slaDays: 7, requiredExitFields: ["qualificationNotes"] },
      { stageKey: "lead.converted", labelEn: "Converted to Deal", labelAr: "تم التحويل", sortOrder: 4, category: "done", color: "emerald", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: true },
      { stageKey: "lead.disqualified", labelEn: "Disqualified", labelAr: "مستبعد", sortOrder: 5, category: "done", color: "rose", winProbabilityPercent: 0, requiredExitFields: ["disqualificationReasonCode"], allowInboundFromAny: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-lead-1-2", "lead.new", "lead.working", "forward", "Start Working", "بدء المتابعة"),
      makeWorkflowTransition("tr-lead-2-1", "lead.working", "lead.new", "backward", "Return to New", "إرجاع لجديد"),
      makeWorkflowTransition("tr-lead-2-3", "lead.working", "lead.qualified", "forward", "Qualify Lead", "تأهيل العميل", { promptFields: ["qualificationNotes"] }),
      makeWorkflowTransition("tr-lead-3-2", "lead.qualified", "lead.working", "backward", "Return to Working", "إرجاع للمتابعة"),
      makeWorkflowTransition("tr-lead-3-4", "lead.qualified", "lead.converted", "forward", "Convert to Deal", "تحويل لصفقة", { triggerDealConversion: true, domainEventKey: "LeadConvertedEvent" }),
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
    isActive: false, isTemplate: true, industryCategory: "Express Intake", version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "lead.new", labelEn: "New", labelAr: "جديد", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 25, requiredExitFields: [] },
      { stageKey: "lead.converted", labelEn: "Converted", labelAr: "تم التحويل", sortOrder: 2, category: "done", color: "emerald", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: true },
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
    isActive: false, isTemplate: true, industryCategory: "Academy & Trials", version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "lead.new", labelEn: "New", labelAr: "جديد", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 20, requiredExitFields: [] },
      { stageKey: "lead.converted", labelEn: "Converted", labelAr: "محول مبدئياً", sortOrder: 2, category: "in_progress", color: "cyan", winProbabilityPercent: 65, requiredExitFields: [], triggerDealConversion: false },
      { stageKey: "lead.deal", labelEn: "Deal", labelAr: "صفقة", sortOrder: 3, category: "done", color: "emerald", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: true },
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
    isActive: false, isTemplate: true, industryCategory: "Standalone Intake", version: 1, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "lead.new", labelEn: "New", labelAr: "جديد", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 20, requiredExitFields: [] },
      { stageKey: "lead.working", labelEn: "Working", labelAr: "قيد المتابعة", sortOrder: 2, category: "in_progress", color: "cyan", winProbabilityPercent: 50, requiredExitFields: [] },
      { stageKey: "lead.converted", labelEn: "Converted (Standalone)", labelAr: "مكتمل (مستقل)", sortOrder: 3, category: "done", color: "emerald", winProbabilityPercent: 100, requiredExitFields: [], triggerDealConversion: false },
    ],
    transitions: [
      makeWorkflowTransition("tr-ls-1-2", "lead.new", "lead.working", "forward", "Start Working", "بدء المتابعة"),
      makeWorkflowTransition("tr-ls-2-1", "lead.working", "lead.new", "backward", "Return to New", "إرجاع لجديد"),
      makeWorkflowTransition("tr-ls-2-3", "lead.working", "lead.converted", "forward", "Complete Lead Manually", "إكمال العميل يدوياً", { triggerDealConversion: false }),
    ],
  },
];
