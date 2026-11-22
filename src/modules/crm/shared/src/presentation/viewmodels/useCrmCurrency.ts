"use client";

import { useEffect, useCallback } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { formatPrice } from "@core/constants/currencies";
import { useCurrencyPreference } from "@core/store/useCurrencyPreference";
import { useCurrencyRates } from "@core/hooks/useCurrencyRates";
import { usePermission } from "@core/hooks/use-permission";
import { qk } from "@core/common/query-keys";
import { useAppStore } from "@core/store/useAppStore";
import { getCrmContainer } from "../../../../di";
import { CRM_PERMISSIONS } from "../../constants/permission-constants";
import {
  CRM_FALLBACK_USD_RATES,
  convertCrmCurrencyAmount,
  getCrossExchangeRate,
} from "../../constants/crmCurrencyConstants";
import { useCrmClientPrefsStore } from "../stores/useCrmClientPrefsStore";
import { useCrmTenantScope, useSafeQueryClient } from "../utils/useSafeQueryClient";

const fetchedRateScopes = new Set<string>();

/**
 * Hook uniting CRM Module Currency Settings (TanStack Query v5 + tenant-scoped client prefs)
 * with platform Core/Entitlements exchange rates.
 * @returns Effective currency settings, live exchange rates, conversion helpers, and PBAC-safe setters.
 */
