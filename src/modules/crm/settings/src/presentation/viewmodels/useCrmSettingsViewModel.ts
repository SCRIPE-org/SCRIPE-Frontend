"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { qk } from "@core/common/query-keys";
import { stripHtmlTags } from "@core/common/sanitize";
import {
  CRM_PERMISSIONS,
  useCrmClientPrefsStore,
  useCrmCurrency,
  useCrmTenantScope,
  useSafeQueryClient,
  type CrmBuyingCommitteeRoleOption,
  type CrmClientPrefsState,
  type CrmCustomFieldDefinition,
  type CrmEntityTypeKey,
  type CrmScopedRoleDefinition,
  type CrmStageGateStrictness,
} from "@modules/crm/shared";
import { getCrmContainer } from "../../../../di";
import {
  DEFAULT_CRM_SETTINGS_DRAFT,
  DEFAULT_RECORD_PRINCIPALS,
  type CrmSettingsDraftState,
} from "../../domain/constants/crmSettingsDefaults";
import { mapSettingsResponseToDraftState } from "../../domain/utils/crmGovernanceConfigCodec";
import {
  buildCustomFieldDefinition,
  buildSettingsCardModel,
  buildTenantSettingsUpdatePayload,
  buildUserPreferencesUpdatePayload,
} from "../utils/crmSettingsMutationsHelper";

/** Settings navigation tab keys. */
export type CrmSettingsTabKey =
  | "all" | "pipeline-roles" | "sla-escalation" | "field-locking"
  | "custom-fields" | "dictionaries" | "currency-fx" | "quotes-approvals" | "numbering-handoffs";

/** Stage option metadata passed to `CrmCustomFieldsStudioCard`. */
export interface CrmCustomFieldWorkflowSummary {
  id: string;
  entityType?: "deal" | "lead";
  stages?: Array<{ stageKey: string; labelEn: string; labelAr?: string | null; category?: string }>;
}

/** Interactive settings model passed to CRM Settings domain cards. */
export interface CrmSettingsCardModel extends CrmSettingsDraftState {
  isHydrating: boolean;
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
  resetCustomRateOverrides: () => void;
  addCrmCustomField: (field: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">) => CrmCustomFieldDefinition;
  removeCrmCustomField: (id: string) => void;
  addCrmScopedRole: (input: { nameEn: string; nameAr?: string; descriptionEn?: string; descriptionAr?: string; permissions?: string[]; memberNames?: string[]; maxApprovalThresholdAmount?: number | null; backupRoleKey?: string | null }) => CrmScopedRoleDefinition;
  removeCrmScopedRole: (keyOrId: string) => void;
  addBuyingCommitteeRole: (input: { labelEn: string; labelAr?: string; key?: string; isSystem?: boolean }) => CrmBuyingCommitteeRoleOption;
  updateSettings: (partial: Partial<CrmSettingsDraftState>) => void;
}

/** ViewModel hook for CRM Settings (`/crm/settings`) using TanStack Query v5 and PBAC guards. */
export function useCrmSettingsViewModel() {
  const router = useRouter();
  const { t } = useI18n();
  const safeQueryClient = useSafeQueryClient();
  const { tenantId, userId } = useCrmTenantScope();
  const canManageSettings = usePermission(CRM_PERMISSIONS.SETTINGS_MANAGE);
  const currencyHook = useCrmCurrency();

  const setDisplayCurrencyPrefs = useCrmClientPrefsStore((s: CrmClientPrefsState) => s.setDisplayCurrencyPrefs);
  const setDefaultDealViewModePref = useCrmClientPrefsStore((s: CrmClientPrefsState) => s.setDefaultDealViewMode);
  const resetCustomRateOverridesPref = useCrmClientPrefsStore((s: CrmClientPrefsState) => s.resetCustomRateOverrides);
  const customRateOverridesPref = useCrmClientPrefsStore((s: CrmClientPrefsState) => s.customRateOverrides);

  const [selectedSection, setSelectedSection] = useState<CrmSettingsTabKey>("all");
  const [navSearch, setNavSearch] = useState("");
  const [localOverrides, setLocalOverrides] = useState<Partial<CrmSettingsDraftState>>({});
  const [saveBanner, setSaveBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const syncFromUrl = () => {
      const tab = new URLSearchParams(window.location.search).get("tab") as CrmSettingsTabKey | null;
      if (tab) setSelectedSection(tab);
    };
    syncFromUrl();
    window.addEventListener("popstate", syncFromUrl);
    return () => window.removeEventListener("popstate", syncFromUrl);
  }, []);

