import {
  makeWorkflowTransition,
  type CrmWorkflowDefinition,
} from "./crmWorkflowRuleCatalogAndEval";

/** Seeded default and template CRM Workflows for Deals (Opportunities) and Leads. */
export const INITIAL_CRM_WORKFLOWS: CrmWorkflowDefinition[] = [
  {
    id: "wf-deal-default", code: "default", entityType: "deal",
    nameEn: "Standard Commercial Pipeline", nameAr: "مسار المبيعات التجاري القياسي",
    descriptionEn: "7-stage B2B sports commercial pipeline with multi-stage directed transitions, Customer Verification gates, and Won/Lost outcomes.",
    descriptionAr: "مسار مبيعات تجاري من 7 مراحل مع انتقالات موجهة متعددة وبوابات التحقق من الحساب والفوز والخسارة.",
    isActive: true, isTemplate: false, industryCategory: "B2B Commercial", version: 2, updatedAtUtc: "2026-01-01T00:00:00.000Z",
    stages: [
      { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, category: "todo", color: "blue", winProbabilityPercent: 10, slaDays: 7, requiredExitFields: [] },
      { stageKey: "default.qualification", labelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2, category: "in_progress", color: "cyan", winProbabilityPercent: 25, slaDays: 10, requiredExitFields: [] },
      { stageKey: "default.solution_fit", labelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3, category: "in_progress", color: "indigo", winProbabilityPercent: 50, slaDays: 14, requiredExitFields: ["solutionFitConfirmed"] },
      { stageKey: "default.proposal", labelEn: "Proposal", labelAr: "عرض السعر", sortOrder: 4, category: "in_progress", color: "violet", winProbabilityPercent: 75, slaDays: 14, requiredExitFields: ["partyId", "estimatedAmount"], requiresVerifiedParty: true },
      { stageKey: "default.negotiation", labelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, category: "in_progress", color: "amber", winProbabilityPercent: 90, slaDays: 21, requiredExitFields: ["partyId", "targetCloseDate"], requiresVerifiedParty: true },
      { stageKey: "default.closed_won", labelEn: "Closed Won", labelAr: "مغلقة ناجحة", sortOrder: 6, category: "done", color: "emerald", winProbabilityPercent: 100, slaDays: 0, requiredExitFields: ["partyId", "closeNotes"], requiresVerifiedParty: true },
      { stageKey: "default.closed_lost", labelEn: "Closed Lost", labelAr: "مغلقة خاسرة", sortOrder: 7, category: "lost", color: "rose", winProbabilityPercent: 0, slaDays: 0, requiredExitFields: ["lossReasonCode"], allowInboundFromAny: true },
    ],
    transitions: [
      makeWorkflowTransition("tr-deal-disc-qual", "default.discovery", "default.qualification", "forward", "Qualify Deal", "تأهيل الصفقة", { domainEventKey: "DealQualifiedEvent", properties: { sourcePort: "right-2", targetPort: "left-2" } }),
      makeWorkflowTransition("tr-deal-qual-disc", "default.qualification", "default.discovery", "backward", "Return to Discovery", "إرجاع للاستكشاف", { promptForComment: false, domainEventKey: "DealReturnedEvent", properties: { sourcePort: "bottom-2", targetPort: "bottom-2" } }),
      makeWorkflowTransition("tr-deal-qual-sol", "default.qualification", "default.solution_fit", "forward", "Confirm Solution Fit", "تأكيد ملاءمة الحل", { domainEventKey: "SolutionFitConfirmedEvent", properties: { sourcePort: "right-2", targetPort: "left-2" } }),
      makeWorkflowTransition("tr-deal-sol-prop", "default.solution_fit", "default.proposal", "forward", "Submit Proposal", "تقديم عرض السعر", { requireVerifiedParty: true, requireEstimatedAmountPositive: true, requiredFieldKeys: ["solutionFitConfirmed", "partyId", "estimatedAmount"], autoCreateWorkTask: true, domainEventKey: "ProposalSubmittedEvent", properties: { sourcePort: "right-2", targetPort: "left-2" } }),
      makeWorkflowTransition("tr-deal-prop-neg", "default.proposal", "default.negotiation", "forward", "Enter Negotiation", "بدء التفاوض", { requireVerifiedParty: true, requireEstimatedAmountPositive: true, requireTargetCloseDate: true, requiredFieldKeys: ["partyId", "targetCloseDate"], domainEventKey: "NegotiationStartedEvent", properties: { sourcePort: "right-2", targetPort: "left-2" } }),
      makeWorkflowTransition("tr-deal-neg-prop", "default.negotiation", "default.proposal", "backward", "Revise Proposal", "مراجعة العرض", { promptForComment: false, requireVerifiedParty: true, requireEstimatedAmountPositive: true, requiredFieldKeys: ["partyId"], domainEventKey: "ProposalRevisedEvent", properties: { sourcePort: "bottom-2", targetPort: "bottom-2" } }),
      makeWorkflowTransition("tr-deal-neg-won", "default.negotiation", "default.closed_won", "forward", "Close as Won", "إغلاق كصفقة رابحة", { allowRollback: false, promptForComment: false, promptFields: ["closeNotes"], requireVerifiedParty: true, requireEstimatedAmountPositive: true, requiredFieldKeys: ["partyId"], fromStageKeys: ["default.solution_fit", "default.proposal", "default.negotiation"], domainEventKey: "DealWonEvent", properties: { sourcePort: "right-2", targetPort: "left-2" } }),
      makeWorkflowTransition("tr-deal-any-lost", "*", "default.closed_lost", "global", "Close as Lost", "إغلاق كخسارة", { allowRollback: false, promptFields: ["lossReasonCode", "closeNotes"], requiredFieldKeys: ["lossReasonCode"], domainEventKey: "DealLostEvent", properties: { sourcePort: "right-3", targetPort: "left-2" } }),
      makeWorkflowTransition("tr-deal-lost-disc", "default.closed_lost", "default.discovery", "backward", "Reopen Deal", "إعادة فتح الصفقة", { allowRollback: true, promptForComment: true, promptFields: ["reason", "stageTransitionNote"], domainEventKey: "DealReopenedEvent", properties: { sourcePort: "bottom-2", targetPort: "bottom-1" } }),
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
      makeWorkflowTransition("tr-ft-2-1", "default.proposal", "default.discovery", "backward", "Return to Pitch", "إرجاع للعرض", { promptForComment: false }),
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
      { stageKey: "lead.disqualified", labelEn: "Disqualified", labelAr: "مستبعد", sortOrder: 5, category: "lost", color: "rose", winProbabilityPercent: 0, requiredExitFields: ["disqualificationReasonCode"], allowInboundFromAny: true },
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

/** Canonical fallback Arabic labels for standard pipeline and workflow stages. */
export const CANONICAL_STAGE_AR_MAP: Record<string, string> = {
  "default.discovery": "الاستكشاف",
  "default.qualification": "التأهيل",
  "default.solution_fit": "ملاءمة الحل",
  "default.proposal": "عرض السعر",
  "default.negotiation": "التفاوض",
  "default.closed_won": "صفقة رابحة",
  "default.closed_lost": "صفقة خاسرة",
  "lead.new": "عميل جديد",
  "lead.working": "قيد المتابعة",
  "lead.qualified": "مؤهل",
  "lead.converted": "تم التحويل لصفقة",
  "lead.disqualified": "مستبعد",
  "discovery": "الاستكشاف",
  "qualification": "التأهيل",
  "solution_fit": "ملاءمة الحل",
  "proposal": "عرض السعر",
  "negotiation": "التفاوض",
  "closed_won": "صفقة رابحة",
  "closed_lost": "صفقة خاسرة",
  "new": "عميل جديد",
  "working": "قيد المتابعة",
  "qualified": "مؤهل",
  "converted": "تم التحويل",
  "disqualified": "مستبعد",
};

/** Resolves a robust Arabic stage label fallback so backend hydration never overwrites Arabic with English. */
export function getCanonicalStageArFallback(stageKey?: string, labelEn?: string): string {
  const normKey = (stageKey || "").toLowerCase();
  if (CANONICAL_STAGE_AR_MAP[normKey]) return CANONICAL_STAGE_AR_MAP[normKey];
  for (const [k, v] of Object.entries(CANONICAL_STAGE_AR_MAP)) {
    if (normKey.includes(k) || (labelEn && labelEn.toLowerCase().includes(k))) return v;
  }
  const normLabel = (labelEn || "").toLowerCase();
  if (normLabel.includes("discovery") || normLabel.includes("pitch")) return "الاستكشاف";
  if (normLabel.includes("qualification")) return "التأهيل";
  if (normLabel.includes("solution")) return "ملاءمة الحل";
  if (normLabel.includes("proposal") || normLabel.includes("quote")) return "عرض السعر";
  if (normLabel.includes("negotiation")) return "التفاوض";
  if (normLabel.includes("won") || normLabel.includes("closing")) return "صفقة رابحة";
  if (normLabel.includes("lost")) return "صفقة خاسرة";
  if (normLabel.includes("new")) return "عميل جديد";
  if (normLabel.includes("work")) return "قيد المتابعة";
  if (normLabel.includes("convert")) return "تم التحويل";
  return labelEn || stageKey || "";
}

/** Canonical fallback Arabic names for standard CRM pipelines. */
export const CANONICAL_PIPELINE_AR_MAP: Record<string, string> = {
  "default": "مسار المبيعات التجاري القياسي",
  "standard commercial pipeline": "مسار المبيعات التجاري القياسي",
  "standard lead qualification pipeline": "مسار تأهيل العملاء القياسي",
  "deal.fast_track": "مسار الصفقات السريع",
  "deal.sports_sponsorship": "مسار الرعايات الرياضية وحقوق التسمية",
};

/** Resolves a robust Arabic pipeline name fallback. */
export function getCanonicalPipelineNameAr(code?: string, nameEn?: string): string {
  const normCode = (code || "").toLowerCase();
  const normName = (nameEn || "").toLowerCase();
  if (CANONICAL_PIPELINE_AR_MAP[normCode]) return CANONICAL_PIPELINE_AR_MAP[normCode];
  if (CANONICAL_PIPELINE_AR_MAP[normName]) return CANONICAL_PIPELINE_AR_MAP[normName];
  if (normName.includes("lead")) return "مسار تأهيل العملاء القياسي";
  if (normName.includes("sponsorship")) return "مسار الرعايات الرياضية";
  if (normName.includes("fast")) return "مسار الصفقات السريع";
  if (normName.includes("commercial") || normName.includes("pipeline") || normName.includes("deal")) return "مسار المبيعات التجاري القياسي";
  return nameEn || "";
}
