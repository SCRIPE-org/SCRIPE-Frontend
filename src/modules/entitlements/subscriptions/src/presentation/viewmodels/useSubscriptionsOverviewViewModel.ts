/**
 * Subscriptions Overview ViewModel
 *
 * Fetches ALL active subscriptions across all tenants
 * for the global subscriptions overview page.
 *
 * Uses proper DI container (entitlementsContainer.subscriptionRepository)
 */
"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useI18n } from "@core/providers/i18n-provider";
import { useConvertedAmount } from "@core/hooks/useConvertedAmount";
import { entitlementsContainer } from "@modules/entitlements/di";
import type { GlobalSubscriptionItem } from "../../domain/entities/Subscription";

export function useSubscriptionsOverviewViewModel() {
      const { t } = useI18n();
      const { formatDisplay, isConverting, displayCurrency } = useConvertedAmount();
      const [statusFilter, setStatusFilter] = useState<string>("all");
      const [typeFilter, setTypeFilter] = useState<string>("all");
      const [search, setSearch] = useState("");

      const { data: subscriptions = [], isLoading, error, refetch } = useQuery<GlobalSubscriptionItem[]>({
            queryKey: ["subscriptions", "all"],
            queryFn: () => entitlementsContainer.subscriptionRepository.getAll(),
            staleTime: 2 * 60 * 1000,
      });

      // ── KPIs ──
      const kpis = useMemo(() => {
            const active = subscriptions.filter(s => s.status === "Active");
            const trial = subscriptions.filter(s => s.status === "Trialing");
            const totalMrr = active.reduce((sum, s) => {
                  if (s.type === "Lifetime") return sum;
                  if (s.type === "Yearly") return sum + s.totalAmountUsd / 12;
                  return sum + s.totalAmountUsd;
            }, 0);
            const upcoming = subscriptions.filter(s => {
                  if (!s.endDate) return false;
                  const end = new Date(s.endDate);
                  const now = new Date();
                  const daysLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
                  return daysLeft > 0 && daysLeft <= 30;
            });

            return {
                  totalMrr: Math.round(totalMrr * 100) / 100,
                  activeCount: active.length,
                  trialCount: trial.length,
                  renewalCount: upcoming.length,
                  totalCount: subscriptions.length,
            };
      }, [subscriptions]);

      // ── Filtered list ──
      const filtered = useMemo(() => {
            return subscriptions.filter(s => {
                  if (statusFilter !== "all" && s.status !== statusFilter) return false;
                  if (typeFilter !== "all" && s.type !== typeFilter) return false;
                  if (search && !s.editionName.toLowerCase().includes(search.toLowerCase())) return false;
                  return true;
            });
      }, [subscriptions, statusFilter, typeFilter, search]);

      return {
            subscriptions: filtered,
            allSubscriptions: subscriptions,
            isLoading,
            error,
            refetch,
            kpis,
            statusFilter,
            setStatusFilter,
            typeFilter,
            setTypeFilter,
            search,
            setSearch,
            formatDisplay,
            isConverting,
            displayCurrency,
            t,
      };
}
