import {
  parseCustomGovernanceConfigJson,
  type CrmSettingsResponseData,
  type ParsedGovernanceConfig,
} from "@modules/crm/shared";
import type { CrmSettingsDraftState } from "../constants/crmSettingsDefaults";

/** Governance config JSON parser and parsed payload type re-exports. */
export { parseCustomGovernanceConfigJson, type ParsedGovernanceConfig };

/** Serializes tenant custom governance JSON without `dealCommercialPackages`. */
export function serializeCustomGovernanceConfigJson(draft: CrmSettingsDraftState): string {
  return JSON.stringify({
    customFields: draft.crmCustomFields,
    crmRoles: draft.crmRoles,
    buyingCommitteeRoles: draft.buyingCommitteeRoles,
    configuredLossReasons: draft.configuredLossReasons,
    configuredActivityTypes: draft.configuredActivityTypes,
  });
}

/** Maps a `CrmSettingsResponseData` or `CrmSettingsEntity` into an editable `CrmSettingsDraftState`. */
export function mapSettingsResponseToDraftState(
  entity: CrmSettingsResponseData,
  fallback?: Partial<ParsedGovernanceConfig>
): CrmSettingsDraftState {
  const t = entity.tenantSettings;
  const u = entity.userPreferences;
  const parsed = parseCustomGovernanceConfigJson(t.customFieldsConfigJson, fallback);

  return {
    baseCurrency: (entity.effectiveBaseCurrencyCode || "SAR").toUpperCase(),
    tenantBaseCurrency: (t.baseCurrencyCode || "SAR").toUpperCase(),
    userOverrideCurrency: u.overrideCurrencyCode ? u.overrideCurrencyCode.toUpperCase() : null,
    defaultDealCurrency: (t.defaultDealCurrencyCode || "SAR").toUpperCase(),
    autoConvertToBase: entity.effectiveAutoConvertToBase,
    showOriginalCurrencyOnConverted: entity.effectiveShowDualCurrencyBadges,
    allowUserCurrencyOverride: t.allowUserCurrencyOverride,
    snapshotExchangeRateOnDealCreation: t.snapshotExchangeRateOnDealCreation,
    stageGateStrictness: t.stageGateStrictness,
    requirePartyOnProposal: t.requireVerifiedPartyOnProposal,
    requireCloseNotesOnWin: t.requireCloseNotesOnWin,
    defaultLeadSource: t.defaultLeadSource,
    slaLeadResponseHours: t.slaLeadResponseHours,
    stalledDealThresholdDays: t.stalledDealThresholdDays,
    duplicateDetectionMode: t.duplicateDetectionMode,
    leadAutoAssignmentRule: t.leadAutoAssignmentRule,
    enableCatalogPricingQuoteHandoff: t.enableCatalogPricingQuoteHandoff,
    enableVenueAcademyCommercialHandoff: t.enableVenueAcademyCommercialHandoff,
    autoCreateWorkItemsOnStageMove: t.autoCreateWorkItemsOnStageMove,
    defaultCommunicationChannel: t.defaultCommunicationChannel,
    autoSyncPartyKernelOnConvert: t.autoSyncPartyKernelOnConvert,
    defaultDealViewMode: u.defaultDealViewMode,
    defaultPipelineCode: u.defaultPipelineCode,
    cardDensity: u.cardDensity,
    dailyDigestEnabled: u.dailyDigestEnabled,
    stageMoveNotificationsEnabled: u.stageMoveNotificationsEnabled,
    customRateOverrides: {},
    crmCustomFields: parsed.customFields,
    crmRoles: parsed.crmRoles,
    buyingCommitteeRoles: parsed.buyingCommitteeRoles,
    configuredLossReasons: parsed.configuredLossReasons,
    configuredActivityTypes: parsed.configuredActivityTypes,
    tenantRowVersion: t.rowVersion,
    userRowVersion: u.rowVersion,
  };
}
