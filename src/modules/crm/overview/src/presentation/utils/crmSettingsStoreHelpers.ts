import {
  CRM_FALLBACK_USD_RATES,
  CRM_CURRENCY_OPTIONS,
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_SETTINGS,
  DEFAULT_NEW_WORKFLOW_META,
  type CrmStageGateStrictness,
  type CrmEntityTypeKey,
  type CrmCustomFieldDefinition,
  type CrmConfigurableOptionItem,
  type CrmPersistedBoardSettings,
  type CrmDealQuoteLineItem,
  type CrmDealCommercialPackage,
} from "../../domain/constants/crmSettingsDefaults";
import { getCrmContainer } from "@modules/crm/di";
import { serializeCrmTenantCustomConfig } from "./crmWorkflowsAuthAndConfigHelpers";
import {
  useCrmWorkflowsStore,
  DEFAULT_CRM_SCOPED_ROLES,
  DEFAULT_BUYING_COMMITTEE_ROLES,
  type CrmScopedRoleDefinition,
  type CrmBuyingCommitteeRoleOption,
} from "../stores/useCrmWorkflowsStore";

export {
  CRM_FALLBACK_USD_RATES,
  CRM_CURRENCY_OPTIONS,
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_SETTINGS,
  DEFAULT_NEW_WORKFLOW_META,
  DEFAULT_CRM_SCOPED_ROLES,
  DEFAULT_BUYING_COMMITTEE_ROLES,
  type CrmStageGateStrictness,
  type CrmEntityTypeKey,
  type CrmCustomFieldDefinition,
  type CrmConfigurableOptionItem,
  type CrmPersistedBoardSettings,
  type CrmDealQuoteLineItem,
  type CrmDealCommercialPackage,
};

/** Parses server CustomFieldsConfigJson while respecting authoritative empty arrays from server. */
export function parseCustomGovernanceConfigJson(
  customFieldsConfigJson: string | null | undefined,
  fallback: {
    crmCustomFields: CrmCustomFieldDefinition[];
    crmRoles: CrmScopedRoleDefinition[];
    buyingCommitteeRoles: CrmBuyingCommitteeRoleOption[];
    configuredLossReasons: CrmConfigurableOptionItem[];
    configuredActivityTypes: CrmConfigurableOptionItem[];
    dealCommercialPackages?: Record<string, CrmDealCommercialPackage>;
  },
) {
  let customFields = fallback.crmCustomFields;
  let crmRoles = fallback.crmRoles;
  let buyingCommitteeRoles = fallback.buyingCommitteeRoles;
  let configuredLossReasons = fallback.configuredLossReasons;
  let configuredActivityTypes = fallback.configuredActivityTypes;
  let dealCommercialPackages = fallback.dealCommercialPackages ?? {};

  if (customFieldsConfigJson) {
    try {
      const raw = JSON.parse(customFieldsConfigJson);
      if (Array.isArray(raw)) {
        customFields = raw;
      } else if (raw && typeof raw === "object") {
        if (Array.isArray(raw.customFields)) customFields = raw.customFields;
        if (Array.isArray(raw.crmRoles)) crmRoles = raw.crmRoles;
        if (Array.isArray(raw.buyingCommitteeRoles))
          buyingCommitteeRoles = raw.buyingCommitteeRoles;
        if (Array.isArray(raw.configuredLossReasons))
          configuredLossReasons = raw.configuredLossReasons;
        if (Array.isArray(raw.configuredActivityTypes))
          configuredActivityTypes = raw.configuredActivityTypes;
        if (
          raw.dealCommercialPackages &&
          typeof raw.dealCommercialPackages === "object"
        ) {
          dealCommercialPackages = raw.dealCommercialPackages;
        }
        if (Array.isArray(raw.workflows) && raw.workflows.length > 0) {
          useCrmWorkflowsStore.getState().hydrateFromServerPayload(raw);
        }
      }
    } catch {
      /* keep fallback */
    }
  }
  return {
    customFields,
    crmRoles,
    buyingCommitteeRoles,
    configuredLossReasons,
    configuredActivityTypes,
    dealCommercialPackages,
  };
}

