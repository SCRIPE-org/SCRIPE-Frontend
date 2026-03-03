/**
 * Edition Pricing ViewModel
 *
 * Manages multi-currency pricing for an edition.
 * Follows SOLID pattern: single concern = pricing management.
 */
"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import type { EditionPriceItem } from "../../domain/entities/EditionPricing";
import { BILLING_CYCLES } from "../../domain/entities/EditionPricing";

interface PriceRow {
      currency: string;
      monthlyAmount: number;
      yearlyAmount: number;
}

export interface EditionPricingViewModelResult {
      // Data
      prices: PriceRow[];
      isLoading: boolean;
      error: Error | null;

      // Editing state
      editedPrices: Map<string, PriceRow>;
      isDirty: boolean;
      isSaving: boolean;

      // Actions
      updatePrice: (currency: string, cycle: "monthly" | "yearly", amount: number) => void;
      addCurrency: (currency: string) => void;
      removeCurrency: (currency: string) => void;
      save: () => void;
      discard: () => void;

      // Computed
      usedCurrencies: string[];
      yearlySavingsPercent: (currency: string) => number;
}

export function useEditionPricingViewModel(editionId: string): EditionPricingViewModelResult {
      const { editionRepository } = entitlementsContainer;
      const queryClient = useQueryClient();
      const { success, error: showError } = useEnhancedToast();

      // ── Server data ──
      const {
            data,
            isLoading,
            error,
      } = useQuery({
            queryKey: ["entitlements", "editions", editionId, "prices"],
            queryFn: () => editionRepository.getEditionPrices(editionId),
            enabled: !!editionId,
      });

      // ── Transform API flat list → grouped rows ──
      const serverPrices = useMemo((): PriceRow[] => {
            if (!data?.prices) return [];
            const map = new Map<string, PriceRow>();
            for (const p of data.prices) {
                  if (!map.has(p.currency)) {
                        map.set(p.currency, { currency: p.currency, monthlyAmount: 0, yearlyAmount: 0 });
                  }
                  const row = map.get(p.currency)!;
                  if (p.billingCycle === "Monthly") row.monthlyAmount = p.amount;
                  if (p.billingCycle === "Yearly") row.yearlyAmount = p.amount;
            }
            return Array.from(map.values());
      }, [data]);

      // ── Local edits overlay ──
      const [editedPrices, setEditedPrices] = useState<Map<string, PriceRow>>(new Map());
      const [removedCurrencies, setRemovedCurrencies] = useState<Set<string>>(new Set());

      // ── Effective prices (server + local edits - removed) ──
      const prices = useMemo((): PriceRow[] => {
            const merged = new Map<string, PriceRow>();
            // Start with server prices
            for (const row of serverPrices) {
                  if (!removedCurrencies.has(row.currency)) {
                        merged.set(row.currency, { ...row });
                  }
            }
            // Apply local edits
            for (const [currency, row] of editedPrices) {
                  if (!removedCurrencies.has(currency)) {
                        merged.set(currency, { ...row });
                  }
            }
            return Array.from(merged.values()).sort((a, b) => a.currency.localeCompare(b.currency));
      }, [serverPrices, editedPrices, removedCurrencies]);

      const isDirty = editedPrices.size > 0 || removedCurrencies.size > 0;

      const usedCurrencies = useMemo(() => prices.map((p) => p.currency), [prices]);

      // ── Actions ──
      const updatePrice = useCallback(
            (currency: string, cycle: "monthly" | "yearly", amount: number) => {
                  setEditedPrices((prev) => {
                        const next = new Map(prev);
                        const existing = next.get(currency) ||
                              serverPrices.find((p) => p.currency === currency) ||
                              { currency, monthlyAmount: 0, yearlyAmount: 0 };
                        next.set(currency, {
                              ...existing,
                              [cycle === "monthly" ? "monthlyAmount" : "yearlyAmount"]: amount,
                        });
                        return next;
                  });
            },
            [serverPrices]
      );

      const addCurrency = useCallback((currency: string) => {
            setEditedPrices((prev) => {
                  const next = new Map(prev);
                  next.set(currency, { currency, monthlyAmount: 0, yearlyAmount: 0 });
                  return next;
            });
            // If it was previously removed, un-remove it
            setRemovedCurrencies((prev) => {
                  const next = new Set(prev);
                  next.delete(currency);
                  return next;
            });
      }, []);

      const removeCurrency = useCallback((currency: string) => {
            setRemovedCurrencies((prev) => new Set(prev).add(currency));
            setEditedPrices((prev) => {
                  const next = new Map(prev);
                  next.delete(currency);
                  return next;
            });
      }, []);

      const discard = useCallback(() => {
            setEditedPrices(new Map());
            setRemovedCurrencies(new Set());
      }, []);

      // ── Save mutation ──
      const { mutate: save, isPending: isSaving } = useMutation({
            mutationFn: async () => {
                  // Convert PriceRow[] → flat EditionPriceItem[]
                  const flatPrices: EditionPriceItem[] = [];
                  for (const row of prices) {
                        flatPrices.push({ currency: row.currency, billingCycle: "Monthly", amount: row.monthlyAmount });
                        flatPrices.push({ currency: row.currency, billingCycle: "Yearly", amount: row.yearlyAmount });
                  }
                  await editionRepository.setEditionPrices(editionId, { prices: flatPrices });
            },
            onSuccess: () => {
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions", editionId, "prices"] });
                  queryClient.invalidateQueries({ queryKey: ["entitlements", "editions"] });
                  setEditedPrices(new Map());
                  setRemovedCurrencies(new Set());
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

      // ── Computed: yearly savings % ──
      const yearlySavingsPercent = useCallback(
            (currency: string): number => {
                  const row = prices.find((p) => p.currency === currency);
                  if (!row || row.monthlyAmount <= 0 || row.yearlyAmount <= 0) return 0;
                  const monthlyEquiv = row.monthlyAmount * 12;
                  return Math.round(((monthlyEquiv - row.yearlyAmount) / monthlyEquiv) * 100);
            },
            [prices]
      );

      return {
            prices,
            isLoading,
            error: error as Error | null,
            editedPrices,
            isDirty,
            isSaving,
            updatePrice,
            addCurrency,
            removeCurrency,
            save,
            discard,
            usedCurrencies,
            yearlySavingsPercent,
      };
}
