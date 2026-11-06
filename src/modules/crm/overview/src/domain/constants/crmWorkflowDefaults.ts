export * from "./crmWorkflowGovernanceCatalog";

/** Entity types supported by the CRM Workflow Engine. */
export type CrmWorkflowEntityType = "deal" | "lead";
/** Visual and lifecycle category of a workflow stage node. */
export type CrmWorkflowStageCategory = "todo" | "in_progress" | "done" | "lost";
/** Semantic color token configurable per stage across Deals & Leads workflows, minimap, and Kanban columns (19 curated tokens). */
export type CrmStageColorToken =
  | "slate"
  | "zinc"
  | "blue"
  | "sky"
  | "cyan"
  | "teal"
  | "emerald"
  | "green"
  | "lime"
  | "amber"
  | "orange"
  | "coral"
  | "rose"
  | "crimson"
  | "pink"
  | "fuchsia"
  | "purple"
  | "violet"
  | "indigo";

/** Ordered list of 19 semantic stage color tokens for the Status Inspector swatch picker. */
export const CRM_STAGE_COLOR_TOKENS: CrmStageColorToken[] = [
  "slate",
  "zinc",
  "blue",
  "sky",
  "cyan",
  "teal",
  "emerald",
  "green",
  "lime",
  "amber",
  "orange",
  "coral",
  "rose",
  "crimson",
  "pink",
  "fuchsia",
  "purple",
  "violet",
  "indigo",
];

/** Semantic styling classes for each of the 19 stage color tokens (Dark & Light safe). */
export const STAGE_COLOR_PALETTE: Record<
  CrmStageColorToken,
  {
    labelEn: string;
    swatchClass: string;
    borderClass: string;
    badgeClass: string;
    headerBorderClass: string;
    dotClass: string;
    minimapClass: string;
    accentBarClass: string;
  }