export function syncCrmTenantSettingsToServer(st: any, baseOverride?: string) {
  const base = (baseOverride || st.tenantBaseCurrency || "SAR").toUpperCase();
  try {
    const repo = getCrmContainer()?.overviewRepository;
    if (typeof repo?.updateTenantSettings === "function") {
      void repo.updateTenantSettings({
        baseCurrencyCode: base, defaultDealCurrencyCode: baseOverride ? base : st.defaultDealCurrency,
        autoConvertAmountsToBase: st.autoConvertToBase, showDualCurrencyBadges: st.showOriginalCurrencyOnConverted,
        allowUserCurrencyOverride: st.allowUserCurrencyOverride, snapshotExchangeRateOnDealCreation: st.snapshotExchangeRateOnDealCreation,
        stageGateStrictness: st.stageGateStrictness, requireVerifiedPartyOnProposal: st.requirePartyOnProposal,
        requireCloseNotesOnWin: st.requireCloseNotesOnWin, defaultLeadSource: st.defaultLeadSource,
        slaLeadResponseHours: st.slaLeadResponseHours, stalledDealThresholdDays: st.stalledDealThresholdDays,
        duplicateDetectionMode: st.duplicateDetectionMode, leadAutoAssignmentRule: st.leadAutoAssignmentRule,
        enableCatalogPricingQuoteHandoff: st.enableCatalogPricingQuoteHandoff, enableVenueAcademyCommercialHandoff: st.enableVenueAcademyCommercialHandoff,
        autoCreateWorkItemsOnStageMove: st.autoCreateWorkItemsOnStageMove, defaultCommunicationChannel: st.defaultCommunicationChannel,
        autoSyncPartyKernelOnConvert: st.autoSyncPartyKernelOnConvert, defaultDealViewMode: st.defaultDealViewMode,
        defaultPipelineCode: st.defaultPipelineCode, cardDensity: st.cardDensity,
        customFieldsConfigJson: serializeCrmTenantCustomConfig(
          st.crmCustomFields, st.crmRoles, st.buyingCommitteeRoles, st.configuredLossReasons, st.configuredActivityTypes, st.dealCommercialPackages,
        ),
      }).catch(() => undefined);
    }
  } catch { /* noop */ }
}

export function mapHydratedSettingsResponse(data: any, parsed: ReturnType<typeof parseCustomGovernanceConfigJson>) {
  const t = data.tenantSettings, u = data.userPreferences;
  return {
    baseCurrency: (data.effectiveBaseCurrencyCode || "SAR").toUpperCase(),
    tenantBaseCurrency: (t.baseCurrencyCode || "SAR").toUpperCase(),
    userOverrideCurrency: u.overrideCurrencyCode ? u.overrideCurrencyCode.toUpperCase() : null,
    defaultDealCurrency: (t.defaultDealCurrencyCode || "SAR").toUpperCase(),
    autoConvertToBase: data.effectiveAutoConvertToBase,
    showOriginalCurrencyOnConverted: data.effectiveShowDualCurrencyBadges,
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
    crmCustomFields: parsed.customFields,
    crmRoles: parsed.crmRoles,
    buyingCommitteeRoles: parsed.buyingCommitteeRoles,
    configuredLossReasons: parsed.configuredLossReasons,
    configuredActivityTypes: parsed.configuredActivityTypes,
    dealCommercialPackages: parsed.dealCommercialPackages,
    isHydrating: false,
    isServerHydrated: true,
  };
}

/** Pure deterministic currency conversion utility using USD cross-rates. */
export function convertCrmCurrencyAmount(
  amount: number,
  fromCurrency?: string | null,
  toCurrency?: string | null,
  ratesTable: Record<string, number> = CRM_FALLBACK_USD_RATES,
): number {
  if (!Number.isFinite(amount) || amount === 0) return 0;
  const from = (fromCurrency || "SAR").toUpperCase();
  const to = (toCurrency || "SAR").toUpperCase();
  if (from === to) return amount;
  const fromRate = ratesTable[from] ?? CRM_FALLBACK_USD_RATES[from] ?? 1;
  const toRate = ratesTable[to] ?? CRM_FALLBACK_USD_RATES[to] ?? 1;
  return fromRate > 0 && toRate > 0
    ? Math.round((amount / fromRate) * toRate * 100) / 100
    : amount;
}

/** Returns how many units of `toCurrency` equal 1 unit of `fromCurrency`. */
export function getCrossExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  ratesTable: Record<string, number> = CRM_FALLBACK_USD_RATES,
): number {
  const from = (fromCurrency || "SAR").toUpperCase();
  const to = (toCurrency || "SAR").toUpperCase();
  if (from === to) return 1;
  const fromRate = ratesTable[from] ?? CRM_FALLBACK_USD_RATES[from] ?? 1;
  const toRate = ratesTable[to] ?? CRM_FALLBACK_USD_RATES[to] ?? 1;
  return fromRate > 0 ? toRate / fromRate : 1;
}
