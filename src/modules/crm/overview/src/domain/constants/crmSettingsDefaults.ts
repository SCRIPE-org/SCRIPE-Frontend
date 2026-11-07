import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import {
  DEFAULT_CRM_SCOPED_ROLES,
  DEFAULT_BUYING_COMMITTEE_ROLES,
  type CrmScopedRoleDefinition,
  type CrmBuyingCommitteeRoleOption,
} from "./crmWorkflowGovernanceCatalog";

/** Baseline USD exchange rates matching SCRIPE-Backend CurrencyExchangeService fallback table. */
export const CRM_FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.6725,
  EGP: 50.85,
  KWD: 0.308,
  BHD: 0.376,
  OMR: 0.385,
  QAR: 3.64,
  TRY: 32.5,
  INR: 83.5,
  CAD: 1.37,
  AUD: 1.54,
};

/** Supported currencies exposed across CRM selectors and settings with both name and nameEn. */
export const CRM_CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((c) => ({
  ...c,
  nameEn: c.name,
}));

/** Stage gate validation strictness mode. */
export type CrmStageGateStrictness = "strict" | "advisory" | "custom";
/** Entity type keys supported by CRM custom fields. */
export type CrmEntityTypeKey =
  | "crm.opportunity"
  | "crm.lead"
  | "crm.account"
  | "crm.contact";

/** Custom field definition bound to CRM entities and optional stage exit gates. */
export interface CrmCustomFieldDefinition {
  id: string;
  entityTypeKey: CrmEntityTypeKey;
  key: string;
  labelEn: string;
  labelAr: string;
  valueType: "Text" | "Number" | "Currency" | "Date" | "Select" | "Boolean";
  isRequired: boolean;
  options?: string[];
  defaultStageGateKey?: string;
  createdAtIso?: string;
}

/** Configurable CRM option item (used for Activity Types and Outcome/Loss Reasons). */
export interface CrmConfigurableOptionItem {
  code: string;
  labelEn: string;
  labelAr: string;
}

export interface CrmPersistedBoardSettings {
  swimlaneMode: "none" | "assignee" | "account" | "dealType";
  cardDensity?: "Compact" | "Standard" | "Executive";
  wipLimits: Record<string, { min?: number; max?: number }>;
}

/** Commercial quote line item persisted in backend tenant settings per deal. */
export interface CrmDealQuoteLineItem {
  id: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  discountPct: number;
}

/** Server-persisted deal commercial package (quote items + Venue/Academy provisioning state). */
export interface CrmDealCommercialPackage {
  quoteItems: CrmDealQuoteLineItem[];
  venueHoldStatus: "idle" | "reserved";
  academyCohortStatus: "idle" | "provisioned";
}

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

export const DEFAULT_CONFIGURED_LOSS_REASONS: CrmConfigurableOptionItem[] = [
  { code: "budget_cut", labelEn: "Budget Cut / Freeze", labelAr: "تخفيض أو تجميد الميزانية" },
  { code: "competitor", labelEn: "Lost to Competitor", labelAr: "خسارة لصالح منافس" },
  { code: "pricing", labelEn: "Pricing / Commercial Terms", labelAr: "التسعير أو الشروط التجارية" },
  { code: "timing", labelEn: "Timing / Postponed", labelAr: "التوقيت أو التأجيل" },
  { code: "feature_gap", labelEn: "Capability / Feature Gap", labelAr: "فجوة في المتطلبات الفنية" },
  { code: "no_decision", labelEn: "No Decision / Stalled", labelAr: "عدم اتخاذ قرار" },
  { code: "other", labelEn: "Other", labelAr: "سبب آخر" },
];

export const DEFAULT_CONFIGURED_ACTIVITY_TYPES: CrmConfigurableOptionItem[] = [
  { code: "Note", labelEn: "Note", labelAr: "ملاحظة" },
  { code: "CallLog", labelEn: "Call Log", labelAr: "سجل مكالمة" },
  { code: "MeetingLog", labelEn: "Meeting Log", labelAr: "سجل اجتماع" },
  { code: "SiteVisit", labelEn: "Venue / Pitch Site Visit", labelAr: "زيارة ميدانية للمنشأة" },
];

