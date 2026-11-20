import { CRM_PERMISSIONS } from "./permission-constants";
import type {
  CrmBuyingCommitteeRoleOption,
  CrmConfigurableOptionItem,
  CrmCustomFieldDefinition,
  CrmScopedRoleDefinition,
} from "../types/crmSharedTypes";

/** Parsed custom governance JSON payload stored in `CustomFieldsConfigJson`. */
export interface ParsedGovernanceConfig {
  customFields: CrmCustomFieldDefinition[];
  crmRoles: CrmScopedRoleDefinition[];
  buyingCommitteeRoles: CrmBuyingCommitteeRoleOption[];
  configuredLossReasons: CrmConfigurableOptionItem[];
  configuredActivityTypes: CrmConfigurableOptionItem[];
}

/** Default CRM custom field definitions for new tenants. */
export const DEFAULT_CRM_CUSTOM_FIELDS: CrmCustomFieldDefinition[] = [
  {
    id: "cf-crm-opp-procurement-ref",
    entityTypeKey: "crm.opportunity",
    key: "procurement_reference_code",
    labelEn: "Procurement / Tender Reference ID",
    labelAr: "رقم مرجع المناقصة / المشتريات",
    valueType: "Text",
    isRequired: false,
    defaultStageGateKey: "default.proposal",
    createdAtIso: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "cf-crm-opp-legal-signoff",
    entityTypeKey: "crm.opportunity",
    key: "legal_review_ticket",
    labelEn: "Legal Contract Review Ticket",
    labelAr: "تذكرة المراجعة القانونية للعقد",
    valueType: "Text",
    isRequired: false,
    defaultStageGateKey: "default.negotiation",
    createdAtIso: "2026-01-01T00:00:00.000Z",
  },
];

/** Default loss reasons catalog. */
export const DEFAULT_CONFIGURED_LOSS_REASONS: CrmConfigurableOptionItem[] = [
  { code: "budget_cut", labelEn: "Budget Cut / Freeze", labelAr: "تخفيض أو تجميد الميزانية" },
  { code: "competitor", labelEn: "Lost to Competitor", labelAr: "خسارة لصالح منافس" },
  { code: "pricing", labelEn: "Pricing / Commercial Terms", labelAr: "التسعير أو الشروط التجارية" },
  { code: "timing", labelEn: "Timing / Postponed", labelAr: "التوقيت أو التأجيل" },
  { code: "feature_gap", labelEn: "Capability / Feature Gap", labelAr: "فجوة في المتطلبات الفنية" },
  { code: "no_decision", labelEn: "No Decision / Stalled", labelAr: "عدم اتخاذ قرار" },
  { code: "other", labelEn: "Other", labelAr: "سبب آخر" },
];

/** Default activity types catalog. */
export const DEFAULT_CONFIGURED_ACTIVITY_TYPES: CrmConfigurableOptionItem[] = [
  { code: "Note", labelEn: "Note", labelAr: "ملاحظة" },
  { code: "CallLog", labelEn: "Call Log", labelAr: "سجل مكالمة" },
  { code: "MeetingLog", labelEn: "Meeting Log", labelAr: "سجل اجتماع" },
  { code: "SiteVisit", labelEn: "Venue / Pitch Site Visit", labelAr: "زيارة ميدانية للمنشأة" },
];

/** Default decoupled CRM pipeline approval queues (`pipe_role:*`). */
export const DEFAULT_SETTINGS_SCOPED_ROLES: CrmScopedRoleDefinition[] = [
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
    color: "violet",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE_OVERRIDE,
      CRM_PERMISSIONS.OPPORTUNITIES_CLOSE,
    ],
    isSystem: true,
  },
  {
    id: "pipe-role-finance-gatekeeper",
    key: "pipe_role:finance_gatekeeper",
    nameEn: "Finance & Credit Gatekeeper",
    nameAr: "مراقب المالية والائتمان",
    descriptionEn: "Verifies customer creditworthiness, multi-year payment schedules, and deep discount approvals (>15%).",
    descriptionAr: "يتحقق من الجدارة الائتمانية وجداول الدفع واعتماد الخصومات الكبرى (>15%).",
    memberNames: [],
    maxApprovalThresholdAmount: 500000,
    backupRoleKey: "pipe_role:commercial_director",
    color: "amber",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
      CRM_PERMISSIONS.OPPORTUNITIES_CLOSE,
    ],
    isSystem: true,
  },
  {
    id: "pipe-role-sponsorship-board",
    key: "pipe_role:sponsorship_board",
    nameEn: "Sponsorship & Board Committee",
    nameAr: "لجنة الرعايات ومجلس الإدارة",
    descriptionEn: "Top-tier executive approval committee for strategic multi-year club & federation partnerships.",
    descriptionAr: "اللجنة العليا لاعتماد شراكات الرعاية الاستراتيجية طويلة الأجل للأندية والاتحادات.",
    memberNames: [],
    maxApprovalThresholdAmount: null,
    backupRoleKey: null,
    color: "emerald",
    permissions: [
      CRM_PERMISSIONS.OPPORTUNITIES_READ,
      CRM_PERMISSIONS.OPPORTUNITIES_STAGE,
      CRM_PERMISSIONS.OPPORTUNITIES_CLOSE,
      CRM_PERMISSIONS.OPPORTUNITIES_REOPEN,
    ],
    isSystem: true,
  },
];

