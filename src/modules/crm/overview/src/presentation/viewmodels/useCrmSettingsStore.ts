"use client";

import { useEffect, useCallback } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { formatPrice, SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { useCurrencyPreference } from "@core/store/useCurrencyPreference";
import { useCurrencyRates } from "@core/hooks/useCurrencyRates";
import { getCrmContainer } from "../../../../di";
import { useCrmWorkflowsStore, serializeCrmTenantCustomConfig } from "./useCrmWorkflowsStore";

/** Baseline USD exchange rates matching SCRIPE-Backend CurrencyExchangeService fallback table. */
export const CRM_FALLBACK_USD_RATES: Record<string, number> = {
  USD: 1.0, EUR: 0.92, GBP: 0.79, SAR: 3.75, AED: 3.6725, EGP: 50.85,
  KWD: 0.308, BHD: 0.376, OMR: 0.385, QAR: 3.64, TRY: 32.5, INR: 83.5, CAD: 1.37, AUD: 1.54,
};

/** Supported currencies exposed across CRM selectors and settings with both name and nameEn. */
export const CRM_CURRENCY_OPTIONS = SUPPORTED_CURRENCIES.map((c) => ({ ...c, nameEn: c.name }));

/** Stage gate validation strictness mode. */
export type CrmStageGateStrictness = "strict" | "advisory" | "custom";
/** Entity type keys supported by CRM custom fields. */
export type CrmEntityTypeKey = "crm.opportunity" | "crm.lead" | "crm.account" | "crm.contact";

/** Custom field definition bound to CRM entities and optional stage exit gates. */
export interface CrmCustomFieldDefinition {
  id: string; entityTypeKey: CrmEntityTypeKey; key: string; labelEn: string; labelAr: string;
  valueType: "Text" | "Number" | "Currency" | "Date" | "Select" | "Boolean";
  isRequired: boolean; options?: string[]; defaultStageGateKey?: string; createdAtIso?: string;
}

/** Zustand store contract for CRM module settings across all 4 governance domains + user overrides. */
export interface CrmModuleSettingsState {
  baseCurrency: string; tenantBaseCurrency: string; userOverrideCurrency: string | null; defaultDealCurrency: string;
  autoConvertToBase: boolean; showOriginalCurrencyOnConverted: boolean; allowUserCurrencyOverride: boolean; snapshotExchangeRateOnDealCreation: boolean;
  stageGateStrictness: CrmStageGateStrictness; requirePartyOnProposal: boolean; requireCloseNotesOnWin: boolean;
  defaultLeadSource: string; slaLeadResponseHours: number; stalledDealThresholdDays: number;
  duplicateDetectionMode: "strict" | "fuzzy" | "advisory"; leadAutoAssignmentRule: "round_robin" | "territory" | "manual";
  enableCatalogPricingQuoteHandoff: boolean; enableVenueAcademyCommercialHandoff: boolean; autoCreateWorkItemsOnStageMove: boolean;
  defaultCommunicationChannel: "email" | "whatsapp" | "in_app"; autoSyncPartyKernelOnConvert: boolean;
  defaultDealViewMode: "Kanban" | "Table" | "SplitPane"; defaultPipelineCode: string; cardDensity: "Comfortable" | "Compact";
  dailyDigestEnabled: boolean; stageMoveNotificationsEnabled: boolean; customRateOverrides: Record<string, number>;
  crmCustomFields: CrmCustomFieldDefinition[]; isServerHydrated: boolean; updatedAtIso: string | null;

  setBaseCurrency: (currency: string) => void;
  setUserOverrideCurrency: (currency: string | null) => void;
  setDefaultDealCurrency: (currency: string) => void;
  setAutoConvertToBase: (enabled: boolean) => void;
  setShowOriginalCurrencyOnConverted: (enabled: boolean) => void;
  setStageGateStrictness: (mode: CrmStageGateStrictness) => void;
  setRequirePartyOnProposal: (required: boolean) => void;
  setRequireCloseNotesOnWin: (required: boolean) => void;
  setDefaultLeadSource: (source: string) => void;
  setSlaLeadResponseHours: (hours: number) => void;
  setStalledDealThresholdDays: (days: number) => void;
  setCustomRateOverride: (currency: string, ratePerUsd: number) => void;
  resetCustomRateOverrides: () => void;
  addCrmCustomField: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => CrmCustomFieldDefinition;
  removeCrmCustomField: (id: string) => void;
  setDefaultDealViewMode: (mode: "Kanban" | "Table" | "SplitPane") => void;
  updateSettings: (partial: Partial<CrmModuleSettingsState>) => void;
  hydrateFromServer: () => Promise<void>;
  resetDefaults: () => void;
}

const DEFAULT_CRM_CUSTOM_FIELDS: CrmCustomFieldDefinition[] = [
  { id: "cf-crm-opp-procurement-ref", entityTypeKey: "crm.opportunity", key: "procurement_reference_code", labelEn: "Procurement / Tender Reference ID", labelAr: "رقم مرجع المناقصة / المشتريات", valueType: "Text", isRequired: false, defaultStageGateKey: "default.proposal", createdAtIso: "2026-01-01T00:00:00.000Z" },
  { id: "cf-crm-opp-legal-signoff", entityTypeKey: "crm.opportunity", key: "legal_review_ticket", labelEn: "Legal Contract Review Ticket", labelAr: "تذكرة المراجعة القانونية للعقد", valueType: "Text", isRequired: false, defaultStageGateKey: "default.negotiation", createdAtIso: "2026-01-01T00:00:00.000Z" },
];

const DEFAULT_SETTINGS = {
  baseCurrency: "SAR", tenantBaseCurrency: "SAR", userOverrideCurrency: null as string | null, defaultDealCurrency: "SAR",
  autoConvertToBase: true, showOriginalCurrencyOnConverted: true, allowUserCurrencyOverride: true, snapshotExchangeRateOnDealCreation: true,
  stageGateStrictness: "strict" as CrmStageGateStrictness, requirePartyOnProposal: true, requireCloseNotesOnWin: true,
  defaultLeadSource: "Inbound", slaLeadResponseHours: 4, stalledDealThresholdDays: 14,
  duplicateDetectionMode: "strict" as const, leadAutoAssignmentRule: "round_robin" as const,
  enableCatalogPricingQuoteHandoff: true, enableVenueAcademyCommercialHandoff: true, autoCreateWorkItemsOnStageMove: true,
  defaultCommunicationChannel: "email" as const, autoSyncPartyKernelOnConvert: true,
  defaultDealViewMode: "Table" as const, defaultPipelineCode: "default", cardDensity: "Comfortable" as const,
  dailyDigestEnabled: true, stageMoveNotificationsEnabled: true,
  customRateOverrides: {} as Record<string, number>, crmCustomFields: DEFAULT_CRM_CUSTOM_FIELDS,
  isServerHydrated: false, updatedAtIso: null as string | null,
};

let serverHydrationInFlight = false;

function syncTenantToServer(st: CrmModuleSettingsState, baseOverride?: string) {
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
        defaultPipelineCode: st.defaultPipelineCode, cardDensity: st.cardDensity, customFieldsConfigJson: serializeCrmTenantCustomConfig(st.crmCustomFields),
      }).catch(() => undefined);
    }
  } catch { /* noop */ }
}