export const DEFAULT_SETTINGS = {
  baseCurrency: "SAR",
  tenantBaseCurrency: "SAR",
  userOverrideCurrency: null as string | null,
  defaultDealCurrency: "SAR",
  autoConvertToBase: true,
  showOriginalCurrencyOnConverted: true,
  allowUserCurrencyOverride: true,
  snapshotExchangeRateOnDealCreation: true,
  stageGateStrictness: "strict" as CrmStageGateStrictness,
  requirePartyOnProposal: true,
  requireCloseNotesOnWin: true,
  defaultLeadSource: "Inbound",
  slaLeadResponseHours: 4,
  stalledDealThresholdDays: 14,
  duplicateDetectionMode: "strict" as const,
  leadAutoAssignmentRule: "round_robin" as const,
  enableCatalogPricingQuoteHandoff: true,
  enableVenueAcademyCommercialHandoff: true,
  autoCreateWorkItemsOnStageMove: true,
  defaultCommunicationChannel: "email" as const,
  autoSyncPartyKernelOnConvert: true,
  defaultDealViewMode: "Table" as const,
  defaultPipelineCode: "default",
  cardDensity: "Comfortable" as const,
  boardSettings: {
    swimlaneMode: "none" as const,
    cardDensity: "Standard" as const,
    wipLimits: {} as Record<string, { min?: number; max?: number }>,
  } satisfies CrmPersistedBoardSettings,
  dailyDigestEnabled: true,
  stageMoveNotificationsEnabled: true,
  customRateOverrides: {} as Record<string, number>,
  crmCustomFields: DEFAULT_CRM_CUSTOM_FIELDS,
  crmRoles: DEFAULT_CRM_SCOPED_ROLES as CrmScopedRoleDefinition[],
  buyingCommitteeRoles: DEFAULT_BUYING_COMMITTEE_ROLES as CrmBuyingCommitteeRoleOption[],
  configuredLossReasons: DEFAULT_CONFIGURED_LOSS_REASONS,
  configuredActivityTypes: DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  dealCommercialPackages: {} as Record<string, CrmDealCommercialPackage>,
  isHydrating: false,
  isServerHydrated: false,
  updatedAtIso: null as string | null,
};

export const DEFAULT_NEW_WORKFLOW_META = {
  roleNameEn: "Custom Pipeline Role",
  roleNameAr: "دور خط بيع مخصص",
  roleDescEn: "Decoupled CRM Pipeline / Workflow Approval Queue.",
  roleDescAr: "دور اعتماد ومراجعة مخصص لخطوط البيع ومسارات العمل.",
  relationalPipelineDescEn: "Relational CRM Pipeline",
  relationalPipelineDescAr: "مسار عمل لائحة CRM",
  leadNewEn: "New",
  leadNewAr: "جديد",
  leadConvertedEn: "Converted",
  leadConvertedAr: "تم التحويل",
  dealDiscoveryEn: "Discovery",
  dealDiscoveryAr: "استكشاف",
  dealProposalClosingEn: "Proposal & Closing",
  dealProposalClosingAr: "العرض والإغلاق",
  advanceToPrefixEn: "Advance to",
  advanceToPrefixAr: "الانتقال إلى",
  returnToPrefixEn: "Return to",
  returnToPrefixAr: "العودة إلى",
  customWfNameEn: "Custom CRM Workflow",
  customWfNameAr: "مسار مخصص",
  customWfDescEn: "Custom tenant workflow created in SCRIPE Workflow Studio.",
  customWfDescAr: "مسار عمل مخصص تم إنشاؤه في استوديو مسارات العمل.",
  copySuffixEn: "(Copy)",
  copySuffixAr: "(نسخة)",
} as const;
