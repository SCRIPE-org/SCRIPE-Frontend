import type {
  CrmBuyingCommitteeRoleOption,
  CrmScopedRoleDefinition,
  CrmStageGateStrictness,
} from "../../../../shared";

/** Raw tenant settings DTO returned by `SettingsController`. */
export interface CrmTenantSettingsRawDto {
  baseCurrencyCode?: string;
  defaultDealCurrencyCode?: string;
  autoConvertAmountsToBase?: boolean;
  showDualCurrencyBadges?: boolean;
  allowUserCurrencyOverride?: boolean;
  snapshotExchangeRateOnDealCreation?: boolean;
  stageGateStrictness?: CrmStageGateStrictness;
  requireVerifiedPartyOnProposal?: boolean;
  requireCloseNotesOnWin?: boolean;
  defaultLeadSource?: string;
  slaLeadResponseHours?: number;
  stalledDealThresholdDays?: number;
  duplicateDetectionMode?: "strict" | "fuzzy" | "advisory";
  leadAutoAssignmentRule?: "round_robin" | "territory" | "manual";
  enableCatalogPricingQuoteHandoff?: boolean;
  enableVenueAcademyCommercialHandoff?: boolean;
  autoCreateWorkItemsOnStageMove?: boolean;
  defaultCommunicationChannel?: "email" | "whatsapp" | "in_app";
  autoSyncPartyKernelOnConvert?: boolean;
  customFieldsConfigJson?: string | null;
  workflowCanvasConfigJson?: string | null;
  rowVersion?: number | string;
}

/** Raw per-user CRM preferences DTO. */
export interface CrmUserPreferencesRawDto {
  overrideCurrencyCode?: string | null;
  defaultDealViewMode?: string;
  defaultPipelineCode?: string;
  cardDensity?: string;
  autoConvertAmountsOverride?: boolean | null;
  showDualCurrencyBadgesOverride?: boolean | null;
  dailyDigestEnabled?: boolean;
  stageMoveNotificationsEnabled?: boolean;
  rowVersion?: number | string;
}

/** Raw composite settings response DTO from `GET /api/v1/crm/settings`. */
export interface CrmSettingsResponseRawDto {
  effectiveBaseCurrencyCode?: string;
  effectiveAutoConvertToBase?: boolean;
  effectiveShowDualCurrencyBadges?: boolean;
  tenantSettings?: CrmTenantSettingsRawDto;
  userPreferences?: CrmUserPreferencesRawDto;
  exchangeRatesUsdBase?: Record<string, number>;
  exchangeRatesPerUsd?: Record<string, number>;
  lastRateUpdatedAtUtc?: string | null;
  ratesLastUpdatedUtc?: string | null;
  effectiveDealViewMode?: string;
  effectivePipelineCode?: string;
  effectiveCardDensity?: string;
}

/** Raw governance catalog DTO from `GET /api/v1/crm/settings/governance-catalog`. */
export interface CrmGovernanceCatalogRawDto {
  defaultScopedRoles?: CrmScopedRoleDefinition[];
  defaultBuyingCommitteeRoles?: CrmBuyingCommitteeRoleOption[];
  recordPrincipals?: Array<{
    key: string;
    nameEn: string;
    nameAr: string;
    descriptionEn: string;
    descriptionAr: string;
  }>;
  scopedPermissions?: Array<{
    key: string;
    labelEn: string;
    labelAr: string;
    category: string;
  }>;
}

/** Raw assignee lookup DTO from `GET /api/v1/crm/settings/assignees`. */
export interface CrmAssigneeLookupRawDto {
  id?: string;
  userId?: string;
  teamId?: string;
  kind?: string;
  displayName?: string;
  fullNameEn?: string;
  nameEn?: string;
  name?: string;
  displayNameAr?: string | null;
  fullNameAr?: string | null;
  nameAr?: string | null;
  subtitle?: string | null;
  roleName?: string | null;
  role?: string | null;
  department?: string | null;
  teamName?: string | null;
  email?: string | null;
}

/** Standard API envelope wrapper. */
export interface CrmSettingsApiEnvelope<T> {
  data?: T;
}
