"use client";

import { useEffect, useCallback, useMemo } from "react";
import { formatPrice } from "@core/constants/currencies";
import { useCurrencyPreference } from "@core/store/useCurrencyPreference";
import { useCurrencyRates } from "@core/hooks/useCurrencyRates";
import {
  useCrmSettingsStore,
  CRM_FALLBACK_USD_RATES,
  convertCrmCurrencyAmount,
  getCrossExchangeRate,
} from "../stores/useCrmSettingsStore";

let ratesFetchedOnce = false;

/** Hook uniting CRM Module Currency Settings with platform Core/Entitlements exchange rates and server settings. */
export function useCrmCurrency() {
  const settings = useCrmSettingsStore();
  const hydrateFromServer = useCrmSettingsStore((s) => s.hydrateFromServer);
  const { exchangeRates, lastRatesUpdate, setRates } = useCurrencyPreference();
  const { fetchRates } = useCurrencyRates();

  useEffect(() => {
    const isTestEnv = typeof process !== "undefined" && process.env?.NODE_ENV === "test";
    if (!ratesFetchedOnce && !isTestEnv) {
      ratesFetchedOnce = true;
      void fetchRates();
    }
    if (!settings.isServerHydrated && !isTestEnv) void hydrateFromServer();
  }, [fetchRates, settings.isServerHydrated, hydrateFromServer]);

  const effectiveRates = useMemo<Record<string, number>>(
    () => ({
      ...CRM_FALLBACK_USD_RATES,
      ...(exchangeRates ?? {}),
      ...settings.customRateOverrides,
    }),
    [exchangeRates, settings.customRateOverrides],
  );
  const baseCurrency = (settings.baseCurrency || "SAR").toUpperCase();

  const convertAmount = useCallback(
    (amount: number, fromCurrency?: string | null, targetCurrency?: string): number => {
      const target = (targetCurrency || baseCurrency).toUpperCase();
      return !settings.autoConvertToBase && !targetCurrency
        ? amount
        : convertCrmCurrencyAmount(amount, fromCurrency || baseCurrency, target, effectiveRates);
    },
    [baseCurrency, settings.autoConvertToBase, effectiveRates],
  );

  const getRate = useCallback(
    (fromCurrency: string, targetCurrency?: string): number =>
      getCrossExchangeRate(fromCurrency, (targetCurrency || baseCurrency).toUpperCase(), effectiveRates),
    [baseCurrency, effectiveRates],
  );

  const formatCrmAmount = useCallback(
    (
      amount: number | null | undefined,
      fromCurrency?: string | null,
      options?: { showDual?: boolean; forceTargetCurrency?: string },
    ): string => {
      const numeric = Number(amount ?? 0);
      const nativeCode = (fromCurrency || baseCurrency).toUpperCase();
      const targetCode = (options?.forceTargetCurrency || baseCurrency).toUpperCase();
      if (!settings.autoConvertToBase && !options?.forceTargetCurrency) return formatPrice(numeric, nativeCode);
      const converted = convertCrmCurrencyAmount(numeric, nativeCode, targetCode, effectiveRates);
      const formattedTarget = formatPrice(converted, targetCode);
      const shouldShowDual = options?.showDual ?? settings.showOriginalCurrencyOnConverted;
      return shouldShowDual && nativeCode !== targetCode && numeric > 0
        ? `${formattedTarget} (${formatPrice(numeric, nativeCode)})`
        : formattedTarget;
    },
    [baseCurrency, settings.autoConvertToBase, settings.showOriginalCurrencyOnConverted, effectiveRates],
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
    [baseCurrency, effectiveRates],
  );

  const refreshLiveRates = useCallback(async () => {
    setRates(effectiveRates, "USD");
    await fetchRates();
  }, [fetchRates, setRates, effectiveRates]);

  return {
    baseCurrency,
    defaultDealCurrency: settings.defaultDealCurrency || baseCurrency,
    autoConvertToBase: settings.autoConvertToBase,
    showOriginalCurrencyOnConverted: settings.showOriginalCurrencyOnConverted,
    showOriginalCurrencyBadge: settings.showOriginalCurrencyOnConverted,
    rates: effectiveRates,
    ratesFetchedAt: lastRatesUpdate,
    setBaseCurrency: settings.setBaseCurrency,
    setAutoConvertToBase: settings.setAutoConvertToBase,
    setShowOriginalCurrencyOnConverted: settings.setShowOriginalCurrencyOnConverted,
    convertAmount,
    getRate,
    formatCrmAmount,
    getConversionPreview,
    refreshLiveRates,
  };
}
