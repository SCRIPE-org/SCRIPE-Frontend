/**
 * Currency Conversion Hook
 *
 * Provides client-side currency conversion using the exchange rates
 * cached in useCurrencyPreference store.
 *
 * Usage:
 *   const { formatDisplay, isConverting, getDisplayCurrency } = useConvertedAmount();
 *   formatDisplay(49.00, "USD") → "$49.00" (native) or "€45.08" (converting to EUR)
 */
"use client";

import { useCallback, useMemo } from "react";
import { useCurrencyPreference } from "@core/store/useCurrencyPreference";

export function useConvertedAmount() {
      const {
            displayCurrency,
            displayMode,
            exchangeRates,
            ratesBaseCurrency,
      } = useCurrencyPreference();

      const isConverting = displayMode !== "native";

      /**
       * Convert an amount from one currency to the display currency.
       * Falls back to original amount if rates are unavailable.
       */
      const convertAmount = useCallback(
            (amount: number, fromCurrency: string): number => {
                  if (!isConverting) return amount;
                  if (fromCurrency === displayCurrency) return amount;
                  if (!exchangeRates) return amount;

                  // Both rates are relative to ratesBaseCurrency (usually USD)
                  // amount is in fromCurrency → convert to base → convert to target
                  const fromRate = fromCurrency === ratesBaseCurrency ? 1 : exchangeRates[fromCurrency];
                  const toRate = displayCurrency === ratesBaseCurrency ? 1 : exchangeRates[displayCurrency];

                  if (!fromRate || !toRate) return amount;

                  // Convert: amount / fromRate * toRate
                  const converted = (amount / fromRate) * toRate;
                  return Math.round(converted * 100) / 100;
            },
            [isConverting, displayCurrency, exchangeRates, ratesBaseCurrency]
      );

      /**
       * Get the effective display currency for a given native currency.
       * Returns the native currency when in native mode.
       */
      const getDisplayCurrency = useCallback(
            (nativeCurrency: string): string => {
                  if (!isConverting) return nativeCurrency;
                  return displayCurrency;
            },
            [isConverting, displayCurrency]
      );

      /**
       * Format an amount for display, converting if necessary.
       * Returns a formatted currency string like "$49.00" or "€45.08".
       */
      const formatDisplay = useCallback(
            (amount: number, fromCurrency: string): string => {
                  const converted = convertAmount(amount, fromCurrency);
                  const currency = getDisplayCurrency(fromCurrency);

                  try {
                        return new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: currency,
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                        }).format(converted);
                  } catch {
                        return `${currency} ${converted.toFixed(2)}`;
                  }
            },
            [convertAmount, getDisplayCurrency]
      );

      /**
       * Get tooltip text for converted amounts (shows original amount).
       * Returns null when not converting or same currency.
       */
      const getConversionTooltip = useCallback(
            (amount: number, fromCurrency: string): string | null => {
                  if (!isConverting || fromCurrency === displayCurrency) return null;

                  try {
                        const formatted = new Intl.NumberFormat("en-US", {
                              style: "currency",
                              currency: fromCurrency,
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                        }).format(amount);
                        return `Converted from ${formatted}`;
                  } catch {
                        return `Converted from ${fromCurrency} ${amount.toFixed(2)}`;
                  }
            },
            [isConverting, displayCurrency]
      );

      return useMemo(
            () => ({
                  convertAmount,
                  formatDisplay,
                  getDisplayCurrency,
                  getConversionTooltip,
                  isConverting,
                  displayCurrency,
                  displayMode,
            }),
            [convertAmount, formatDisplay, getDisplayCurrency, getConversionTooltip, isConverting, displayCurrency, displayMode]
      );
}