export function useCrmCurrency() {
  const safeQueryClient = useSafeQueryClient();
  const { tenantId, userId, scopeKey } = useCrmTenantScope();
  const isAuthenticated = useAppStore((s) => Boolean(s.isAuthenticated && s.user));
  const canManageSettings = usePermission(CRM_PERMISSIONS.SETTINGS_MANAGE);

  const baseCurrencyPref = useCrmClientPrefsStore((s) => s.baseCurrency);
  const defaultDealCurrencyPref = useCrmClientPrefsStore((s) => s.defaultDealCurrency);
  const autoConvertPref = useCrmClientPrefsStore((s) => s.autoConvertToBase);
  const showDualPref = useCrmClientPrefsStore((s) => s.showOriginalCurrencyOnConverted);
  const customRateOverrides = useCrmClientPrefsStore((s) => s.customRateOverrides);
  const defaultDealViewMode = useCrmClientPrefsStore((s) => s.defaultDealViewMode);
  const setDisplayCurrencyPrefs = useCrmClientPrefsStore((s) => s.setDisplayCurrencyPrefs);
  const syncScopeContext = useCrmClientPrefsStore((s) => s.syncScopeContext);

  const { exchangeRates, lastRatesUpdate, setRates } = useCurrencyPreference();
  const { fetchRates } = useCurrencyRates();

  useEffect(() => {
    syncScopeContext(scopeKey);
  }, [scopeKey, syncScopeContext]);

  useEffect(() => {
    if (isAuthenticated && !fetchedRateScopes.has(scopeKey)) {
      fetchedRateScopes.add(scopeKey);
      void fetchRates();
    }
  }, [fetchRates, isAuthenticated, scopeKey]);

  const settingsQuery = useQuery(
    {
      queryKey: qk.crm.settings(tenantId, userId),
      queryFn: () => getCrmContainer().settingsRepository.getSettings(),
      enabled: isAuthenticated,
      staleTime: 60_000,
    },
    safeQueryClient
  );

  const serverData = settingsQuery.data;
  const serverBase = serverData?.effectiveBaseCurrencyCode;
  const serverDefaultDeal = serverData?.tenantSettings?.defaultDealCurrencyCode;
  const serverAutoConvert = serverData?.effectiveAutoConvertToBase;
  const serverShowDual = serverData?.effectiveShowDualCurrencyBadges;

  const baseCurrency = (serverBase || baseCurrencyPref || "SAR").toUpperCase();
  const defaultDealCurrency = (serverDefaultDeal || defaultDealCurrencyPref || baseCurrency).toUpperCase();
  const autoConvertToBase = serverAutoConvert ?? autoConvertPref;
  const showOriginalCurrencyOnConverted = serverShowDual ?? showDualPref;

  const effectiveRates: Record<string, number> = {
    ...CRM_FALLBACK_USD_RATES,
    ...(exchangeRates ?? {}),
    ...(serverData?.exchangeRatesUsdBase ?? {}),
    ...customRateOverrides,
  };

  const currencyMutation = useMutation(
    {
      mutationFn: async (normalized: string) => {
        const repo = getCrmContainer().settingsRepository;
        if (canManageSettings && typeof repo?.updateTenantSettings === "function") {
          return repo.updateTenantSettings({
            baseCurrencyCode: normalized,
            defaultDealCurrencyCode: normalized,
            rowVersion: serverData?.tenantSettings?.rowVersion,
          });
        }
        if (typeof repo?.updateUserPreferences === "function") {
          return repo.updateUserPreferences({
            overrideCurrencyCode: normalized,
            defaultDealViewMode: serverData?.userPreferences?.defaultDealViewMode ?? defaultDealViewMode,
            defaultPipelineCode: serverData?.userPreferences?.defaultPipelineCode ?? "default",
            cardDensity: serverData?.userPreferences?.cardDensity ?? "Comfortable",
            dailyDigestEnabled: serverData?.userPreferences?.dailyDigestEnabled ?? true,
            stageMoveNotificationsEnabled: serverData?.userPreferences?.stageMoveNotificationsEnabled ?? true,
            rowVersion: serverData?.userPreferences?.rowVersion,
          });
        }
        return null;
      },
      onSuccess: () => {
        void safeQueryClient.invalidateQueries({ queryKey: qk.crm.settings(tenantId, userId) });
      },
    },
    safeQueryClient
  );

  const { mutate: mutateCurrency } = currencyMutation;

  const setBaseCurrency = useCallback(
    (currency: string) => {
      const normalized = (currency || "SAR").toUpperCase();
      setDisplayCurrencyPrefs({
        baseCurrency: normalized,
        defaultDealCurrency: normalized,
        userOverrideCurrency: canManageSettings ? null : normalized,
      });
      try {
        useCurrencyPreference.getState().setDisplayCurrency(normalized, "always");
      } catch {
        // Ignore store access issues in non-browser tests
      }
      if (isAuthenticated) {
        mutateCurrency(normalized);
      }
    },
    [canManageSettings, isAuthenticated, mutateCurrency, setDisplayCurrencyPrefs]
  );

  const setAutoConvertToBase = useCallback(
    (enabled: boolean) => setDisplayCurrencyPrefs({ autoConvertToBase: enabled }),
    [setDisplayCurrencyPrefs]
  );

  const setShowOriginalCurrencyOnConverted = useCallback(
    (enabled: boolean) => setDisplayCurrencyPrefs({ showOriginalCurrencyOnConverted: enabled }),
    [setDisplayCurrencyPrefs]
  );

  const convertAmount = useCallback(
    (amount: number, fromCurrency?: string | null, targetCurrency?: string): number => {
      const target = (targetCurrency || baseCurrency).toUpperCase();
      return !autoConvertToBase && !targetCurrency
        ? amount
        : convertCrmCurrencyAmount(amount, fromCurrency || baseCurrency, target, effectiveRates);
    },
    [baseCurrency, autoConvertToBase, effectiveRates]
  );

  const getRate = useCallback(
    (fromCurrency: string, targetCurrency?: string): number =>
      getCrossExchangeRate(fromCurrency, (targetCurrency || baseCurrency).toUpperCase(), effectiveRates),
    [baseCurrency, effectiveRates]
  );

  const formatCrmAmount = useCallback(
    (
      amount: number | null | undefined,
      fromCurrency?: string | null,
      options?: { showDual?: boolean; forceTargetCurrency?: string }
    ): string => {
      const numeric = Number(amount ?? 0);
      const nativeCode = (fromCurrency || baseCurrency).toUpperCase();
      const targetCode = (options?.forceTargetCurrency || baseCurrency).toUpperCase();
      if (!autoConvertToBase && !options?.forceTargetCurrency) return formatPrice(numeric, nativeCode);
      const converted = convertCrmCurrencyAmount(numeric, nativeCode, targetCode, effectiveRates);
      const formattedTarget = formatPrice(converted, targetCode);
      const shouldShowDual = options?.showDual ?? showOriginalCurrencyOnConverted;
      return shouldShowDual && nativeCode !== targetCode && numeric > 0
        ? `${formattedTarget} (${formatPrice(numeric, nativeCode)})`
        : formattedTarget;
    },
    [baseCurrency, autoConvertToBase, showOriginalCurrencyOnConverted, effectiveRates]
  );

  const getConversionPreview = useCallback(
    (amount: number | string, fromCurrency?: string | null) => {
      const numeric = typeof amount === "string" ? parseFloat(amount) : amount;
      const from = (fromCurrency || baseCurrency).toUpperCase();
      const isDifferentCurrency = from !== baseCurrency && Number.isFinite(numeric) && numeric > 0;
      const rate = getCrossExchangeRate(from, baseCurrency, effectiveRates);
      const convertedAmount = isDifferentCurrency
        ? convertCrmCurrencyAmount(numeric, from, baseCurrency, effectiveRates)
        : Number.isFinite(numeric)
          ? numeric
          : 0;
      return {
        isDifferent: isDifferentCurrency,
        isDifferentCurrency,
        fromCurrency: from,
        baseCurrency,
        rate,
        convertedAmount,
        formattedNative: formatPrice(Number.isFinite(numeric) ? numeric : 0, from),
        formattedConverted: formatPrice(convertedAmount, baseCurrency),
        rateSummary: `1 ${from} = ${rate.toFixed(4)} ${baseCurrency}`,
      };
    },
    [baseCurrency, effectiveRates]
  );

  const refreshLiveRates = useCallback(async () => {
    setRates(effectiveRates, "USD");
    await fetchRates();
  }, [fetchRates, setRates, effectiveRates]);

  return {
    baseCurrency,
    defaultDealCurrency,
    autoConvertToBase,
    showOriginalCurrencyOnConverted,
    showOriginalCurrencyBadge: showOriginalCurrencyOnConverted,
    rates: effectiveRates,
    ratesFetchedAt: lastRatesUpdate,
    setBaseCurrency,
    setAutoConvertToBase,
    setShowOriginalCurrencyOnConverted,
    convertAmount,
    getRate,
    formatCrmAmount,
    getConversionPreview,
    refreshLiveRates,
  };
}
