/**
 * Currency Display Preference Store
 *
 * Zustand store managing the admin's preferred display currency.
 *
 * Three modes:
 *  - "native"  → show amounts in their original currency (default)
 *  - "session" → convert to chosen currency for this session only
 *  - "always"  → persist chosen currency to localStorage
 *
 * Exchange rates are fetched once from GET /currency/rates and cached.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CurrencyDisplayMode = "native" | "session" | "always";

interface CurrencyPreferenceState {
  // ── Preference ───────────────────────────────────
  displayCurrency: string; // e.g. "USD", "EUR", "SAR"
  displayMode: CurrencyDisplayMode;

  // ── Exchange rates cache ─────────────────────────
  exchangeRates: Record<string, number> | null; // { EUR: 0.92, SAR: 3.75, ... }
  ratesBaseCurrency: string; // base for the rates map
  isLoadingRates: boolean;
  lastRatesUpdate: string | null;

  // ── Actions ──────────────────────────────────────
  setDisplayCurrency: (currency: string, mode: "session" | "always") => void;
  resetToNative: () => void;
  setRates: (rates: Record<string, number>, base: string) => void;
  setLoadingRates: (loading: boolean) => void;
}

export const useCurrencyPreference = create<CurrencyPreferenceState>()(
  persist(
    (set) => ({
      displayCurrency: "USD",
      displayMode: "native",

      exchangeRates: null,
      ratesBaseCurrency: "USD",
      isLoadingRates: false,
      lastRatesUpdate: null,

      setDisplayCurrency: (currency, mode) => set({ displayCurrency: currency, displayMode: mode }),

      resetToNative: () => set({ displayCurrency: "USD", displayMode: "native" }),

      setRates: (rates, base) =>
        set({
          exchangeRates: rates,
          ratesBaseCurrency: base,
          lastRatesUpdate: new Date().toISOString(),
          isLoadingRates: false,
        }),

      setLoadingRates: (loading) => set({ isLoadingRates: loading }),
    }),
    {
      name: "currency-preference",
      // Only persist the preference itself, not the rates cache
      partialize: (state) => ({
        displayCurrency: state.displayMode === "always" ? state.displayCurrency : "USD",
        displayMode: state.displayMode === "always" ? ("always" as const) : ("native" as const),
      }),
    }
  )
);
