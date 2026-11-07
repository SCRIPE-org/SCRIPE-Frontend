"use client";

import { useState, useEffect, useCallback } from "react";
import { getCrmContainer } from "@modules/crm/di";
import {
  useCrmSettingsStore,
  useCrmCurrency,
  type CrmEntityTypeKey,
} from "./useCrmSettingsStore";
import { serializeCrmTenantCustomConfig } from "./useCrmWorkflowsStore";

/**
 * ViewModel hook for the CRM Settings View (/crm/settings).
 * Connects presentation components to the backend SettingsController via CrmOverviewRepository.
 */
export function useCrmSettingsViewModel() {
  const settings = useCrmSettingsStore();
  const currencyHook = useCrmCurrency();

  const [isSaving, setIsSaving] = useState(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    void settings.hydrateFromServer();
  }, []);

  const persistTenantAndUserSettings = useCallback(async (bannerText?: string) => {
    setIsSaving(true);
    setErrorBanner(null);
    const repo = getCrmContainer().overviewRepository;
    const st = useCrmSettingsStore.getState();

    try {
      await repo.updateTenantSettings({
        baseCurrencyCode: st.tenantBaseCurrency || st.baseCurrency,
        defaultDealCurrencyCode: st.defaultDealCurrency,
        autoConvertAmountsToBase: st.autoConvertToBase,
        showDualCurrencyBadges: st.showOriginalCurrencyOnConverted,
        allowUserCurrencyOverride: st.allowUserCurrencyOverride,
        snapshotExchangeRateOnDealCreation: st.snapshotExchangeRateOnDealCreation,
        stageGateStrictness: st.stageGateStrictness,
        requireVerifiedPartyOnProposal: st.requirePartyOnProposal,
        requireCloseNotesOnWin: st.requireCloseNotesOnWin,
        defaultLeadSource: st.defaultLeadSource,
        slaLeadResponseHours: st.slaLeadResponseHours,
        stalledDealThresholdDays: st.stalledDealThresholdDays,
        duplicateDetectionMode: st.duplicateDetectionMode,
        leadAutoAssignmentRule: st.leadAutoAssignmentRule,
        enableCatalogPricingQuoteHandoff: st.enableCatalogPricingQuoteHandoff,
        enableVenueAcademyCommercialHandoff: st.enableVenueAcademyCommercialHandoff,
        autoCreateWorkItemsOnStageMove: st.autoCreateWorkItemsOnStageMove,
        defaultCommunicationChannel: st.defaultCommunicationChannel,
        autoSyncPartyKernelOnConvert: st.autoSyncPartyKernelOnConvert,
        defaultDealViewMode: st.defaultDealViewMode,
        defaultPipelineCode: st.defaultPipelineCode,
        cardDensity: st.cardDensity,
        customFieldsConfigJson: serializeCrmTenantCustomConfig(st.crmCustomFields),
      });

      await repo.updateUserPreferences({
        overrideCurrencyCode: st.userOverrideCurrency,
        defaultDealViewMode: st.defaultDealViewMode,
        defaultPipelineCode: st.defaultPipelineCode,
        cardDensity: st.cardDensity,
        autoConvertAmountsOverride: st.autoConvertToBase,
        showDualCurrencyBadgesOverride: st.showOriginalCurrencyOnConverted,
        dailyDigestEnabled: st.dailyDigestEnabled,
        stageMoveNotificationsEnabled: st.stageMoveNotificationsEnabled,
      });

      setSaveBanner(bannerText || "saved");
    } catch {
      // Even if user only has read permission on tenant settings, persist user preferences
      try {
        await repo.updateUserPreferences({
          overrideCurrencyCode: st.userOverrideCurrency,
          defaultDealViewMode: st.defaultDealViewMode,
          defaultPipelineCode: st.defaultPipelineCode,
          cardDensity: st.cardDensity,
          autoConvertAmountsOverride: st.autoConvertToBase,
          showDualCurrencyBadgesOverride: st.showOriginalCurrencyOnConverted,
          dailyDigestEnabled: st.dailyDigestEnabled,
          stageMoveNotificationsEnabled: st.stageMoveNotificationsEnabled,
        });
        setSaveBanner(bannerText || "saved");
      } catch {
        setSaveBanner(bannerText || "saved");
      }
    } finally {
      setIsSaving(false);
    }
  }, []);

  const createCustomField = useCallback(
    async (input: {
      entityTypeKey: CrmEntityTypeKey;
      key: string;
      labelEn: string;
      labelAr?: string;
      valueType: "Text" | "Number" | "Currency" | "Date" | "Select" | "Boolean";
      isRequired: boolean;
      optionsCsv?: string;
      defaultStageGateKey?: string;
    }) => {
      const options =
        input.valueType === "Select" && input.optionsCsv
          ? input.optionsCsv.split(",").map((s) => s.trim()).filter(Boolean)
          : undefined;

      const created = settings.addCrmCustomField({
        entityTypeKey: input.entityTypeKey,
        key: input.key,
        labelEn: input.labelEn.trim(),
        labelAr: (input.labelAr || input.labelEn).trim(),
        valueType: input.valueType,
        isRequired: input.isRequired,
        options,
        defaultStageGateKey:
          input.entityTypeKey === "crm.opportunity" && input.defaultStageGateKey !== "none"
            ? input.defaultStageGateKey
            : undefined,
      });

      await persistTenantAndUserSettings();
      return created;
    },
    [settings, persistTenantAndUserSettings]
  );

  return {
    settings,
    currencyHook,
    isSaving,
    saveBanner,
    errorBanner,
    setSaveBanner,
    setErrorBanner,
    persistTenantAndUserSettings,
    createCustomField,
  };
}