  const handleSelectSection = useCallback(
    (tab: CrmSettingsTabKey) => {
      setSelectedSection(tab);
      router.replace(tab === "all" ? "/crm/settings" : `/crm/settings?tab=${tab}`, { scroll: false });
    },
    [router]
  );

  const settingsQuery = useQuery(
    { queryKey: qk.crm.settings(tenantId, userId), queryFn: () => getCrmContainer().settingsRepository.getSettings(), enabled: canManageSettings },
    safeQueryClient
  );

  const catalogQuery = useQuery(
    {
      queryKey: qk.crm.governanceCatalog(tenantId),
      queryFn: async () => {
        const repo = getCrmContainer().settingsRepository;
        if (typeof repo?.getGovernanceCatalog !== "function") {
          return { defaultScopedRoles: DEFAULT_CRM_SETTINGS_DRAFT.crmRoles, defaultBuyingCommitteeRoles: DEFAULT_CRM_SETTINGS_DRAFT.buyingCommitteeRoles, recordPrincipals: DEFAULT_RECORD_PRINCIPALS, scopedPermissions: [] };
        }
        return repo.getGovernanceCatalog();
      },
      enabled: canManageSettings,
    },
    safeQueryClient
  );

  const pipelinesQuery = useQuery(
    {
      queryKey: qk.crm.pipelines(tenantId),
      queryFn: async () => {
        const container = getCrmContainer();
        return typeof container.workflowRepository?.getPipelines === "function" ? container.workflowRepository.getPipelines() : [];
      },
      enabled: canManageSettings,
    },
    safeQueryClient
  );

  const serverDraft: CrmSettingsDraftState = settingsQuery.data
    ? mapSettingsResponseToDraftState(settingsQuery.data, {
        crmRoles: catalogQuery.data?.defaultScopedRoles,
        buyingCommitteeRoles: catalogQuery.data?.defaultBuyingCommitteeRoles,
      })
    : DEFAULT_CRM_SETTINGS_DRAFT;

  const draft: CrmSettingsDraftState = { ...serverDraft, ...localOverrides, customRateOverrides: customRateOverridesPref };

  const persistMutation = useMutation(
    {
      mutationFn: async (input: { nextDraft: CrmSettingsDraftState; bannerText?: string }) => {
        const repo = getCrmContainer().settingsRepository;
        const tenantRes = await repo.updateTenantSettings(buildTenantSettingsUpdatePayload(input.nextDraft));
        const userRes = await repo.updateUserPreferences(buildUserPreferencesUpdatePayload(input.nextDraft));
        return { bannerText: input.bannerText, updated: userRes ?? tenantRes };
      },
      onSuccess: ({ bannerText, updated }) => {
        setErrorBanner(null);
        setSaveBanner(bannerText || t("crm.settings.savedToast"));
        if (updated) {
          safeQueryClient.setQueryData(qk.crm.settings(tenantId, userId), updated);
        }
        setLocalOverrides({});
        void safeQueryClient.invalidateQueries({ queryKey: qk.crm.settings(tenantId, userId) });
      },
      onError: (err) => {
        setSaveBanner(null);
        const rawMsg = err instanceof Error ? err.message : "";
        const isConflict = rawMsg.includes("409") || rawMsg.toLowerCase().includes("conflict");
        setErrorBanner(isConflict ? t("crm.settings.saveConflictMessage") : rawMsg || t("crm.settings.saveFailedTitle"));
      },
    },
    safeQueryClient
  );

  const patchDraft = useCallback((partial: Partial<CrmSettingsDraftState>) => setLocalOverrides((prev) => ({ ...prev, ...partial })), []);

  const updateSettings = useCallback(
    (partial: Partial<CrmSettingsDraftState>) => {
      patchDraft(partial);
      if (partial.defaultDealViewMode) setDefaultDealViewModePref(partial.defaultDealViewMode);
      if (partial.baseCurrency !== undefined || partial.defaultDealCurrency !== undefined || partial.autoConvertToBase !== undefined || partial.showOriginalCurrencyOnConverted !== undefined) {
        setDisplayCurrencyPrefs({ baseCurrency: partial.baseCurrency, defaultDealCurrency: partial.defaultDealCurrency, autoConvertToBase: partial.autoConvertToBase, showOriginalCurrencyOnConverted: partial.showOriginalCurrencyOnConverted });
      }
    },
    [patchDraft, setDefaultDealViewModePref, setDisplayCurrencyPrefs]
  );