/** Zustand store for CRM module settings with automatic server-side synchronization. */
export const useCrmSettingsStore = create<CrmModuleSettingsState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_SETTINGS,
      setBaseCurrency: (currency: string) => {
        const normalized = (currency || "SAR").toUpperCase();
        set({ baseCurrency: normalized, tenantBaseCurrency: normalized, defaultDealCurrency: normalized, updatedAtIso: new Date().toISOString() });
        try { useCurrencyPreference.getState().setDisplayCurrency(normalized, "always"); } catch { /* noop */ }
        syncTenantToServer(get(), normalized);
      },
      setUserOverrideCurrency: (currency: string | null) => {
        const normalized = currency && currency !== "INHERIT" ? currency.toUpperCase() : null;
        const st = get();
        const effective = st.allowUserCurrencyOverride && normalized ? normalized : st.tenantBaseCurrency;
        set({ userOverrideCurrency: normalized, baseCurrency: effective, updatedAtIso: new Date().toISOString() });
        try {
          const repo = getCrmContainer()?.overviewRepository;
          if (typeof repo?.updateUserPreferences === "function") {
            void repo.updateUserPreferences({
              overrideCurrencyCode: normalized, defaultDealViewMode: st.defaultDealViewMode, defaultPipelineCode: st.defaultPipelineCode,
              cardDensity: st.cardDensity, dailyDigestEnabled: st.dailyDigestEnabled, stageMoveNotificationsEnabled: st.stageMoveNotificationsEnabled,
            }).catch(() => undefined);
          }
        } catch { /* noop */ }
      },
      setDefaultDealCurrency: (c: string) => set({ defaultDealCurrency: (c || "SAR").toUpperCase(), updatedAtIso: new Date().toISOString() }),
      setAutoConvertToBase: (enabled: boolean) => set({ autoConvertToBase: enabled, updatedAtIso: new Date().toISOString() }),
      setShowOriginalCurrencyOnConverted: (enabled: boolean) => set({ showOriginalCurrencyOnConverted: enabled, updatedAtIso: new Date().toISOString() }),
      setStageGateStrictness: (mode: CrmStageGateStrictness) => set({ stageGateStrictness: mode, updatedAtIso: new Date().toISOString() }),
      setRequirePartyOnProposal: (required: boolean) => set({ requirePartyOnProposal: required, updatedAtIso: new Date().toISOString() }),
      setRequireCloseNotesOnWin: (required: boolean) => set({ requireCloseNotesOnWin: required, updatedAtIso: new Date().toISOString() }),
      setDefaultLeadSource: (source: string) => set({ defaultLeadSource: source, updatedAtIso: new Date().toISOString() }),
      setSlaLeadResponseHours: (hours: number) => set({ slaLeadResponseHours: Math.max(1, hours), updatedAtIso: new Date().toISOString() }),
      setStalledDealThresholdDays: (days: number) => set({ stalledDealThresholdDays: Math.max(1, days), updatedAtIso: new Date().toISOString() }),
      setCustomRateOverride: (currency: string, ratePerUsd: number) =>
        set((s) => ({ customRateOverrides: { ...s.customRateOverrides, [currency.toUpperCase()]: Math.max(0.0001, ratePerUsd) }, updatedAtIso: new Date().toISOString() })),
      resetCustomRateOverrides: () => set({ customRateOverrides: {}, updatedAtIso: new Date().toISOString() }),
      addCrmCustomField: (fieldInput) => {
        const sanitizedKey = fieldInput.key.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
        const created: CrmCustomFieldDefinition = { ...fieldInput, id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, key: sanitizedKey || `field_${Date.now()}`, createdAtIso: new Date().toISOString() };
        set((state) => ({ crmCustomFields: [...state.crmCustomFields.filter((f) => !(f.entityTypeKey === created.entityTypeKey && f.key.toLowerCase() === created.key.toLowerCase())), created], updatedAtIso: new Date().toISOString() }));
        syncTenantToServer(get());
        return created;
      },
      removeCrmCustomField: (id: string) => {
        set((s) => ({ crmCustomFields: s.crmCustomFields.filter((f) => f.id !== id), updatedAtIso: new Date().toISOString() }));
        syncTenantToServer(get());
      },
      setDefaultDealViewMode: (mode: "Kanban" | "Table" | "SplitPane") => {
        set({ defaultDealViewMode: mode, updatedAtIso: new Date().toISOString() });
        syncTenantToServer(get());
        try {
          const repo = getCrmContainer()?.overviewRepository;
          if (typeof repo?.updateUserPreferences === "function") {
            const st = get();
            void repo.updateUserPreferences({
              overrideCurrencyCode: st.userOverrideCurrency,
              defaultDealViewMode: mode,
              defaultPipelineCode: st.defaultPipelineCode,
              cardDensity: st.cardDensity,
              dailyDigestEnabled: st.dailyDigestEnabled,
              stageMoveNotificationsEnabled: st.stageMoveNotificationsEnabled,
            }).catch(() => undefined);
          }
        } catch { /* noop */ }
      },
      updateSettings: (partial) => set((state) => {
        if (partial.baseCurrency) { try { useCurrencyPreference.getState().setDisplayCurrency(partial.baseCurrency.toUpperCase(), "always"); } catch { /* noop */ } }
        return { ...state, ...partial, updatedAtIso: new Date().toISOString() };
      }),
      hydrateFromServer: async () => {
        if (serverHydrationInFlight) return;
        serverHydrationInFlight = true;
        try {
          const data = await getCrmContainer().overviewRepository.getSettings();
          const t = data.tenantSettings, u = data.userPreferences;
          let parsedFields = get().crmCustomFields;
          if (t.customFieldsConfigJson) {
            try {
              const raw = JSON.parse(t.customFieldsConfigJson);
              if (Array.isArray(raw) && raw.length > 0) parsedFields = raw;
              else if (raw && typeof raw === "object") {
                if (Array.isArray(raw.customFields) && raw.customFields.length > 0) parsedFields = raw.customFields;
                if (Array.isArray(raw.workflows) && raw.workflows.length > 0) useCrmWorkflowsStore.getState().hydrateFromServerPayload(raw);
              }
            } catch { /* keep */ }
          }
          set({
            baseCurrency: (data.effectiveBaseCurrencyCode || "SAR").toUpperCase(), tenantBaseCurrency: (t.baseCurrencyCode || "SAR").toUpperCase(),
            userOverrideCurrency: u.overrideCurrencyCode ? u.overrideCurrencyCode.toUpperCase() : null, defaultDealCurrency: (t.defaultDealCurrencyCode || "SAR").toUpperCase(),
            autoConvertToBase: data.effectiveAutoConvertToBase, showOriginalCurrencyOnConverted: data.effectiveShowDualCurrencyBadges,
            allowUserCurrencyOverride: t.allowUserCurrencyOverride, snapshotExchangeRateOnDealCreation: t.snapshotExchangeRateOnDealCreation,
            stageGateStrictness: t.stageGateStrictness, requirePartyOnProposal: t.requireVerifiedPartyOnProposal, requireCloseNotesOnWin: t.requireCloseNotesOnWin,
            defaultLeadSource: t.defaultLeadSource, slaLeadResponseHours: t.slaLeadResponseHours, stalledDealThresholdDays: t.stalledDealThresholdDays,
            duplicateDetectionMode: t.duplicateDetectionMode, leadAutoAssignmentRule: t.leadAutoAssignmentRule,
            enableCatalogPricingQuoteHandoff: t.enableCatalogPricingQuoteHandoff, enableVenueAcademyCommercialHandoff: t.enableVenueAcademyCommercialHandoff,
            autoCreateWorkItemsOnStageMove: t.autoCreateWorkItemsOnStageMove, defaultCommunicationChannel: t.defaultCommunicationChannel,
            autoSyncPartyKernelOnConvert: t.autoSyncPartyKernelOnConvert, defaultDealViewMode: u.defaultDealViewMode,
            defaultPipelineCode: u.defaultPipelineCode, cardDensity: u.cardDensity, dailyDigestEnabled: u.dailyDigestEnabled,
            stageMoveNotificationsEnabled: u.stageMoveNotificationsEnabled, crmCustomFields: parsedFields, isServerHydrated: true,
          });
        } catch { /* fallback to local state */ }
        finally { serverHydrationInFlight = false; }
      },
      resetDefaults: () => {
        useCrmWorkflowsStore.getState().resetDefaults();
        set({ ...DEFAULT_SETTINGS, isServerHydrated: true, updatedAtIso: new Date().toISOString() });
      },
    }),
    { name: "scripe-crm-settings" }
  )
);