> = {
  slate: {
    labelEn: "Slate",
    swatchClass: "bg-slate-500",
    borderClass: "border-nx-line bg-nx-surface hover:border-nx-line-hi",
    badgeClass: "border-nx-line bg-nx-raised text-nx-ink-2",
    headerBorderClass: "border-t-2 border-t-slate-400/70",
    dotClass: "bg-slate-400",
    minimapClass: "border-slate-400/60 bg-slate-500/25",
    accentBarClass: "bg-slate-400/70",
  },
  zinc: {
    labelEn: "Zinc",
    swatchClass: "bg-zinc-500",
    borderClass: "border-zinc-500/45 bg-zinc-500/[0.04] hover:border-zinc-500/70",
    badgeClass: "border-zinc-500/40 bg-zinc-500/15 text-zinc-400",
    headerBorderClass: "border-t-2 border-t-zinc-400/80",
    dotClass: "bg-zinc-400",
    minimapClass: "border-zinc-400/60 bg-zinc-500/25",
    accentBarClass: "bg-zinc-400",
  },
  blue: {
    labelEn: "Blue",
    swatchClass: "bg-blue-500",
    borderClass: "border-blue-500/45 bg-blue-500/[0.04] hover:border-blue-500/70",
    badgeClass: "border-blue-500/40 bg-blue-500/15 text-blue-400",
    headerBorderClass: "border-t-2 border-t-blue-500/80",
    dotClass: "bg-blue-500",
    minimapClass: "border-blue-500/60 bg-blue-500/25",
    accentBarClass: "bg-blue-500",
  },
  sky: {
    labelEn: "Sky",
    swatchClass: "bg-sky-500",
    borderClass: "border-sky-500/45 bg-sky-500/[0.04] hover:border-sky-500/70",
    badgeClass: "border-sky-500/40 bg-sky-500/15 text-sky-400",
    headerBorderClass: "border-t-2 border-t-sky-500/80",
    dotClass: "bg-sky-500",
    minimapClass: "border-sky-500/60 bg-sky-500/25",
    accentBarClass: "bg-sky-500",
  },
  cyan: {
    labelEn: "Cyan",
    swatchClass: "bg-cyan-500",
    borderClass: "border-cyan-500/45 bg-cyan-500/[0.04] hover:border-cyan-500/70",
    badgeClass: "border-cyan-500/40 bg-cyan-500/15 text-cyan-400",
    headerBorderClass: "border-t-2 border-t-cyan-500/80",
    dotClass: "bg-cyan-500",
    minimapClass: "border-cyan-500/60 bg-cyan-500/25",
    accentBarClass: "bg-cyan-500",
  },
  teal: {
    labelEn: "Teal",
    swatchClass: "bg-teal-500",
    borderClass: "border-teal-500/45 bg-teal-500/[0.04] hover:border-teal-500/70",
    badgeClass: "border-teal-500/40 bg-teal-500/15 text-teal-400",
    headerBorderClass: "border-t-2 border-t-teal-500/80",
    dotClass: "bg-teal-500",
    minimapClass: "border-teal-500/60 bg-teal-500/25",
    accentBarClass: "bg-teal-500",
  },
  emerald: {
    labelEn: "Emerald",
    swatchClass: "bg-emerald-500",
    borderClass: "border-success/50 bg-success/[0.05] hover:border-success/80",
    badgeClass: "border-success/40 bg-success/15 text-success",
    headerBorderClass: "border-t-2 border-t-success",
    dotClass: "bg-success",
    minimapClass: "border-success/60 bg-success/25",
    accentBarClass: "bg-success",
  },
  green: {
    labelEn: "Green",
    swatchClass: "bg-green-500",
    borderClass: "border-green-500/45 bg-green-500/[0.04] hover:border-green-500/70",
    badgeClass: "border-green-500/40 bg-green-500/15 text-green-400",
    headerBorderClass: "border-t-2 border-t-green-500/80",
    dotClass: "bg-green-500",
    minimapClass: "border-green-500/60 bg-green-500/25",
    accentBarClass: "bg-green-500",
  },
  lime: {
    labelEn: "Lime",
    swatchClass: "bg-lime-500",
    borderClass: "border-lime-500/45 bg-lime-500/[0.04] hover:border-lime-500/70",
    badgeClass: "border-lime-500/40 bg-lime-500/15 text-lime-400",
    headerBorderClass: "border-t-2 border-t-lime-500/80",
    dotClass: "bg-lime-500",
    minimapClass: "border-lime-500/60 bg-lime-500/25",
    accentBarClass: "bg-lime-500",
  },
  amber: {
    labelEn: "Amber",
    swatchClass: "bg-amber-500",
    borderClass: "border-warning/50 bg-warning/[0.05] hover:border-warning/80",
    badgeClass: "border-warning/40 bg-warning/15 text-warning",
    headerBorderClass: "border-t-2 border-t-warning",
    dotClass: "bg-warning",
    minimapClass: "border-warning/60 bg-warning/25",
    accentBarClass: "bg-warning",
  },
  orange: {
    labelEn: "Orange",
    swatchClass: "bg-orange-500",
    borderClass: "border-orange-500/45 bg-orange-500/[0.04] hover:border-orange-500/70",
    badgeClass: "border-orange-500/40 bg-orange-500/15 text-orange-400",
    headerBorderClass: "border-t-2 border-t-orange-500/80",
    dotClass: "bg-orange-500",
    minimapClass: "border-orange-500/60 bg-orange-500/25",
    accentBarClass: "bg-orange-500",
  },
  coral: {
    labelEn: "Coral",
    swatchClass: "bg-red-400",
    borderClass: "border-red-400/45 bg-red-400/[0.04] hover:border-red-400/70",
    badgeClass: "border-red-400/40 bg-red-400/15 text-red-400",
    headerBorderClass: "border-t-2 border-t-red-400/80",
    dotClass: "bg-red-400",
    minimapClass: "border-red-400/60 bg-red-400/25",
    accentBarClass: "bg-red-400",
  },
  rose: {
    labelEn: "Rose",
    swatchClass: "bg-rose-500",
    borderClass: "border-destructive/50 bg-destructive/[0.05] hover:border-destructive/80",
    badgeClass: "border-destructive/40 bg-destructive/15 text-destructive",
    headerBorderClass: "border-t-2 border-t-destructive",
    dotClass: "bg-destructive",
    minimapClass: "border-destructive/60 bg-destructive/25",
    accentBarClass: "bg-destructive",
  },
  crimson: {
    labelEn: "Crimson",
    swatchClass: "bg-red-600",
    borderClass: "border-red-600/45 bg-red-600/[0.04] hover:border-red-600/70",
    badgeClass: "border-red-600/40 bg-red-600/15 text-red-500",
    headerBorderClass: "border-t-2 border-t-red-600/80",
    dotClass: "bg-red-600",
    minimapClass: "border-red-600/60 bg-red-600/25",
    accentBarClass: "bg-red-600",
  },
  pink: {
    labelEn: "Pink",
    swatchClass: "bg-pink-500",
    borderClass: "border-pink-500/45 bg-pink-500/[0.04] hover:border-pink-500/70",
    badgeClass: "border-pink-500/40 bg-pink-500/15 text-pink-400",
    headerBorderClass: "border-t-2 border-t-pink-500/80",
    dotClass: "bg-pink-500",
    minimapClass: "border-pink-500/60 bg-pink-500/25",
    accentBarClass: "bg-pink-500",
  },
  fuchsia: {
    labelEn: "Fuchsia",
    swatchClass: "bg-fuchsia-500",
    borderClass: "border-fuchsia-500/45 bg-fuchsia-500/[0.04] hover:border-fuchsia-500/70",
    badgeClass: "border-fuchsia-500/40 bg-fuchsia-500/15 text-fuchsia-400",
    headerBorderClass: "border-t-2 border-t-fuchsia-500/80",
    dotClass: "bg-fuchsia-500",
    minimapClass: "border-fuchsia-500/60 bg-fuchsia-500/25",
    accentBarClass: "bg-fuchsia-500",
  },
  purple: {
    labelEn: "Purple",
    swatchClass: "bg-purple-500",
    borderClass: "border-purple-500/45 bg-purple-500/[0.04] hover:border-purple-500/70",
    badgeClass: "border-purple-500/40 bg-purple-500/15 text-purple-400",
    headerBorderClass: "border-t-2 border-t-purple-500/80",
    dotClass: "bg-purple-500",
    minimapClass: "border-purple-500/60 bg-purple-500/25",
    accentBarClass: "bg-purple-500",
  },
  violet: {
    labelEn: "Violet",
    swatchClass: "bg-violet-500",
    borderClass: "border-violet-500/45 bg-violet-500/[0.04] hover:border-violet-500/70",
    badgeClass: "border-violet-500/40 bg-violet-500/15 text-violet-400",
    headerBorderClass: "border-t-2 border-t-violet-500/80",
    dotClass: "bg-violet-500",
    minimapClass: "border-violet-500/60 bg-violet-500/25",
    accentBarClass: "bg-violet-500",
  },
  indigo: {
    labelEn: "Indigo",
    swatchClass: "bg-indigo-500",
    borderClass: "border-indigo-500/45 bg-indigo-500/[0.04] hover:border-indigo-500/70",
    badgeClass: "border-indigo-500/40 bg-indigo-500/15 text-indigo-400",
    headerBorderClass: "border-t-2 border-t-indigo-500/80",
    dotClass: "bg-indigo-500",
    minimapClass: "border-indigo-500/60 bg-indigo-500/25",
    accentBarClass: "bg-indigo-500",
  },
};