  const persistTenantAndUserSettings = useCallback(
    async (bannerText?: string) => {
      setErrorBanner(null);
      await persistMutation.mutateAsync({ nextDraft: draft, bannerText }).catch(() => undefined);
    },
    [draft, persistMutation]
  );

  const { tenantRowVersion, userRowVersion, crmCustomFields } = draft;
  const resetAndPersistDefaults = useCallback(async () => {
    const resetDraft: CrmSettingsDraftState = { ...DEFAULT_CRM_SETTINGS_DRAFT, tenantRowVersion, userRowVersion };
    setLocalOverrides(resetDraft);
    resetCustomRateOverridesPref();
    setDisplayCurrencyPrefs({ baseCurrency: resetDraft.baseCurrency, defaultDealCurrency: resetDraft.defaultDealCurrency, userOverrideCurrency: null, autoConvertToBase: resetDraft.autoConvertToBase, showOriginalCurrencyOnConverted: resetDraft.showOriginalCurrencyOnConverted });
    await persistMutation.mutateAsync({ nextDraft: resetDraft, bannerText: t("crm.settings.resetToast") }).catch(() => undefined);
  }, [tenantRowVersion, userRowVersion, persistMutation, resetCustomRateOverridesPref, setDisplayCurrencyPrefs, t]);

  const addCrmCustomField = useCallback(
    (fieldInput: Omit<CrmCustomFieldDefinition, "id" | "createdAtIso">): CrmCustomFieldDefinition => {
      const created = buildCustomFieldDefinition(fieldInput);
      patchDraft({ crmCustomFields: [...crmCustomFields.filter((f) => !(f.entityTypeKey === created.entityTypeKey && f.key.toLowerCase() === created.key.toLowerCase())), created] });
      return created;
    },
    [crmCustomFields, patchDraft]
  );

  const createCustomField = useCallback(
    async (input: { entityTypeKey: CrmEntityTypeKey; key: string; labelEn: string; labelAr?: string; valueType: "Text" | "Number" | "Currency" | "Date" | "Select" | "Boolean"; isRequired: boolean; optionsCsv?: string; defaultStageGateKey?: string }) => {
      const options = input.valueType === "Select" && input.optionsCsv ? input.optionsCsv.split(",").map((s) => stripHtmlTags(s).trim()).filter(Boolean) : undefined;
      const created = addCrmCustomField({
        entityTypeKey: input.entityTypeKey, key: input.key, labelEn: input.labelEn.trim(), labelAr: (input.labelAr || input.labelEn).trim(),
        valueType: input.valueType, isRequired: input.isRequired, options,
        defaultStageGateKey: (input.entityTypeKey === "crm.opportunity" || input.entityTypeKey === "crm.lead") && input.defaultStageGateKey && input.defaultStageGateKey !== "none" ? input.defaultStageGateKey : undefined,
      });
      const nextDraft: CrmSettingsDraftState = { ...draft, crmCustomFields: [...draft.crmCustomFields.filter((f) => !(f.entityTypeKey === created.entityTypeKey && f.key.toLowerCase() === created.key.toLowerCase())), created] };
      await persistMutation.mutateAsync({ nextDraft }).catch(() => undefined);
      return created;
    },
    [addCrmCustomField, draft, persistMutation]
  );

  const settingsModel = buildSettingsCardModel({
    draft, isHydrating: settingsQuery.isLoading, updateSettings, patchDraft, resetCustomRateOverrides: resetCustomRateOverridesPref, addCrmCustomField,
  });

  return {
    canManageSettings, settings: settingsModel, recordPrincipals: catalogQuery.data?.recordPrincipals ?? DEFAULT_RECORD_PRINCIPALS,
    workflows: (pipelinesQuery.data ?? []) as CrmCustomFieldWorkflowSummary[], currencyHook, selectedSection, handleSelectSection,
    navSearch, setNavSearch, isSaving: persistMutation.isPending, saveBanner, errorBanner, setSaveBanner, setErrorBanner,
    persistTenantAndUserSettings, resetAndPersistDefaults, createCustomField,
  };
}
