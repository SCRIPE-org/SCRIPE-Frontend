import { CRM_PERMISSIONS } from "./permission-constants";

export interface CrmScopedRoleDefinition {
  id: string;
  key: string; // e.g. "pipe_role:deal_desk"
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  permissions: string[];
  memberNames?: string[];
  maxApprovalThresholdAmount?: number | null;
  backupRoleKey?: string | null;
  color?: string;
  isSystem?: boolean;
}

export type CrmPipelineRoleDefinition = CrmScopedRoleDefinition;

export interface CrmRecordPrincipalDefinition {
  key: string; // e.g. "principal:record.owner"
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
}

export interface CrmBuyingCommitteeRoleOption {
  key: string;
  labelEn: string;
  labelAr: string;
  isSystem?: boolean;
}

export interface CrmScopedPermissionOption {
  key: string;
  labelEn: string;
  labelAr: string;
  category: string;
}

export interface CrmWorkflowFieldCatalogItem {
  key: string;
  labelEn: string;
  labelAr: string;
  entityType: "deal" | "lead" | "both";
  dataType: "text" | "number" | "date" | "select" | "boolean";
}

export interface CrmRuleOperatorOption {
  key: string;
  symbol: string;
  labelEn: string;
  labelAr: string;
}

/**
 * Initial bootstrap fallback for Decoupled CRM Pipeline / Workflow Roles (`pipe_role:*`).
 * Authoritative records are seeded on the backend (`CrmSettingsRepository.BuildDefaultGovernanceConfigJson`)
 * and hydrated/persisted via `CrmOverviewRepository.getSettings()` / `updateTenantSettings()`.
 */
export const DEFAULT_CRM_SCOPED_ROLES: CrmScopedRoleDefinition[] = [
  {
    id: "pipe-role-deal-desk",
    key: "pipe_role:deal_desk",
    nameEn: "Deal Desk Approver",
    nameAr: "معتمد مكتب الصفقات",
    descriptionEn: "First-line commercial deal desk queue approving standard discounts and mid-tier deal transitions.",
    descriptionAr: "مكتب مراجعة واعتماد الصفقات التجارية للخصومات القياسية وانتقالات المراحل المتوسطة.",
    memberNames: [],
    maxApprovalThresholdAmount: 250000,
    backupRoleKey: "pipe_role:commercial_director",
    color: "blue",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE_OVERRIDE,
    ],
    isSystem: true,
  },
  {
    id: "pipe-role-commercial-director",
    key: "pipe_role:commercial_director",
    nameEn: "Commercial Director Sign-Off",
    nameAr: "اعتماد المدير التجاري",
    descriptionEn: "Executive commercial sign-off queue for enterprise sponsorships and high-value stage gates.",
    descriptionAr: "اعتماد المدير التجاري للصفقات المؤسسية والرعايات الكبرى وبوابات المراحل الحرجة.",
    memberNames: [],
    maxApprovalThresholdAmount: 1000000,
    backupRoleKey: "pipe_role:sponsorship_board",
    color: "indigo",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE_OVERRIDE,
      CRM_PERMISSIONS.OPPORTUNITIES_CLOSE,
      CRM_PERMISSIONS.WORKFLOW_ROLES_MANAGE,
    ],
    isSystem: true,
  },
  {
    id: "pipe-role-sponsorship-board",
    key: "pipe_role:sponsorship_board",
    nameEn: "Executive Sponsorship Committee",
    nameAr: "لجنة الرعايات التنفيذية",
    descriptionEn: "Board-level approval committee for flagship stadium naming rights and strategic B2B partnerships.",
    descriptionAr: "لجنة الاعتماد التنفيذي العليا لحقوق تسمية الملاعب والشراكات الاستراتيجية الكبرى.",
    memberNames: [],
    maxApprovalThresholdAmount: null,
    backupRoleKey: null,
    color: "violet",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE_OVERRIDE,
      CRM_PERMISSIONS.OPPORTUNITIES_CLOSE,
      CRM_PERMISSIONS.OPPORTUNITIES_REOPEN,
    ],
    isSystem: true,
  },
  {
    id: "pipe-role-finance-gatekeeper",
    key: "pipe_role:finance_gatekeeper",
    nameEn: "Finance & Revenue Gatekeeper",
    nameAr: "بوابة المراجعة المالية",
    descriptionEn: "Validates payment schedules, multi-currency FX locks, credit exposure, and margin thresholds.",
    descriptionAr: "يدقق جداول الدفعات وتثبيت أسعار الصرف والائتمان وهوامش الربح قبل الإغلاق.",
    memberNames: [],
    maxApprovalThresholdAmount: 500000,
    backupRoleKey: "pipe_role:commercial_director",
    color: "emerald",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE_OVERRIDE,
      CRM_PERMISSIONS.REPORTS_READ,
    ],
    isSystem: true,
  },
  {
    id: "pipe-role-legal-reviewer",
    key: "pipe_role:legal_reviewer",
    nameEn: "Legal & Contract Counsel",
    nameAr: "المراجع القانوني للعقود",
    descriptionEn: "Reviews sponsorship contract redlines, regulatory clauses, and intellectual property terms.",
    descriptionAr: "يراجع مسودات العقود والبنود القانونية وحقوق الملكية الفكرية.",
    memberNames: [],
    maxApprovalThresholdAmount: null,
    backupRoleKey: "pipe_role:commercial_director",
    color: "amber",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
      CRM_PERMISSIONS.ACCOUNTS_READ,
    ],
    isSystem: true,
  },
  {
    id: "pipe-role-venue-ops-lead",
    key: "pipe_role:venue_ops_lead",
    nameEn: "Venue & Stadium Inventory Lead",
    nameAr: "مسؤول جاهزية المنشآت",
    descriptionEn: "Confirms stadium pitch availability, LED perimeter slots, and hospitality box inventory.",
    descriptionAr: "يؤكد إتاحة الملاعب وشاشات الإعلانات والمقصورات قبل تثبيت الحجز التجاري.",
    memberNames: [],
    maxApprovalThresholdAmount: null,
    backupRoleKey: "pipe_role:deal_desk",
    color: "cyan",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
    ],
    isSystem: true,
  },
  {
    id: "pipe-role-academy-director",
    key: "pipe_role:academy_director",
    nameEn: "Academy Technical Director",
    nameAr: "المدير الفني للأكاديمية",
    descriptionEn: "Approves B2B youth academy cohorts, scholarship allocations, and technical training packages.",
    descriptionAr: "يعتمد دفعات الأكاديمية للشركات ومقاعد المنح الرياضية وبرامج التدريب الفني.",
    memberNames: [],
    maxApprovalThresholdAmount: null,
    backupRoleKey: "pipe_role:commercial_director",
    color: "teal",
    permissions: [
      CRM_PERMISSIONS.LEADS_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
    ],
    isSystem: true,
  },
];

