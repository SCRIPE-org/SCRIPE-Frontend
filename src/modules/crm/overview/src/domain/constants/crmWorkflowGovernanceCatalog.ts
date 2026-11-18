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

export * from "./crmWorkflowFieldAndPermissionCatalog";
