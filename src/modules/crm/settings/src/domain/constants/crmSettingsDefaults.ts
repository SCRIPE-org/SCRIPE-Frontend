import type {
  CrmBuyingCommitteeRoleOption,
  CrmConfigurableOptionItem,
  CrmCustomFieldDefinition,
  CrmScopedRoleDefinition,
  CrmSettingsResponseData,
  CrmStageGateStrictness,
} from "@modules/crm/shared";
import {
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_RECORD_PRINCIPALS,
  DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  DEFAULT_SETTINGS_SCOPED_ROLES,
} from "./crmSettingsDictionaries";

/** Re-exported default CRM governance dictionaries for settings viewmodels. */
export {
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_RECORD_PRINCIPALS,
  DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  DEFAULT_SETTINGS_SCOPED_ROLES,
};

/** Editable CRM settings form draft state. */
export interface CrmSettingsDraftState {
  baseCurrency: string;
  tenantBaseCurrency: string;
  userOverrideCurrency: string | null;
  defaultDealCurrency: string;
  autoConvertToBase: boolean;
  showOriginalCurrencyOnConverted: boolean;
  allowUserCurrencyOverride: boolean;
  snapshotExchangeRateOnDealCreation: boolean;
  stageGateStrictness: CrmStageGateStrictness;
  requirePartyOnProposal: boolean;
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
  defaultDealViewMode: "Kanban" | "Table" | "SplitPane";
  defaultPipelineCode: string;
  cardDensity: "Comfortable" | "Compact";
  dailyDigestEnabled: boolean;
  stageMoveNotificationsEnabled: boolean;
  customRateOverrides: Record<string, number>;
  crmCustomFields: CrmCustomFieldDefinition[];
  crmRoles: CrmScopedRoleDefinition[];
  buyingCommitteeRoles: CrmBuyingCommitteeRoleOption[];
  configuredLossReasons: CrmConfigurableOptionItem[];
  configuredActivityTypes: CrmConfigurableOptionItem[];
  tenantRowVersion?: number | string;
  userRowVersion?: number | string;
}

/** Factory-default CRM settings form state. */
export const DEFAULT_CRM_SETTINGS_DRAFT: CrmSettingsDraftState = {
  baseCurrency: "SAR",
  tenantBaseCurrency: "SAR",
  userOverrideCurrency: null,
  defaultDealCurrency: "SAR",
  autoConvertToBase: true,
  showOriginalCurrencyOnConverted: true,
  allowUserCurrencyOverride: true,
  snapshotExchangeRateOnDealCreation: true,
  stageGateStrictness: "strict",
  requirePartyOnProposal: true,
  requireCloseNotesOnWin: true,
  defaultLeadSource: "Inbound",
  slaLeadResponseHours: 4,
  stalledDealThresholdDays: 14,
  duplicateDetectionMode: "strict",
  leadAutoAssignmentRule: "round_robin",
  enableCatalogPricingQuoteHandoff: true,
  enableVenueAcademyCommercialHandoff: true,
  autoCreateWorkItemsOnStageMove: true,
  defaultCommunicationChannel: "email",
  autoSyncPartyKernelOnConvert: true,
  defaultDealViewMode: "Table",
  defaultPipelineCode: "default",
  cardDensity: "Comfortable",
  dailyDigestEnabled: true,
  stageMoveNotificationsEnabled: true,
  customRateOverrides: {},
  crmCustomFields: DEFAULT_CRM_CUSTOM_FIELDS,
  crmRoles: DEFAULT_SETTINGS_SCOPED_ROLES,
  buyingCommitteeRoles: DEFAULT_SETTINGS_BUYING_COMMITTEE_ROLES,
  configuredLossReasons: DEFAULT_CONFIGURED_LOSS_REASONS,
  configuredActivityTypes: DEFAULT_CONFIGURED_ACTIVITY_TYPES,
};

/** Composite domain response fallback matching `CrmSettingsResponseData`. */
export const DEFAULT_SETTINGS_ENTITY_DATA: CrmSettingsResponseData = {
  effectiveBaseCurrencyCode: "SAR",
  effectiveAutoConvertToBase: true,
  effectiveShowDualCurrencyBadges: true,
  tenantSettings: {
    baseCurrencyCode: "SAR",
    defaultDealCurrencyCode: "SAR",
    autoConvertAmountsToBase: true,
    showDualCurrencyBadges: true,
    allowUserCurrencyOverride: true,
    snapshotExchangeRateOnDealCreation: true,
    stageGateStrictness: "strict",
    requireVerifiedPartyOnProposal: true,
    requireCloseNotesOnWin: true,
    defaultLeadSource: "Inbound",
    slaLeadResponseHours: 4,
    stalledDealThresholdDays: 14,
    duplicateDetectionMode: "strict",
    leadAutoAssignmentRule: "round_robin",
    enableCatalogPricingQuoteHandoff: true,
    enableVenueAcademyCommercialHandoff: true,
    autoCreateWorkItemsOnStageMove: true,
    defaultCommunicationChannel: "email",
    autoSyncPartyKernelOnConvert: true,
    customFieldsConfigJson: null,
    workflowCanvasConfigJson: null,
  },
  userPreferences: {
    overrideCurrencyCode: null,
    defaultDealViewMode: "Table",
    defaultPipelineCode: "default",
    cardDensity: "Comfortable",
    autoConvertAmountsOverride: null,
    showDualCurrencyBadgesOverride: null,
    dailyDigestEnabled: true,
    stageMoveNotificationsEnabled: true,
  },
  exchangeRatesUsdBase: {},
};
