/**
 * Edition Pricing ViewModel — Redesigned
 *
 * Implements the Hybrid Pricing Model matching the backend:
 * - USD is the anchor currency (always present, cannot be removed)
 * - Other currencies are OPTIONAL OVERRIDES with auto-suggest from exchange rates
 * - Live preview shows what tenants would actually pay (explicit OR auto-converted)
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { EditionPriceItem } from "../../domain/entities/EditionPricing";
import { SUPPORTED_CURRENCIES } from "../../domain/entities/EditionPricing";

// ── Types ──

interface PriceRow {
      currency: string;
      monthlyAmount: number;
      yearlyAmount: number;
}

interface PreviewRow {
      currency: string;
      monthlyAmount: number;
      yearlyAmount: number;
      source: "explicit" | "auto";
      rate?: number;
}

export interface EditionPricingViewModelResult {
      // ── USD Base ──
      usdMonthly: number;
      usdYearly: number;
      setUsdMonthly: (v: number) => void;
      setUsdYearly: (v: number) => void;
      suggestedYearly: number;
      yearlyDiscountPercent: number;
      setYearlyDiscountPercent: (v: number) => void;
      applyDiscountToYearly: () => void;

      // ── Currency Overrides ──
      overrides: PriceRow[];
      addOverride: (currencyCode: string) => void;
      removeOverride: (currencyCode: string) => void;
      updateOverride: (currency: string, field: "monthly" | "yearly", amount: number) => void;
      availableCurrencies: typeof SUPPORTED_CURRENCIES[number][];

      // ── Live Preview ──
      preview: PreviewRow[];

      // ── Yearly Savings ──
      yearlySavingsPercent: (currency: string) => number;

      // ── State ──
      isLoading: boolean;
      error: Error | null;
      isDirty: boolean;
      isSaving: boolean;
      ratesLoading: boolean;

      // ── Actions ──
      save: () => void;
      discard: () => void;
}

export function useEditionPricingViewModel(editionId: string): EditionPricingViewModelResult {
      const { editionRepository } = entitlementsContainer;
      const queryClient = useQueryClient();
      const { success, error: showError } = useEnhancedToast();

      // ── Fetch existing prices ──
      const { data: priceData, isLoading: pricesLoading, error: pricesError } = useQuery({
            queryKey: ["entitlements", "editions", editionId, "prices"],
            queryFn: () => editionRepository.getEditionPrices(editionId),
            enabled: !!editionId,
      });

      // ── Fetch exchange rates ──
      const { data: exchangeRates, isLoading: ratesLoading } = useQuery({
            queryKey: ["entitlements", "exchangeRates", "USD"],
            queryFn: () => editionRepository.getExchangeRates("USD"),
            staleTime: 5 * 60 * 1000, // cache 5 min
      });

      // ── Parse server data into USD base + overrides ──
      const serverData = useMemo(() => {
            const usd: PriceRow = { currency: "USD", monthlyAmount: 0, yearlyAmount: 0 };
            const others: PriceRow[] = [];

            if (priceData?.prices) {
                  for (const p of priceData.prices) {
                        if (p.currency === "USD") {
                              if (p.billingCycle === "Monthly") usd.monthlyAmount = p.amount;
                              if (p.billingCycle === "Yearly") usd.yearlyAmount = p.amount;
                        } else {
                              let row = others.find((o) => o.currency === p.currency);
                              if (!row) {
                                    row = { currency: p.currency, monthlyAmount: 0, yearlyAmount: 0 };
                                    others.push(row);
                              }
                              if (p.billingCycle === "Monthly") row.monthlyAmount = p.amount;
                              if (p.billingCycle === "Yearly") row.yearlyAmount = p.amount;
                        }
                  }
            }

            return { usd, others };
      }, [priceData]);

      // ── Local edit state ──
      const [yearlyDiscountPercent, setYearlyDiscountPercent] = useState(20);
      const [localUsdMonthly, setLocalUsdMonthly] = useState<number | null>(null);
      const [localUsdYearly, setLocalUsdYearly] = useState<number | null>(null);
      const [localOverrides, setLocalOverrides] = useState<Map<string, PriceRow> | null>(null);
      const [removedOverrides, setRemovedOverrides] = useState<Set<string>>(new Set());
      const [addedOverrides, setAddedOverrides] = useState<Map<string, PriceRow>>(new Map());

      // ── Effective USD values ──
      const usdMonthly = localUsdMonthly ?? serverData.usd.monthlyAmount;
      const usdYearly = localUsdYearly ?? serverData.usd.yearlyAmount;
      const suggestedYearly = Math.round(usdMonthly * 12 * (1 - yearlyDiscountPercent / 100) * 100) / 100;

      // ── Set handlers ──
      const setUsdMonthly = useCallback((v: number) => setLocalUsdMonthly(v), []);
      const setUsdYearly = useCallback((v: number) => setLocalUsdYearly(v), []);
      const applyDiscountToYearly = useCallback(() => {
            setLocalUsdYearly(suggestedYearly);
      }, [suggestedYearly]);

      // ── Effective overrides ──
      const overrides = useMemo((): PriceRow[] => {
            const merged = new Map<string, PriceRow>();

            // Server overrides (not removed)
            for (const row of serverData.others) {
                  if (!removedOverrides.has(row.currency)) {
                        merged.set(row.currency, { ...row });
                  }
            }

            // Local edits to existing overrides
            if (localOverrides) {
                  for (const [code, row] of localOverrides) {
                        if (!removedOverrides.has(code)) {
                              merged.set(code, { ...row });
                        }
                  }
            }

            // Newly added overrides
            for (const [code, row] of addedOverrides) {
                  if (!removedOverrides.has(code)) {
                        merged.set(code, { ...row });
                  }
            }

            return Array.from(merged.values()).sort((a, b) => a.currency.localeCompare(b.currency));
      }, [serverData.others, localOverrides, removedOverrides, addedOverrides]);

      // ── Available currencies (not USD, not already used) ──
      const usedCurrencyCodes = useMemo(() => new Set(overrides.map((o) => o.currency)), [overrides]);
      const availableCurrencies = useMemo(
            () => SUPPORTED_CURRENCIES.filter((c) => c.code !== "USD" && !usedCurrencyCodes.has(c.code)),
            [usedCurrencyCodes]
      );

      // ── Add override with auto-suggested price ──
      const addOverride = useCallback(
            (currencyCode: string) => {
                  const rate = exchangeRates?.[currencyCode] ?? 1;
                  const suggestedMonthly = Math.round(usdMonthly * rate * 100) / 100;
                  const suggestedYearly = Math.round(usdYearly * rate * 100) / 100;

                  setAddedOverrides((prev) => {
                        const next = new Map(prev);
                        next.set(currencyCode, {
                              currency: currencyCode,
                              monthlyAmount: suggestedMonthly,
                              yearlyAmount: suggestedYearly,
                        });
                        return next;
                  });

                  // If previously removed, un-remove
                  setRemovedOverrides((prev) => {
                        const next = new Set(prev);
                        next.delete(currencyCode);
                        return next;
                  });
            },
            [exchangeRates, usdMonthly, usdYearly]
      );

      // ── Remove override ──
      const removeOverride = useCallback((currencyCode: string) => {
            setRemovedOverrides((prev) => new Set(prev).add(currencyCode));
            setAddedOverrides((prev) => {
                  const next = new Map(prev);
                  next.delete(currencyCode);
                  return next;
            });
            setLocalOverrides((prev) => {
                  if (!prev) return prev;
                  const next = new Map(prev);
                  next.delete(currencyCode);
                  return next.size > 0 ? next : null;
            });
      }, []);

      // ── Update override ──
      const updateOverride = useCallback(
            (currency: string, field: "monthly" | "yearly", amount: number) => {
                  // Check if it's an added override
                  if (addedOverrides.has(currency)) {
                        setAddedOverrides((prev) => {
                              const next = new Map(prev);
                              const existing = next.get(currency)!;
                              next.set(currency, {
                                    ...existing,
                                    [field === "monthly" ? "monthlyAmount" : "yearlyAmount"]: amount,
                              });
                              return next;
                        });
                  } else {
                        // It's a server override being edited
                        setLocalOverrides((prev) => {
                              const next = new Map(prev || new Map());
                              const existing = next.get(currency) ||
                                    serverData.others.find((o) => o.currency === currency) ||
                                    { currency, monthlyAmount: 0, yearlyAmount: 0 };
                              next.set(currency, {
                                    ...existing,
                                    [field === "monthly" ? "monthlyAmount" : "yearlyAmount"]: amount,
                              });
                              return next;
                        });
                  }
            },
            [addedOverrides, serverData.others]
      );

      // ── Live Preview ──
      const preview = useMemo((): PreviewRow[] => {
            const rows: PreviewRow[] = [];

            // USD is always first
            rows.push({
                  currency: "USD",
                  monthlyAmount: usdMonthly,
                  yearlyAmount: usdYearly,
                  source: "explicit",
            });

            // For each supported currency, show explicit or auto-converted
            for (const curr of SUPPORTED_CURRENCIES) {
                  if (curr.code === "USD") continue;

                  const override = overrides.find((o) => o.currency === curr.code);
                  if (override) {
                        rows.push({
                              currency: curr.code,
                              monthlyAmount: override.monthlyAmount,
                              yearlyAmount: override.yearlyAmount,
                              source: "explicit",
                        });
                  } else if (exchangeRates?.[curr.code] && usdMonthly > 0) {
                        const rate = exchangeRates[curr.code];
                        rows.push({
                              currency: curr.code,
                              monthlyAmount: Math.round(usdMonthly * rate * 100) / 100,
                              yearlyAmount: Math.round(usdYearly * rate * 100) / 100,
                              source: "auto",
                              rate,
                        });
                  }
            }

            return rows;
      }, [usdMonthly, usdYearly, overrides, exchangeRates]);

      // ── Dirty tracking ──
      const isDirty = useMemo(() => {
            if (localUsdMonthly !== null && localUsdMonthly !== serverData.usd.monthlyAmount) return true;
            if (localUsdYearly !== null && localUsdYearly !== serverData.usd.yearlyAmount) return true;
            if (removedOverrides.size > 0) return true;
            if (addedOverrides.size > 0) return true;
            if (localOverrides && localOverrides.size > 0) return true;
            return false;
      }, [localUsdMonthly, localUsdYearly, removedOverrides, addedOverrides, localOverrides, serverData]);

      // ── Yearly savings ──
      const yearlySavingsPercent = useCallback(
            (currency: string): number => {
                  let monthly: number, yearly: number;

                  if (currency === "USD") {
                        monthly = usdMonthly;
                        yearly = usdYearly;
                  } else {
                        const row = overrides.find((o) => o.currency === currency) ||
                              preview.find((p) => p.currency === currency);
                        if (!row) return 0;
                        monthly = row.monthlyAmount;
                        yearly = row.yearlyAmount;
                  }

                  if (monthly <= 0 || yearly <= 0) return 0;
                  const monthlyEquiv = monthly * 12;
                  return Math.round(((monthlyEquiv - yearly) / monthlyEquiv) * 100);
            },
            [usdMonthly, usdYearly, overrides, preview]
      );

      // ── Discard ──
      const discard = useCallback(() => {
            setLocalUsdMonthly(null);
            setLocalUsdYearly(null);
            setLocalOverrides(null);
            setRemovedOverrides(new Set());
            setAddedOverrides(new Map());
      }, []);

      // ── Save ──
      const { mutate: save, isPending: isSaving } = useMutation({
            mutationFn: async () => {
                  const flatPrices: EditionPriceItem[] = [];

                  // USD base prices
                  flatPrices.push({ currency: "USD", billingCycle: "Monthly", amount: usdMonthly });
                  flatPrices.push({ currency: "USD", billingCycle: "Yearly", amount: usdYearly });

                  // Override prices
                  for (const row of overrides) {
                        flatPrices.push({ currency: row.currency, billingCycle: "Monthly", amount: row.monthlyAmount });
                        flatPrices.push({ currency: row.currency, billingCycle: "Yearly", amount: row.yearlyAmount });
                  }

                  await editionRepository.setEditionPrices(editionId, { prices: flatPrices });
            },
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId, "prices"] });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions"] });
                  discard();
                  success({
                        title: "Pricing Saved",
                        description: "Edition pricing has been updated successfully.",
                  });
            },
            onError: (err: Error) => {
                  showError({
                        title: "Failed to Save Pricing",
                        description: err.message,
                  });
            },
      });

      return {
            usdMonthly,
            usdYearly,
            setUsdMonthly,
            yearlyDiscountPercent,
            setYearlyDiscountPercent,
            applyDiscountToYearly,
            setUsdYearly,
            suggestedYearly,
            overrides,
            addOverride,
            removeOverride,
            updateOverride,
            availableCurrencies,
            preview,
            yearlySavingsPercent,
            isLoading: pricesLoading,
            error: pricesError as Error | null,
            isDirty,
            isSaving,
            ratesLoading,
            save,
            discard,
      };
}
