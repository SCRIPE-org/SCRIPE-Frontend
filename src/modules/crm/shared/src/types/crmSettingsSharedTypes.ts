/** Stage gate validation strictness mode. */
export type CrmStageGateStrictness = "strict" | "advisory" | "custom";

/** Entity type keys supported by CRM custom fields. */
export type CrmEntityTypeKey =
  | "crm.opportunity"
  | "crm.lead"
  | "crm.account"
  | "crm.contact";

/** Supported custom field value types. */
export type CrmCustomFieldValueType = "Text" | "Number" | "Currency" | "Date" | "Select" | "Boolean";

/** Custom field definition bound to CRM entities and optional stage exit gates. */
export interface CrmCustomFieldDefinition {
  id: string;
  entityTypeKey: CrmEntityTypeKey;
  key: string;
  labelEn: string;
  labelAr: string;
  valueType: CrmCustomFieldValueType;
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

/** Persisted client-only board view preferences. */
export interface CrmPersistedBoardSettings {
  swimlaneMode: "none" | "assignee" | "account" | "dealType";
  cardDensity?: "Compact" | "Standard" | "Executive";
  wipLimits: Record<string, { min?: number; max?: number }>;
}

/** Decoupled CRM pipeline/workflow role definition (`pipe_role:*`). */
export interface CrmScopedRoleDefinition {
  id: string;
  key: string;
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

/** Buying committee stakeholder role option. */
export interface CrmBuyingCommitteeRoleOption {
  key: string;
  labelEn: string;
  labelAr: string;
  isSystem?: boolean;
}

/** Server-persisted tenant-wide CRM governance and currency configuration. */
export interface CrmTenantSettingsPayload {
  baseCurrencyCode: string;
  defaultDealCurrencyCode: string;
  autoConvertAmountsToBase: boolean;
  showDualCurrencyBadges: boolean;
  allowUserCurrencyOverride: boolean;
  snapshotExchangeRateOnDealCreation: boolean;
  stageGateStrictness: CrmStageGateStrictness;
  requireVerifiedPartyOnProposal: boolean;
  requireCloseNotesOnWin: boolean;
  defaultLeadSource: string;
  slaLeadResponseHours: number;
  stalledDealThresholdDays: number;
  duplicateDetectionMode: "strict" | "fuzzy" | "advisory";
  leadAutoAssignmentRule: "round_robin" | "territory" | "manual";
  enableCatalogPricingQuoteHandoff: boolean;
  enableVenueAcademyCommercialHandoff: boolean;
  autoCreateWorkItemsOnStageMove: boolean;
  defaultCommunicationChannel: "email" | "whatsapp" | "in_app";
  autoSyncPartyKernelOnConvert: boolean;
  customFieldsConfigJson?: string | null;
  workflowCanvasConfigJson?: string | null;
  defaultDealViewMode?: "Kanban" | "Table" | "SplitPane";
  defaultPipelineCode?: string;
  cardDensity?: "Comfortable" | "Compact";
  rowVersion?: number | string;
}

/** Server-persisted per-user CRM display & currency override preferences. */
export interface CrmUserPreferencePayload {
  overrideCurrencyCode?: string | null;
  defaultDealViewMode: "Kanban" | "Table" | "SplitPane";
  defaultPipelineCode: string;
  cardDensity: "Comfortable" | "Compact";
  autoConvertAmountsOverride?: boolean | null;
  showDualCurrencyBadgesOverride?: boolean | null;
  dailyDigestEnabled: boolean;
  stageMoveNotificationsEnabled: boolean;
  rowVersion?: number | string;
}

/** Composite server-side CRM settings response including live exchange rates. */
export interface CrmSettingsResponseData {
  effectiveBaseCurrencyCode: string;
  effectiveAutoConvertToBase: boolean;
  effectiveShowDualCurrencyBadges: boolean;
  tenantSettings: CrmTenantSettingsPayload;
  userPreferences: CrmUserPreferencePayload;
  exchangeRatesUsdBase: Record<string, number>;
  lastRateUpdatedAtUtc?: string | null;
  effectiveDealViewMode?: "Kanban" | "Table" | "SplitPane";
  effectivePipelineCode?: string;
  effectiveCardDensity?: "Comfortable" | "Compact";
}

/** Governance catalog item returned by GET /v1/crm/settings/governance-catalog. */
export interface CrmGovernanceCatalogData {
  defaultScopedRoles: CrmScopedRoleDefinition[];
  defaultBuyingCommitteeRoles: CrmBuyingCommitteeRoleOption[];
  recordPrincipals: Array<{ key: string; nameEn: string; nameAr: string; descriptionEn: string; descriptionAr: string }>;
  scopedPermissions: Array<{ key: string; labelEn: string; labelAr: string; category: string }>;
}

/** Assignee lookup option returned by GET /v1/crm/settings/assignees. */
export interface CrmAssigneeLookupItem {
  id: string;
  kind: "user" | "team";
  displayName: string;
  displayNameAr?: string | null;
  subtitle?: string | null;
  email?: string | null;
}

/** Repository interface for CRM settings, governance catalog, and assignee lookups. */
export interface ICrmSettingsRepository {
  getSettings(): Promise<CrmSettingsResponseData>;
  getGovernanceCatalog(): Promise<CrmGovernanceCatalogData>;
  lookupAssignees(query?: string, kind?: "user" | "team" | "all", limit?: number): Promise<CrmAssigneeLookupItem[]>;
  updateTenantSettings(input: Partial<CrmTenantSettingsPayload>): Promise<CrmSettingsResponseData>;
  updateUserPreferences(input: Partial<CrmUserPreferencePayload>): Promise<CrmSettingsResponseData>;
}