/** Default ABAC record-relative principals. */
export const DEFAULT_RECORD_PRINCIPALS = [
  {
    key: "principal:record.owner",
    nameEn: "Current Record Owner",
    nameAr: "مالك السجل الحالي",
    descriptionEn: "User assigned as primary commercial owner of this Lead or Opportunity.",
    descriptionAr: "المستخدم المعيّن كمالك تجاري رئيسي لهذه الفرصة أو العميل المحتمل.",
  },
  {
    key: "principal:record.creator",
    nameEn: "Record Creator / Originator",
    nameAr: "منشئ السجل الأصلي",
    descriptionEn: "User who originally created or captured the commercial record.",
    descriptionAr: "المستخدم الذي أنشأ السجل التجاري في البداية.",
  },
  {
    key: "principal:record.owner_manager",
    nameEn: "Owner's Line Manager",
    nameAr: "المدير المباشر للمالك",
    descriptionEn: "Commercial director or line manager overseeing the assigned record owner.",
    descriptionAr: "المدير المباشر أو المشرف التجاري المسؤول عن مالك السجل.",
  },
  {
    key: "principal:record.four_eyes",
    nameEn: "Four-Eyes Reviewer (Not Previous Mover)",
    nameAr: "مراجع الرقابة الثنائية (غير المنفذ السابق)",
    descriptionEn: "Enforces separation of duties: cannot be the same user who executed the previous transition.",
    descriptionAr: "يفرض مبدأ الفصل في المهام: يجب أن يكون مختلفاً عن منفذ المرحلة السابقة.",
  },
];

/** Default customer buying committee roles. */
export const DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES: CrmBuyingCommitteeRoleOption[] = [
  { key: "DecisionMaker", labelEn: "Decision Maker", labelAr: "صانع القرار", isSystem: true },
  { key: "EconomicBuyer", labelEn: "Economic Buyer / CFO", labelAr: "المشتري المالي / المدير المالي", isSystem: true },
  { key: "TechnicalEvaluator", labelEn: "Technical / Sporting Evaluator", labelAr: "المقيّم الفني / الرياضي", isSystem: true },
  { key: "LegalProcurement", labelEn: "Legal & Procurement", labelAr: "الشؤون القانونية والمشتريات", isSystem: true },
  { key: "InternalChampion", labelEn: "Internal Champion", labelAr: "الداعم الداخلي", isSystem: true },
];

/** Parses server `CustomFieldsConfigJson` while respecting authoritative empty arrays. */
export function parseCustomGovernanceConfigJson(
  customFieldsConfigJson: string | null | undefined,
  fallback?: Partial<ParsedGovernanceConfig>
): ParsedGovernanceConfig {
  let customFields = fallback?.customFields ?? DEFAULT_CRM_CUSTOM_FIELDS;
  let crmRoles = fallback?.crmRoles ?? DEFAULT_SETTINGS_SCOPED_ROLES;
  let buyingCommitteeRoles =
    fallback?.buyingCommitteeRoles ?? DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES;
  let configuredLossReasons =
    fallback?.configuredLossReasons ?? DEFAULT_CONFIGURED_LOSS_REASONS;
  let configuredActivityTypes =
    fallback?.configuredActivityTypes ?? DEFAULT_CONFIGURED_ACTIVITY_TYPES;

  if (customFieldsConfigJson) {
    try {
      const parsed: unknown = JSON.parse(customFieldsConfigJson);
      if (Array.isArray(parsed)) {
        customFields = parsed as CrmCustomFieldDefinition[];
      } else if (parsed && typeof parsed === "object") {
        const obj = parsed as Record<string, unknown>;
        if (Array.isArray(obj.customFields)) {
          customFields = obj.customFields as CrmCustomFieldDefinition[];
        }
        if (Array.isArray(obj.crmRoles)) {
          crmRoles = obj.crmRoles as CrmScopedRoleDefinition[];
        }
        if (Array.isArray(obj.buyingCommitteeRoles)) {
          buyingCommitteeRoles = obj.buyingCommitteeRoles as CrmBuyingCommitteeRoleOption[];
        }
        if (Array.isArray(obj.configuredLossReasons)) {
          configuredLossReasons = obj.configuredLossReasons as CrmConfigurableOptionItem[];
        }
        if (Array.isArray(obj.configuredActivityTypes)) {
          configuredActivityTypes = obj.configuredActivityTypes as CrmConfigurableOptionItem[];
        }
      }
    } catch {
      // Keep fallback values on malformed server JSON
    }
  }

  return {
    customFields,
    crmRoles,
    buyingCommitteeRoles,
    configuredLossReasons,
    configuredActivityTypes,
  };
}