/** Pure deterministic currency conversion utility using USD cross-rates. */
export function convertCrmCurrencyAmount(amount: number, fromCurrency?: string | null, toCurrency?: string | null, ratesTable: Record<string, number> = CRM_FALLBACK_USD_RATES): number {
  if (!Number.isFinite(amount) || amount === 0) return 0;
  const from = (fromCurrency || "SAR").toUpperCase();
  const to = (toCurrency || "SAR").toUpperCase();
  if (from === to) return amount;
  const fromRate = ratesTable[from] ?? CRM_FALLBACK_USD_RATES[from] ?? 1;
  const toRate = ratesTable[to] ?? CRM_FALLBACK_USD_RATES[to] ?? 1;
  return fromRate > 0 && toRate > 0 ? Math.round((amount / fromRate) * toRate * 100) / 100 : amount;
}

/** Returns how many units of `toCurrency` equal 1 unit of `fromCurrency`. */
export function getCrossExchangeRate(fromCurrency: string, toCurrency: string, ratesTable: Record<string, number> = CRM_FALLBACK_USD_RATES): number {
  const from = (fromCurrency || "SAR").toUpperCase();
  const to = (toCurrency || "SAR").toUpperCase();
  if (from === to) return 1;
  const fromRate = ratesTable[from] ?? CRM_FALLBACK_USD_RATES[from] ?? 1;
  const toRate = ratesTable[to] ?? CRM_FALLBACK_USD_RATES[to] ?? 1;
  return fromRate > 0 ? toRate / fromRate : 1;
}

