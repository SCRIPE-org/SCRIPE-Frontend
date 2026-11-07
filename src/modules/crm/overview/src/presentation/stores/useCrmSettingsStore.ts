"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useCurrencyPreference } from "@core/store/useCurrencyPreference";
import { getCrmContainer } from "@modules/crm/di";
import {
  useCrmWorkflowsStore,
  serializeCrmTenantCustomConfig,
  type CrmScopedRoleDefinition,
  type CrmBuyingCommitteeRoleOption,
  type CrmDealCommercialPackage,
} from "./useCrmWorkflowsStore";
import {
  CRM_FALLBACK_USD_RATES,
  CRM_CURRENCY_OPTIONS,
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  DEFAULT_SETTINGS,
  DEFAULT_NEW_WORKFLOW_META,
  parseCustomGovernanceConfigJson,
  convertCrmCurrencyAmount,
  getCrossExchangeRate,
  type CrmStageGateStrictness,
  type CrmEntityTypeKey,
  type CrmCustomFieldDefinition,
  type CrmConfigurableOptionItem,
  type CrmPersistedBoardSettings,
} from "../utils/crmSettingsStoreHelpers";

export {
  CRM_FALLBACK_USD_RATES,
  CRM_CURRENCY_OPTIONS,
  DEFAULT_CRM_CUSTOM_FIELDS,
  DEFAULT_CONFIGURED_LOSS_REASONS,
  DEFAULT_CONFIGURED_ACTIVITY_TYPES,
  parseCustomGovernanceConfigJson,
  convertCrmCurrencyAmount,
  getCrossExchangeRate,
  type CrmStageGateStrictness,
  type CrmEntityTypeKey,
  type CrmCustomFieldDefinition,
  type CrmConfigurableOptionItem,
  type CrmPersistedBoardSettings,
};

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
  boardSettings: CrmPersistedBoardSettings;
  dailyDigestEnabled: boolean; stageMoveNotificationsEnabled: boolean; customRateOverrides: Record<string, number>;
  crmCustomFields: CrmCustomFieldDefinition[];
  crmRoles: CrmScopedRoleDefinition[];
  buyingCommitteeRoles: CrmBuyingCommitteeRoleOption[];
  configuredLossReasons: CrmConfigurableOptionItem[];
  configuredActivityTypes: CrmConfigurableOptionItem[];
  dealCommercialPackages: Record<string, CrmDealCommercialPackage>;
  isHydrating: boolean;
  isServerHydrated: boolean; updatedAtIso: string | null;

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
  addCrmScopedRole: (input: {
    nameEn: string; nameAr?: string; descriptionEn?: string; descriptionAr?: string;
    permissions?: string[]; memberNames?: string[]; maxApprovalThresholdAmount?: number | null; backupRoleKey?: string | null;
  }) => CrmScopedRoleDefinition;
  removeCrmScopedRole: (keyOrId: string) => void;
  addBuyingCommitteeRole: (input: { labelEn: string; labelAr?: string; key?: string; isSystem?: boolean }) => CrmBuyingCommitteeRoleOption;
  removeBuyingCommitteeRole: (key: string) => void;
  setDealCommercialPackage: (opportunityId: string, pkg: CrmDealCommercialPackage) => void;
  setDefaultDealViewMode: (mode: "Kanban" | "Table" | "SplitPane") => void;
  setBoardSettings: (updated: CrmPersistedBoardSettings) => void;
  updateSettings: (partial: Partial<CrmModuleSettingsState>) => void;
  hydrateFromServer: () => Promise<void>;
  resetDefaults: () => void;
}

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
        defaultPipelineCode: st.defaultPipelineCode, cardDensity: st.cardDensity,
        customFieldsConfigJson: serializeCrmTenantCustomConfig(
          st.crmCustomFields, st.crmRoles, st.buyingCommitteeRoles, st.configuredLossReasons, st.configuredActivityTypes, st.dealCommercialPackages,
        ),
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
      addCrmScopedRole: (input) => {
        const slug = input.nameEn.trim().toLowerCase().replace(/[^a-z0-9_]+/g, "_").replace(/^_+|_+$/g, "") || `custom_role_${Date.now()}`;
        const key = slug.startsWith("pipe_role:") || slug.startsWith("role:") ? slug : `pipe_role:${slug}`;
        const scopedPermissions = (input.permissions ?? []).filter((p) => p.startsWith("crm."));
        const created: CrmScopedRoleDefinition = {
          id: `pipe-role-${Date.now()}`, key,
          nameEn: input.nameEn.trim() || DEFAULT_NEW_WORKFLOW_META.roleNameEn,
          nameAr: (input.nameAr || input.nameEn).trim() || DEFAULT_NEW_WORKFLOW_META.roleNameAr,
          descriptionEn: input.descriptionEn?.trim() || DEFAULT_NEW_WORKFLOW_META.roleDescEn,
          descriptionAr: input.descriptionAr?.trim() || DEFAULT_NEW_WORKFLOW_META.roleDescAr,
          memberNames: input.memberNames ?? [], maxApprovalThresholdAmount: input.maxApprovalThresholdAmount ?? null,
          backupRoleKey: input.backupRoleKey ?? "pipe_role:commercial_director",
          permissions: scopedPermissions.length > 0 ? scopedPermissions : ["crm.opportunities.read", "crm.opportunities.stage"],
          isSystem: false,
        };
        set((state) => ({ crmRoles: [...state.crmRoles.filter((r) => r.key.toLowerCase() !== key.toLowerCase()), created], updatedAtIso: new Date().toISOString() }));
        syncTenantToServer(get());
        return created;
      },
      removeCrmScopedRole: (keyOrId: string) => {
        set((state) => ({ crmRoles: state.crmRoles.filter((r) => r.isSystem || (r.key !== keyOrId && r.id !== keyOrId)), updatedAtIso: new Date().toISOString() }));
        syncTenantToServer(get());
      },
      addBuyingCommitteeRole: (input) => {
        const rawKey = (input.key || input.labelEn).trim().replace(/[^a-zA-Z0-9_]+/g, "");
        const key = rawKey || `Stakeholder_${Date.now()}`;
        const created: CrmBuyingCommitteeRoleOption = { key, labelEn: input.labelEn.trim() || key, labelAr: (input.labelAr || input.labelEn).trim() || key, isSystem: false };
        set((state) => ({ buyingCommitteeRoles: [...state.buyingCommitteeRoles.filter((r) => r.key.toLowerCase() !== key.toLowerCase()), created], updatedAtIso: new Date().toISOString() }));
        syncTenantToServer(get());
        return created;
      },
      removeBuyingCommitteeRole: (key: string) => {
        set((state) => ({ buyingCommitteeRoles: state.buyingCommitteeRoles.filter((r) => r.isSystem || r.key !== key), updatedAtIso: new Date().toISOString() }));
        syncTenantToServer(get());
      },
      setDealCommercialPackage: (opportunityId: string, pkg: CrmDealCommercialPackage) => {
        set((state) => ({ dealCommercialPackages: { ...state.dealCommercialPackages, [opportunityId]: pkg }, updatedAtIso: new Date().toISOString() }));
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
              overrideCurrencyCode: st.userOverrideCurrency, defaultDealViewMode: mode, defaultPipelineCode: st.defaultPipelineCode,
              cardDensity: st.cardDensity, dailyDigestEnabled: st.dailyDigestEnabled, stageMoveNotificationsEnabled: st.stageMoveNotificationsEnabled,
            }).catch(() => undefined);
          }
        } catch { /* noop */ }
      },
      setBoardSettings: (updated: CrmPersistedBoardSettings) => {
        const mappedDensity = updated.cardDensity === "Compact" ? "Compact" : "Comfortable";
        set({ boardSettings: updated, cardDensity: mappedDensity, updatedAtIso: new Date().toISOString() });
      },
      updateSettings: (partial) => set((state) => {
        if (partial.baseCurrency) { try { useCurrencyPreference.getState().setDisplayCurrency(partial.baseCurrency.toUpperCase(), "always"); } catch { /* noop */ } }
        return { ...state, ...partial, updatedAtIso: new Date().toISOString() };
      }),
      hydrateFromServer: async () => {
        if (serverHydrationInFlight) return;
        serverHydrationInFlight = true;
        if (!get().isServerHydrated) set({ isHydrating: true });
        try {
          const container = getCrmContainer();
          const [data, relationalPipelines] = await Promise.all([
            container.overviewRepository.getSettings(),
            typeof container.opportunityRepository?.getPipelines === "function"
              ? container.opportunityRepository.getPipelines().catch(() => [])
              : Promise.resolve([]),
          ]);
          const t = data.tenantSettings, u = data.userPreferences;
          const parsed = parseCustomGovernanceConfigJson(t.customFieldsConfigJson, get());
          if (Array.isArray(relationalPipelines) && relationalPipelines.length > 0) {
            useCrmWorkflowsStore.getState().hydrateFromBackendPipelines(relationalPipelines);
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
            stageMoveNotificationsEnabled: u.stageMoveNotificationsEnabled,
            crmCustomFields: parsed.customFields, crmRoles: parsed.crmRoles, buyingCommitteeRoles: parsed.buyingCommitteeRoles,
            configuredLossReasons: parsed.configuredLossReasons, configuredActivityTypes: parsed.configuredActivityTypes,
            dealCommercialPackages: parsed.dealCommercialPackages,
            isHydrating: false, isServerHydrated: true,
          });
        } catch { /* fallback to local state */ }
        finally { set({ isHydrating: false }); serverHydrationInFlight = false; }
      },
      resetDefaults: () => {
        useCrmWorkflowsStore.getState().resetDefaults();
        set({ ...DEFAULT_SETTINGS, isHydrating: false, isServerHydrated: true, updatedAtIso: new Date().toISOString() });
      },
    }),
    { name: "scripe-crm-settings" }
  )
);