export const DEFAULT_CRM_PIPELINE_ROLES = DEFAULT_CRM_SCOPED_ROLES;

export const CRM_RECORD_RELATIVE_PRINCIPALS: CrmRecordPrincipalDefinition[] = [
  {
    key: "principal:record.owner",
    nameEn: "Record Owner (Assignee)",
    nameAr: "مالك السجل (المسؤول المعين)",
    descriptionEn: "Dynamic ABAC principal resolved to the user currently assigned to own the Deal/Lead.",
    descriptionAr: "يتحدد تلقائياً بالمستخدم المعين حالياً كمالك للصفقة أو العميل المحتمل.",
  },
  {
    key: "principal:record.creator",
    nameEn: "Record Creator (Reporter)",
    nameAr: "منشئ السجل",
    descriptionEn: "Dynamic ABAC principal resolved to the user who originally created the record.",
    descriptionAr: "يتحدد تلقائياً بالمستخدم الذي أنشأ السجل في البداية.",
  },
  {
    key: "principal:record.owner_manager",
    nameEn: "Owner's Line Manager",
    nameAr: "المدير المباشر للمالك",
    descriptionEn: "Dynamic ABAC principal resolved to the direct reporting manager of the Record Owner.",
    descriptionAr: "يتحدد تلقائياً بالمدير المباشر لمالك السجل.",
  },
  {
    key: "principal:record.team_lead",
    nameEn: "Commercial Team Lead",
    nameAr: "قائد الفريق التجاري",
    descriptionEn: "Dynamic ABAC principal resolved to the lead of the assigned territory or sales pod.",
    descriptionAr: "يتحدد تلقائياً بقائد الفريق التجاري أو المنطقة البيعية.",
  },
  {
    key: "principal:record.not_last_actor",
    nameEn: "Four-Eyes: Not Previous Transition Actor",
    nameAr: "مبدأ الرقابة الثنائية: غير منفذ الانتقال السابق",
    descriptionEn: "Enforces separation of duties by requiring a different user than the last stage actor.",
    descriptionAr: "يفرض فصل المهام باشتراط مستخدم مختلف عن منفذ الانتقال السابق.",
  },
];