/** Resolves a deterministic semantic color token for a stage key or category. */
export function resolveDefaultStageColor(
  stageKey?: string | null,
  category?: string | null,
  sortOrder?: number | null,
  explicitColor?: string | null
): CrmStageColorToken {
  if (explicitColor && (CRM_STAGE_COLOR_TOKENS as string[]).includes(explicitColor)) {
    return explicitColor as CrmStageColorToken;
  }
  const norm = (stageKey || "").toLowerCase();
  if (norm.includes("won") || norm.includes("converted") || norm.includes("deal")) return "emerald";
  if (norm.includes("lost") || norm.includes("disqualified")) return "rose";
  if (norm.includes("discovery") || norm.includes("new")) return "blue";
  if (norm.includes("qualification") || norm.includes("working")) return "cyan";
  if (norm.includes("solution_fit") || norm.includes("qualified")) return "indigo";
  if (norm.includes("proposal")) return "violet";
  if (norm.includes("negotiation")) return "amber";
  if (category === "done") return "emerald";
  if (category === "lost") return "rose";
  if (category === "todo") return "blue";
  const cycle: CrmStageColorToken[] = ["blue", "cyan", "indigo", "violet", "amber", "teal", "purple"];
  const idx = Math.max(0, (sortOrder ?? 1) - 1) % cycle.length;
  return cycle[idx];
}