let ratesFetchedOnce = false;

/** Hook uniting CRM Module Currency Settings with platform Core/Entitlements exchange rates and server settings. */
export function useCrmCurrency() {
  const settings = useCrmSettingsStore();
  const { exchangeRates, lastRatesUpdate, setRates } = useCurrencyPreference();
  const { fetchRates } = useCurrencyRates();

  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
    if (!ratesFetchedOnce && !isTestEnv) {
      ratesFetchedOnce = true;
      void fetchRates();
    }
    if (!settings.isServerHydrated && !isTestEnv) void settings.hydrateFromServer();
  }, [fetchRates, settings.isServerHydrated]);

  const effectiveRates: Record<string, number> = { ...CRM_FALLBACK_USD_RATES, ...(exchangeRates ?? {}), ...settings.customRateOverrides };
  const baseCurrency = (settings.baseCurrency || "SAR").toUpperCase();

  const convertAmount = useCallback((amount: number, fromCurrency?: string | null, targetCurrency?: string): number => {
    const target = (targetCurrency || baseCurrency).toUpperCase();
    return !settings.autoConvertToBase && !targetCurrency ? amount : convertCrmCurrencyAmount(amount, fromCurrency || baseCurrency, target, effectiveRates);
  }, [baseCurrency, settings.autoConvertToBase, effectiveRates]);

  const getRate = useCallback((fromCurrency: string, targetCurrency?: string): number => getCrossExchangeRate(fromCurrency, (targetCurrency || baseCurrency).toUpperCase(), effectiveRates), [baseCurrency, effectiveRates]);

  const formatCrmAmount = useCallback((amount: number | null | undefined, fromCurrency?: string | null, options?: { showDual?: boolean; forceTargetCurrency?: string }): string => {
    const numeric = Number(amount ?? 0);
    const nativeCode = (fromCurrency || baseCurrency).toUpperCase();
    const targetCode = (options?.forceTargetCurrency || baseCurrency).toUpperCase();
    if (!settings.autoConvertToBase && !options?.forceTargetCurrency) return formatPrice(numeric, nativeCode);
    const converted = convertCrmCurrencyAmount(numeric, nativeCode, targetCode, effectiveRates);
    const formattedTarget = formatPrice(converted, targetCode);
    const shouldShowDual = options?.showDual ?? settings.showOriginalCurrencyOnConverted;
    return shouldShowDual && nativeCode !== targetCode && numeric > 0 ? `${formattedTarget} (${formatPrice(numeric, nativeCode)})` : formattedTarget;
  }, [baseCurrency, settings.autoConvertToBase, settings.showOriginalCurrencyOnConverted, effectiveRates]);

  const getConversionPreview = useCallback((amount: number | string, fromCurrency?: string | null) => {
    const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
    const from = (fromCurrency || baseCurrency).toUpperCase();
    const isDifferentCurrency = from !== baseCurrency && Number.isFinite(numeric) && numeric > 0;
    const rate = getCrossExchangeRate(from, baseCurrency, effectiveRates);
    const convertedAmount = isDifferentCurrency ? convertCrmCurrencyAmount(numeric, from, baseCurrency, effectiveRates) : Number.isFinite(numeric) ? numeric : 0;
    return {
      isDifferent: isDifferentCurrency, isDifferentCurrency, fromCurrency: from, baseCurrency, rate, convertedAmount,
      formattedNative: formatPrice(Number.isFinite(numeric) ? numeric : 0, from),
      formattedConverted: formatPrice(convertedAmount, baseCurrency),
      rateSummary: `1 ${from} = ${rate.toFixed(4)} ${baseCurrency}`,
    };
  }, [baseCurrency, effectiveRates]);

  const refreshLiveRates = useCallback(async () => {
    setRates(effectiveRates, "USD");
    await fetchRates();
  }, [fetchRates, setRates, effectiveRates]);

  return {
    baseCurrency, defaultDealCurrency: settings.defaultDealCurrency || baseCurrency,
    autoConvertToBase: settings.autoConvertToBase, showOriginalCurrencyOnConverted: settings.showOriginalCurrencyOnConverted,
    showOriginalCurrencyBadge: settings.showOriginalCurrencyOnConverted,
    rates: effectiveRates, ratesFetchedAt: lastRatesUpdate,
    setBaseCurrency: settings.setBaseCurrency, setAutoConvertToBase: settings.setAutoConvertToBase,
    setShowOriginalCurrencyOnConverted: settings.setShowOriginalCurrencyOnConverted,
    convertAmount, getRate, formatCrmAmount, getConversionPreview, refreshLiveRates,
  };
}