export const DEFAULT_BUYING_COMMITTEE_ROLES: CrmBuyingCommitteeRoleOption[] = [
  { key: "DecisionMaker", labelEn: "Decision Maker", labelAr: "صانع القرار", isSystem: true },
  { key: "ExecutiveSponsor", labelEn: "Executive Sponsor", labelAr: "الراعي التنفيذي", isSystem: true },
  { key: "BudgetHolder", labelEn: "Budget Holder / CFO", labelAr: "مالك الميزانية", isSystem: true },
  { key: "TechnicalEvaluator", labelEn: "Technical Evaluator", labelAr: "المقيّم الفني", isSystem: true },
  { key: "LegalProcurement", labelEn: "Legal & Procurement", labelAr: "الشؤون القانونية والمشتريات", isSystem: true },
  { key: "Champion", labelEn: "Internal Champion", labelAr: "الداعم الداخلي", isSystem: true },
];

export const CRM_SCOPED_PERMISSION_OPTIONS: CrmScopedPermissionOption[] = [
  { key: CRM_PERMISSIONS.OVERVIEW_READ, labelEn: "View CRM Overview", labelAr: "عرض نظرة عامة CRM", category: "Overview" },
  { key: CRM_PERMISSIONS.LEADS_READ, labelEn: "Read Leads", labelAr: "قراءة العملاء المحتملين", category: "Leads" },
  { key: CRM_PERMISSIONS.LEADS_CREATE, labelEn: "Create Leads", labelAr: "إنشاء عملاء محتملين", category: "Leads" },
  { key: CRM_PERMISSIONS.LEADS_UPDATE, labelEn: "Update Leads", labelAr: "تحديث العملاء المحتملين", category: "Leads" },
  { key: CRM_PERMISSIONS.LEADS_QUALIFY, labelEn: "Qualify / Convert Leads", labelAr: "تأهيل وتحويل العملاء المحتملين", category: "Leads" },
  { key: CRM_PERMISSIONS.ACCOUNTS_READ, labelEn: "Read Accounts", labelAr: "قراءة الحسابات", category: "Accounts & Contacts" },
  { key: CRM_PERMISSIONS.ACCOUNTS_CREATE, labelEn: "Create Accounts", labelAr: "إنشاء الحسابات", category: "Accounts & Contacts" },
  { key: CRM_PERMISSIONS.ACCOUNTS_UPDATE, labelEn: "Update Accounts", labelAr: "تحديث الحسابات", category: "Accounts & Contacts" },
  { key: CRM_PERMISSIONS.CONTACTS_READ, labelEn: "Read Contacts", labelAr: "قراءة جهات الاتصال", category: "Accounts & Contacts" },
  { key: CRM_PERMISSIONS.CONTACTS_CREATE, labelEn: "Create Contacts", labelAr: "إنشاء جهات الاتصال", category: "Accounts & Contacts" },
  { key: CRM_PERMISSIONS.CONTACTS_UPDATE, labelEn: "Update Contacts", labelAr: "تحديث جهات الاتصال", category: "Accounts & Contacts" },
  { key: CRM_PERMISSIONS.OPPORTUNITIES_READ, labelEn: "Read Deals / Opportunities", labelAr: "قراءة الفرص البيعية", category: "Deals" },
  { key: CRM_PERMISSIONS.OPPORTUNITIES_CREATE, labelEn: "Create Deals", labelAr: "إنشاء الفرص البيعية", category: "Deals" },
  { key: CRM_PERMISSIONS.OPPORTUNITIES_UPDATE, labelEn: "Update Deals", labelAr: "تحديث الفرص البيعية", category: "Deals" },
  { key: CRM_PERMISSIONS.OPPORTUNITIES_STAGE, labelEn: "Advance Deal Stage", labelAr: "تغيير مرحلة الفرصة", category: "Deals" },
  { key: CRM_PERMISSIONS.OPPORTUNITIES_STAGE_OVERRIDE, labelEn: "Override Deal Stage / Gate", labelAr: "تجاوز شروط مراحل الفرص", category: "Deals" },
  { key: CRM_PERMISSIONS.OPPORTUNITIES_CLOSE, labelEn: "Close Deal (Won / Lost)", labelAr: "إغلاق الفرص البيعية", category: "Deals" },
  { key: CRM_PERMISSIONS.OPPORTUNITIES_REOPEN, labelEn: "Reopen Closed Deal", labelAr: "إعادة فتح الفرص المغلقة", category: "Deals" },
  { key: CRM_PERMISSIONS.ACTIVITIES_READ, labelEn: "Read Activities", labelAr: "قراءة الأنشطة", category: "Activities" },
  { key: CRM_PERMISSIONS.ACTIVITIES_CREATE, labelEn: "Log Activities", labelAr: "تسجيل الأنشطة", category: "Activities" },
  { key: CRM_PERMISSIONS.ACTIVITIES_FOLLOWUP, labelEn: "Manage Activity Follow-ups", labelAr: "إدارة متابعات الأنشطة", category: "Activities" },
  { key: CRM_PERMISSIONS.COMMUNICATIONS_SEND, labelEn: "Send CRM Communications", labelAr: "إرسال مراسلات CRM", category: "Activities" },
  { key: CRM_PERMISSIONS.PIPELINES_READ, labelEn: "Read Pipelines", labelAr: "قراءة خطوط البيع", category: "Governance" },
  { key: CRM_PERMISSIONS.PIPELINES_MANAGE, labelEn: "Manage Pipelines & Workflows", labelAr: "إدارة خطوط البيع ومسارات العمل", category: "Governance" },
  { key: CRM_PERMISSIONS.WORKFLOW_ROLES_MANAGE, labelEn: "Manage Pipeline & Workflow Roles", labelAr: "إدارة أدوار خطوط البيع ومسارات العمل", category: "Governance" },
  { key: CRM_PERMISSIONS.SETTINGS_MANAGE, labelEn: "Manage CRM Settings", labelAr: "إدارة إعدادات CRM", category: "Governance" },
  { key: CRM_PERMISSIONS.ROLES_MANAGE_SCOPED, labelEn: "Manage Scoped CRM Roles", labelAr: "إدارة أدوار المبيعات المخصصة", category: "Governance" },
  { key: CRM_PERMISSIONS.RECORDS_ASSIGN, labelEn: "Assign Record Ownership", labelAr: "تعيين ملكية السجلات", category: "Governance" },
  { key: CRM_PERMISSIONS.REPORTS_READ, labelEn: "Read CRM Reports", labelAr: "قراءة تقارير CRM", category: "Reports" },
  { key: CRM_PERMISSIONS.REPORTS_EXPORT, labelEn: "Export CRM Reports", labelAr: "تصدير تقارير CRM", category: "Reports" },
];