/** The 4 Jira-surpassing rule categories. */
export type CrmWorkflowRuleCategory = "restrict" | "input" | "validate" | "actions";

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

/** Definition of an available rule template in the 4-Category Rule Catalog Modal. */
export interface CrmWorkflowRuleCatalogTemplate {
  ruleTypeKey: string;
  category: CrmWorkflowRuleCategory;
  titleEn: string;
  titleAr: string;
  descriptionEn: string;
  descriptionAr: string;
  defaultConfig?: Record<string, string>;
}

/** Master catalog of 18 Jira-surpassing CRM Workflow Rules across all 4 categories. */
export const CRM_RULE_CATALOG_DEFINITIONS: CrmWorkflowRuleCatalogTemplate[] = [
  // Category 1: Restrict (Conditions)
  {
    ruleTypeKey: "restrict.approval_required",
    category: "restrict",
    titleEn: "Block transition until approval",
    titleAr: "حظر الانتقال حتى اعتماد الدور أو المسؤول",
    descriptionEn: "Require explicit Role or Record Principal approval (with Any/Unanimous Quorum) before moving into the target stage.",
    descriptionAr: "يتطلب موافقة صريحة من الدور أو المسؤول المحدد (نصاب فردي أو إجماع) قبل الانتقال إلى المرحلة المستهدفة.",
    defaultConfig: { principals: "role:sales_manager,principal:record.owner_manager", quorum: "any" },
  },
  {
    ruleTypeKey: "restrict.approval_matrix",
    category: "restrict",
    titleEn: "Multi-Tier Value & Risk Approval Matrix",
    titleAr: "مصفوفة الاعتماد متعددة المستويات حسب القيمة والمخاطر",
    descriptionEn: "Route high-value deals through tiered approval thresholds (e.g. >= 100k Sales Manager; >= 500k Commercial Director + Finance Controller).",
    descriptionAr: "توجيه الصفقات الكبرى عبر مستويات اعتماد متدرجة حسب القيمة المالية ونصاب الموافقة.",
    defaultConfig: {
      tier1MinAmount: "100000",
      tier1Roles: "role:sales_manager",
      tier2MinAmount: "500000",
      tier2Roles: "role:commercial_director,role:finance_controller",
      quorum: "all",
    },
  },
  {
    ruleTypeKey: "restrict.subtasks_completed",
    category: "restrict",
    titleEn: "Restrict based on subtasks & activities",
    titleAr: "تقييد بناءً على اكتمال المهام والأنشطة",
    descriptionEn: "Block transition when there are open mandatory Activities or Subtasks on this record.",
    descriptionAr: "منع الانتقال عند وجود أنشطة أو مهام فرعية مفتوحة غير مكتملة.",
  },
  {
    ruleTypeKey: "restrict.api_only",
    category: "restrict",
    titleEn: "Restrict from all users (API / Automation only)",
    titleAr: "تقييد عن جميع المستخدمين (الأتمتة فقط)",
    descriptionEn: "Hide manual Kanban drag/move for users; allow transition only via webhooks or system events.",
    descriptionAr: "قصر الانتقال على الأتمتة وأحداث النظام فقط ومنع السحب اليدوي.",
  },
  {
    ruleTypeKey: "restrict.field_value",
    category: "restrict",
    titleEn: "Restrict based on field value",
    titleAr: "تقييد بناءً على قيمة حقل محدد",
    descriptionEn: "Allow transition only when a specified CRM or custom field matches the configured threshold.",
    descriptionAr: "السماح بالانتقال فقط عندما تطابق قيمة الحقل الشرط المحدد.",
    defaultConfig: { fieldKey: "estimatedAmount", operator: "greater_than", value: "0" },
  },
  {
    ruleTypeKey: "restrict.prior_status",
    category: "restrict",
    titleEn: "Restrict based on prior status history",
    titleAr: "تقييد بناءً على المرور بمرحلة سابقة",
    descriptionEn: "Ensure the record has previously passed through a required qualification or compliance stage.",
    descriptionAr: "التأكد من مرور السجل بمرحلة تأهيل أو امتثال سابقة مطلوبة.",
    defaultConfig: { requiredStageKey: "default.discovery" },
  },
  {
    ruleTypeKey: "restrict.separation_of_duties",
    category: "restrict",
    titleEn: "Restrict to or from last user (Four-Eyes Principle)",
    titleAr: "مبدأ الرقابة الثنائية (منع نفس المستخدم الأخير)",
    descriptionEn: "Prevent the user who performed the previous transition from executing this approval transition.",
    descriptionAr: "منع المستخدم الذي نفذ الانتقال السابق من اعتماد هذا الانتقال.",
  },
  {
    ruleTypeKey: "restrict.roles_permissions",
    category: "restrict",
    titleEn: "Restrict to roles, principals or permissions",
    titleAr: "تقييد حسب الأدوار أو المسؤولين أو الصلاحيات",
    descriptionEn: "Only users matching the selected CRM Role, Record Principal, or PBAC permission can execute this transition.",
    descriptionAr: "السماح فقط للمستخدمين الذين يطابقون الدور أو المسؤول النسبى أو الصلاحية المحددة.",
    defaultConfig: {
      principals: "role:sales_manager,principal:record.owner",
      permissions: "crm.opportunities.stage.override",
      quorum: "any",
    },
  },

  // Category 2: Request Input (Transition Screens)
  {
    ruleTypeKey: "input.prompt_fields",
    category: "input",
    titleEn: "Prompt for fields during transition",
    titleAr: "طلب إدخال حقول أثناء الانتقال",
    descriptionEn: "Open a dynamic transition screen prompting the user to fill missing exit/entry fields inline.",
    descriptionAr: "فتح نافذة ديناميكية لطلب استكمال الحقول المطلوبة أثناء الانتقال.",
    defaultConfig: { fields: "estimatedAmount,targetCloseDate" },
  },
  {
    ruleTypeKey: "input.require_reason_and_note",
    category: "input",
    titleEn: "Require structured reason code & audit note",
    titleAr: "إلزام برمز السبب وملاحظة التدقيق",
    descriptionEn: "Prompt for a structured reason code and mandatory audit comment before completing the move.",
    descriptionAr: "طلب رمز سبب مهيكل وتعليق تدقيق إلزامي قبل إتمام الانتقال.",
  },

  // Category 3: Validate Details (Validators)
  {
    ruleTypeKey: "validate.verified_party",
    category: "validate",
    titleEn: "Validate verified Customer Account / Party linked",
    titleAr: "التحقق من ربط حساب عميل موثق",
    descriptionEn: "Ensure a verified Company Account or Individual Party is linked to the Deal/Lead.",
    descriptionAr: "التأكد من ربط حساب شركة أو عميل موثق بالصفقة.",
  },
  {
    ruleTypeKey: "validate.buying_committee_role",
    category: "validate",
    titleEn: "Validate Buying Committee Contact Role present",
    titleAr: "التحقق من وجود صاحب قرار في لجنة الشراء",
    descriptionEn: "Require a linked Contact with a designated Buying Committee Role (e.g. Decision Maker, Legal).",
    descriptionAr: "اشتراط وجود جهة اتصال بدور محدد في لجنة الشراء (مثل صانع القرار أو القانوني).",
    defaultConfig: { requiredRole: "DecisionMaker" },
  },
  {
    ruleTypeKey: "validate.financial_forecast",
    category: "validate",
    titleEn: "Validate Estimated Amount & Future Close Date",
    titleAr: "التحقق من القيمة المالية وتاريخ الإغلاق المستقبلي",
    descriptionEn: "Verify that Estimated Amount > 0 and Target Close Date is a valid future date.",
    descriptionAr: "التحقق من أن القيمة المقدرة أكبر من صفر وتاريخ الإغلاق في المستقبل.",
    defaultConfig: { minAmount: "1000" },
  },
  {
    ruleTypeKey: "validate.active_quote",
    category: "validate",
    titleEn: "Validate active Commercial Quote attached",
    titleAr: "التحقق من إرفاق عرض سعر تجاري نشط",
    descriptionEn: "Verify that an approved or active commercial proposal/quote is attached before negotiation.",
    descriptionAr: "التأكد من وجود عرض سعر نشط مرتبط بالصفقة قبل التفاوض.",
  },

  // Category 4: Perform Actions (Post-Functions)
  {
    ruleTypeKey: "action.convert_lead_to_deal",
    category: "actions",
    titleEn: "Auto-Convert Lead to Deal in target pipeline",
    titleAr: "تحويل العميل المحتمل تلقائياً إلى صفقة",
    descriptionEn: "Automatically convert the Lead into a Deal, link the Account/Contact, and place in the target Deal pipeline.",
    descriptionAr: "تحويل العميل المحتمل تلقائياً إلى صفقة وربط الحساب وجهة الاتصال.",
  },
  {
    ruleTypeKey: "action.create_followup_task",
    category: "actions",
    titleEn: "Auto-create SLA follow-up Activity / Task",
    titleAr: "إنشاء مهمة متابعة تلقائية",
    descriptionEn: "Automatically generate a follow-up Activity/Task assigned to the record owner upon transition.",
    descriptionAr: "إنشاء نشاط أو مهمة متابعة تلقائياً لمالك السجل فور الانتقال.",
    defaultConfig: { taskSubject: "Follow up on stage transition", dueInDays: "2" },
  },
  {
    ruleTypeKey: "action.update_field",
    category: "actions",
    titleEn: "Update record field or win probability",
    titleAr: "تحديث حقل في السجل أو نسبة الفوز",
    descriptionEn: "Automatically set or clear a specified field or synchronize stage win probability.",
    descriptionAr: "تحديث قيمة حقل محدد أو مزامنة احتمالية الفوز تلقائياً.",
    defaultConfig: { fieldKey: "winProbabilityPercent", value: "75" },
  },
  {
    ruleTypeKey: "action.emit_event_webhook",
    category: "actions",
    titleEn: "Emit Domain Event & Outbound CRM Webhook",
    titleAr: "إطلاق حدث النظام وإشعار Webhook خارجي",
    descriptionEn: "Publish the configured Domain Event to the Outbox and trigger external CRM/webhook integrations.",
    descriptionAr: "نشر حدث النطاق وإطلاق تكامل Webhook للأنظمة الخارجية.",
    defaultConfig: { eventKey: "DealStageTransitionedEvent" },
  },
];

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
  /** Optional multi-source stage keys (Jira parity: connect multiple From statuses into one To status). */
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
  reason?: string;
  reasonIfBlocked?: string;
  matchedTransition?: CrmWorkflowTransition;
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
}

