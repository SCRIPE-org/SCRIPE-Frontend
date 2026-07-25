import { useCallback, useState } from "react";
import { getCoreContainer } from "@core/di";
import { useCurrencyPreference } from "@core/store/useCurrencyPreference";
import { V1 } from "@/core/config/api-endpoints/_shared";

const CURRENCY_ENDPOINTS = {
  RATES: (baseCurrency: string = "USD") => `${V1}/currency/rates?baseCurrency=${baseCurrency}`,
} as const;

const FALLBACK_RATES: Record<string, number> = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  SAR: 3.75,
  AED: 3.67,
  EGP: 50.5,
  TRY: 32.5,
  INR: 83.5,
};

export function useCurrencyRates() {
  const { exchangeRates, setRates, setLoadingRates, isLoadingRates } = useCurrencyPreference();

  const [fetchError, setFetchError] = useState(false);

  const fetchRates = useCallback(
    async (force = false) => {
      if (exchangeRates && !force) return;

      setLoadingRates(true);
      setFetchError(false);

      try {
        const api = getCoreContainer().apiService;
        const url = CURRENCY_ENDPOINTS.RATES("USD");
        const data = await api.get<Record<string, number>>(url);

        const rates: Record<string, number> = {};
        for (const [key, value] of Object.entries(data || {})) {
          rates[key] = Number(value);
        }

        setRates(rates, "USD");
      } catch (err) {
        console.error("Failed to fetch exchange rates:", err);
        setFetchError(true);
        if (!exchangeRates) {
          setRates(FALLBACK_RATES, "USD");
        }
      } finally {
        setLoadingRates(false);
      }
    },
    [exchangeRates, setRates, setLoadingRates]
  );

  return {
    fetchRates,
    fetchError,
    isLoadingRates,
  };
}