export const CRM_WORKFLOW_SYSTEM_FIELDS: CrmWorkflowFieldCatalogItem[] = [
  { key: "partyId", labelEn: "Customer Account / Contact (Party)", labelAr: "حساب العميل / جهة الاتصال", entityType: "both", dataType: "text" },
  { key: "estimatedAmount", labelEn: "Estimated Deal Amount", labelAr: "القيمة التقديرية للصفقة", entityType: "deal", dataType: "number" },
  { key: "discountPercent", labelEn: "Quote Discount %", labelAr: "نسبة الخصم %", entityType: "deal", dataType: "number" },
  { key: "targetCloseDate", labelEn: "Target Close Date", labelAr: "تاريخ الإغلاق المستهدف", entityType: "deal", dataType: "date" },
  { key: "primaryContactRole", labelEn: "Buying Committee Stakeholder Role", labelAr: "دور صاحب المصلحة في لجنة الشراء", entityType: "deal", dataType: "select" },
  { key: "nextStepSummary", labelEn: "Next Commercial Step Summary", labelAr: "ملخص الخطوة التجارية التالية", entityType: "both", dataType: "text" },
  { key: "lossReason", labelEn: "Closed-Lost / Rejection Reason", labelAr: "سبب الخسارة أو الاستبعاد", entityType: "both", dataType: "text" },
  { key: "leadPhoneOrEmail", labelEn: "Verified Phone or Email", labelAr: "الهاتف أو البريد الإلكتروني المؤكد", entityType: "lead", dataType: "text" },
  { key: "leadSourceChannel", labelEn: "Lead Acquisition Source", labelAr: "مصدر استقطاب العميل المحتمل", entityType: "lead", dataType: "select" },
  { key: "leadBantNotes", labelEn: "BANT Qualification Summary", labelAr: "ملخص تأهيل الميزانية والاحتياج BANT", entityType: "lead", dataType: "text" },
];

export const CRM_RULE_OPERATORS: CrmRuleOperatorOption[] = [
  { key: "equals", symbol: "=", labelEn: "Equals (=)", labelAr: "يساوي (=)" },
  { key: "not_equals", symbol: "!=", labelEn: "Not Equals (!=)", labelAr: "لا يساوي (!=)" },
  { key: "greater_than", symbol: ">", labelEn: "Greater Than (>)", labelAr: "أكبر من (>)" },
  { key: "greater_or_equal", symbol: ">=", labelEn: "Greater or Equal (>=)", labelAr: "أكبر أو يساوي (>=)" },
  { key: "less_than", symbol: "<", labelEn: "Less Than (<)", labelAr: "أقل من (<)" },
  { key: "less_or_equal", symbol: "<=", labelEn: "Less or Equal (<=)", labelAr: "أقل أو يساوي (<=)" },
  { key: "in", symbol: "IN", labelEn: "In Set (comma-separated)", labelAr: "ضمن المجموعة (مفصول بفواصل)" },
  { key: "not_empty", symbol: "NOT EMPTY", labelEn: "Is Not Empty", labelAr: "غير فارغ" },
];