/** Factory helper for constructing a CrmWorkflowTransition with safe rule defaults. */
export function makeWorkflowTransition(
  id: string,
  fromStageKey: string,
  toStageKey: string,
  direction: "forward" | "backward" | "global",
  nameEn: string,
  nameAr: string,
  opts?: Partial<CrmWorkflowTransitionRules> & {
    fromStageKeys?: string[];
    domainEventKey?: string;
    triggers?: string[];
    properties?: Record<string, string>;
    catalogRules?: CrmWorkflowCatalogRule[];
  }
): CrmWorkflowTransition {
  return {
    id,
    nameEn,
    nameAr,
    fromStageKey,
    fromStageKeys: opts?.fromStageKeys ?? (fromStageKey === "*" ? ["*"] : [fromStageKey]),
    toStageKey,
    direction,
    domainEventKey: opts?.domainEventKey ?? "GenericEvent",
    triggers: opts?.triggers ?? [],
    properties: opts?.properties ?? {},
    catalogRules: opts?.catalogRules ?? [],
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

/** Checks if a transition originates from the specified stage key (including multi-source fromStageKeys). */
export function transitionMatchesSourceStage(t: CrmWorkflowTransition, fromStageKey: string): boolean {
  const normFrom = normalizeStageKeyForMatch(fromStageKey);
  if (t.fromStageKey !== "*" && normalizeStageKeyForMatch(t.fromStageKey) === normFrom) {
    return true;
  }
  if (Array.isArray(t.fromStageKeys)) {
    return t.fromStageKeys.some((k) => k !== "*" && normalizeStageKeyForMatch(k) === normFrom);
  }
  return false;
}

/** Evaluates a stage transition against the given workflow's stages, transitions, and record context. */
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
    (t) =>
      (t.fromStageKey === "*" || t.fromStageKeys?.includes("*") || toStage?.allowInboundFromAny) &&
      normalizeStageKeyForMatch(t.toStageKey) === normTo
  );
  const matched = directMatch ?? anyMatch;

  if (!matched) {
    const msg = isBackward
      ? `Rollback from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" is disabled in active workflow "${wf.nameEn}".`
      : `No configured transition from "${fromStage?.labelEn || fromStageKey}" to "${toStage?.labelEn || toStageKey}" in active workflow "${wf.nameEn}".`;
    return {
      allowed: false,
      reason: msg,
      reasonIfBlocked: msg,
      targetStage: toStage,
      shouldTriggerDealConversion: false,
      triggerDealConversion: false,
      requiredFields: [],
      promptForComment: false,
      isBackward,
    };
  }

  if (!matched.rules.allowRollback) {
    const msg = `Transition "${matched.nameEn}" is restricted or locked in active workflow "${wf.nameEn}".`;
    return {
      allowed: false,
      reason: msg,
      reasonIfBlocked: msg,
      matchedTransition: matched,
      targetStage: toStage,
      shouldTriggerDealConversion: false,
      triggerDealConversion: false,
      requiredFields: [],
      promptForComment: false,
      isBackward,
    };
  }

  // Evaluate attached 4-category catalog rules
  const catalogRules = matched.catalogRules ?? [];
  let approvalRequirement: EvaluatedWorkflowTransition["approvalRequirement"] = undefined;
  const dynamicPromptedFields: string[] = [];

  for (const cRule of catalogRules) {
    if (cRule.ruleTypeKey === "restrict.api_only") {
      const msg = `Transition "${matched.nameEn}" is restricted to automated API/system events only.`;
      return { allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: [], promptForComment: false, isBackward };
    }
    if (cRule.ruleTypeKey === "restrict.approval_required") {
      const rawPrincipals = cRule.config?.principals || cRule.config?.approverRole || "role:sales_manager";
      const roles = rawPrincipals.split(",").map((s) => s.trim()).filter(Boolean);
      const quorum = cRule.config?.quorum === "all" ? "all" : "any";
      approvalRequirement = { required: true, roles, quorum };
      if (recordContext?.hasManagerApproval === false) {
        const msg = `Transition "${matched.nameEn}" is blocked until Approval (${roles.join(", ")}) is granted.`;
        return { allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: [], promptForComment: false, isBackward, approvalRequirement };
      }
    }
    if (cRule.ruleTypeKey === "restrict.approval_matrix") {
      const t1Min = Number(cRule.config?.tier1MinAmount ?? 100000);
      const t1Roles = (cRule.config?.tier1Roles || "role:sales_manager").split(",").map((s) => s.trim()).filter(Boolean);
      const t2Min = Number(cRule.config?.tier2MinAmount ?? 500000);
      const t2Roles = (cRule.config?.tier2Roles || "role:commercial_director,role:finance_controller").split(",").map((s) => s.trim()).filter(Boolean);
      const matrixQuorum = cRule.config?.quorum === "any" ? "any" : "all";
      const amt = recordContext?.estimatedAmount ?? t1Min;
      if (amt >= t2Min) {
        approvalRequirement = { required: true, roles: t2Roles, quorum: matrixQuorum, matchedTierLabel: `Tier 2 (>= ${t2Min.toLocaleString()})` };
      } else if (amt >= t1Min) {
        approvalRequirement = { required: true, roles: t1Roles, quorum: "any", matchedTierLabel: `Tier 1 (>= ${t1Min.toLocaleString()})` };
      }
      if (approvalRequirement?.required && recordContext?.hasManagerApproval === false) {
        const msg = `Transition "${matched.nameEn}" requires ${approvalRequirement.matchedTierLabel} approval (${approvalRequirement.roles.join(", ")}).`;
        return { allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: [], promptForComment: false, isBackward, approvalRequirement };
      }
    }
    if (cRule.ruleTypeKey === "restrict.subtasks_completed" && recordContext?.hasOpenSubtasks === true) {
      const msg = `Transition "${matched.nameEn}" is blocked because open subtasks or activities remain incomplete.`;
      return { allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: [], promptForComment: false, isBackward };
    }
    if (
      cRule.ruleTypeKey === "restrict.separation_of_duties" &&
      recordContext?.actorUserId &&
      recordContext?.lastMovedByUserId &&
      recordContext.actorUserId === recordContext.lastMovedByUserId
    ) {
      const msg = `Four-Eyes Principle: the user who performed the previous stage move cannot execute "${matched.nameEn}".`;
      return { allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: [], promptForComment: false, isBackward };
    }
    if (cRule.ruleTypeKey === "input.prompt_fields" && cRule.config?.fields) {
      for (const f of cRule.config.fields.split(",").map((s) => s.trim()).filter(Boolean)) {
        dynamicPromptedFields.push(f);
      }
    }
    if (cRule.ruleTypeKey === "validate.buying_committee_role") {
      dynamicPromptedFields.push("primaryContactRole");
      if (recordContext?.contactRoles) {
        const reqRole = (cRule.config?.requiredRoles || cRule.config?.requiredRole || cRule.config?.role || "DecisionMaker").split(",")[0].trim();
        if (!recordContext.contactRoles.includes(reqRole)) {
          const msg = `A Buying Committee Contact with role "${reqRole}" must be linked before executing "${matched.nameEn}".`;
          return { allowed: false, reason: msg, reasonIfBlocked: msg, matchedTransition: matched, targetStage: toStage, shouldTriggerDealConversion: false, triggerDealConversion: false, requiredFields: [`contactRole:${reqRole}`], promptForComment: false, isBackward };
        }
      }
    }
  }

  const requiresParty =
    matched.rules.requireVerifiedParty ||
    toStage?.requiresVerifiedParty ||
    catalogRules.some((r) => r.ruleTypeKey === "validate.verified_party");

  if (recordContext && requiresParty && recordContext.hasVerifiedParty === false) {
    const msg = `A verified Company Account or Contact must be linked before moving to "${toStage?.labelEn || toStageKey}".`;
    return {
      allowed: false,
      reason: msg,
      reasonIfBlocked: msg,
      matchedTransition: matched,
      targetStage: toStage,
      shouldTriggerDealConversion: false,
      triggerDealConversion: false,
      requiredFields: ["partyId"],
      promptForComment: false,
      isBackward,
      approvalRequirement,
    };
  }

  const hasFinancialRule = catalogRules.some((r) => r.ruleTypeKey === "validate.financial_forecast");
  const requiredFields = Array.from(
    new Set([
      ...(fromStage?.requiredExitFields ?? []),
      ...matched.rules.requiredFieldKeys,
      ...matched.rules.promptFields,
      ...dynamicPromptedFields,
      ...(requiresParty ? ["partyId"] : []),
      ...(matched.rules.requireEstimatedAmountPositive || hasFinancialRule ? ["estimatedAmount"] : []),
      ...(matched.rules.requireTargetCloseDate || hasFinancialRule ? ["targetCloseDate"] : []),
    ])
  );
  const shouldConvert = Boolean(
    matched.rules.triggerDealConversion ||
      catalogRules.some((r) => r.ruleTypeKey === "action.convert_lead_to_deal") ||
      (!isBackward && toStage?.triggerDealConversion)
  );
  const promptComment = Boolean(
    matched.rules.promptForComment ||
      catalogRules.some((r) => r.ruleTypeKey === "input.require_reason_and_note") ||
      isBackward
  );

  return {
    allowed: true,
    matchedTransition: matched,
    targetStage: toStage,
    shouldTriggerDealConversion: shouldConvert,
    triggerDealConversion: shouldConvert,
    requiredFields,
    promptForComment: promptComment,
    isBackward,
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
    descriptionEn: "5-stage B2B sports commercial pipeline with forward & backward transitions and Customer Verification gates.",
    descriptionAr: "مسار مبيعات تجاري من 5 مراحل مع انتقالات أمامية وعكسية وبوابة التحقق من الحساب.",
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

