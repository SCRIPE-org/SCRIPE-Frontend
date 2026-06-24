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

/**
 * Interface defining property specifications, keys types, and structural contract rules for status dist item.
 */
export interface StatusDistItem {
  status: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for type dist item.
 */
export interface TypeDistItem {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for edition revenue item.
 */
export interface EditionRevenueItem {
  edition: string;
  revenue: number;
  percentage: number;
  color: string;
}

const STATUS_CHART_COLORS: Record<string, string> = {
  Active: "#10b981",
  Trialing: "#3b82f6",
  Suspended: "#f59e0b",
  Canceled: "#ef4444",
  Expired: "#6b7280",
  GracePeriod: "#f97316",
};

const TYPE_CHART_COLORS: Record<string, string> = {
  Monthly: "#8b5cf6",
  Yearly: "#6366f1",
  Lifetime: "#ec4899",
  Trial: "#0ea5e9",
  AddOn: "#14b8a6",
};

const EDITION_CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#10b981",
  "#14b8a6",
  "#0ea5e9",
  "#3b82f6",
];

/**
 * React hook/ViewModel orchestrating state and data flows for subscriptions overview view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useSubscriptionsOverviewViewModel() {
  const { t } = useI18n();
  const { formatDisplay, isConverting, displayCurrency } = useConvertedAmount();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [search, setSearch] = useState("");

  const {
    data: subscriptions = [],
    isLoading,
    error,
    refetch,
  } = useQuery<GlobalSubscriptionItem[]>({
    queryKey: ["subscriptions", "all"],
    queryFn: () => entitlementsContainer.subscriptionRepository.getAll(),
    staleTime: 2 * 60 * 1000,
  });

  // ── KPIs ──
  const kpis = useMemo(() => {
    const active = subscriptions.filter((s) => s.status === "Active");
    const trial = subscriptions.filter((s) => s.status === "Trialing");
    const suspended = subscriptions.filter((s) => s.status === "Suspended");
    const canceled = subscriptions.filter((s) => s.status === "Canceled");

    // MRR = Active subscriptions only
    const totalMrr = active.reduce((sum, s) => {
      if (s.type === "Lifetime") return sum;
      if (s.type === "Yearly") return sum + s.totalAmountUsd / 12;
      return sum + s.totalAmountUsd;
    }, 0);

    // Gross Revenue = ALL subscriptions (gross billing — total ever invoiced)
    // Cancel with No Refund: money stays in revenue ✓
    // Cancel with Full Refund: money stays in gross, netRevenue decreases ✓
    const totalRevenue = subscriptions.reduce((sum, s) => sum + s.totalAmountUsd, 0);

    // Refunded = ALL subscriptions (converted to USD for accurate Net Revenue)
    const totalRefunded = subscriptions.reduce((sum, s) => {
      if (!s.refundAmount) return sum;
      // If we have an explicit exchange rate, use it. Otherwise approximate based on TotalAmountUsd / TotalAmount.
      const rate =
        s.exchangeRateToUsd || (s.totalAmount > 0 ? s.totalAmountUsd / s.totalAmount : 1);
      return sum + s.refundAmount * rate;
    }, 0);

    // Upcoming renewals (within 30 days)
    const upcoming = subscriptions.filter((s) => {
      if (!s.endDate) return false;
      const end = new Date(s.endDate);
      const now = new Date();
      const daysLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return daysLeft > 0 && daysLeft <= 30 && (s.status === "Active" || s.status === "Trialing");
    });

    // Total promo discounts (Active only)
    const totalPromoDiscount = active.reduce((sum, s) => sum + (s.promotionDiscount ?? 0), 0);

    // ARPU = MRR / active paying count (excludes $0 subs and trials)
    const payingActive = active.filter((s) => s.totalAmountUsd > 0);
    const arpu =
      payingActive.length > 0 ? Math.round((totalMrr / payingActive.length) * 100) / 100 : 0;

    // Churn Rate = canceled in last 30 days / (active + recently canceled) × 100
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyCanceled = canceled.filter((s) => {
      if (!s.endDate) return false;
      return new Date(s.endDate) >= thirtyDaysAgo;
    });
    const churnBase = active.length + recentlyCanceled.length;
    const churnRate =
      churnBase > 0 ? Math.round((recentlyCanceled.length / churnBase) * 10000) / 100 : 0;

    return {
      totalMrr: Math.round(totalMrr * 100) / 100,
      activeCount: active.length,
      trialCount: trial.length,
      suspendedCount: suspended.length,
      canceledCount: canceled.length,
      renewalCount: upcoming.length,
      totalCount: subscriptions.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalRefunded: Math.round(totalRefunded * 100) / 100,
      netRevenue: Math.round((totalRevenue - totalRefunded) * 100) / 100,
      totalPromoDiscount: Math.round(totalPromoDiscount * 100) / 100,
      arpu,
      churnRate,
    };
  }, [subscriptions]);

  // ── Status Distribution (for chart) ──
  const statusDistribution = useMemo((): StatusDistItem[] => {
    const total = subscriptions.length || 1;
    const groups = subscriptions.reduce<Record<string, number>>((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups)
      .map(([status, count]) => ({
        status,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
        color: STATUS_CHART_COLORS[status] || "#6b7280",
      }))
      .sort((a, b) => b.count - a.count);
  }, [subscriptions]);

  // ── Type Distribution (for chart) ──
  const typeDistribution = useMemo((): TypeDistItem[] => {
    const total = subscriptions.length || 1;
    const groups = subscriptions.reduce<Record<string, number>>((acc, s) => {
      acc[s.type] = (acc[s.type] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(groups)
      .map(([type, count]) => ({
        type,
        count,
        percentage: Math.round((count / total) * 1000) / 10,
        color: TYPE_CHART_COLORS[type] || "#6b7280",
      }))
      .sort((a, b) => b.count - a.count);
  }, [subscriptions]);

  // ── Revenue by Edition (Active subs only, for bar chart) ──
  const revenueByEdition = useMemo((): EditionRevenueItem[] => {
    const activeSubs = subscriptions.filter(
      (s) => s.status === "Active" || s.status === "Trialing"
    );
    const groups = activeSubs.reduce<Record<string, number>>((acc, s) => {
      acc[s.editionName] = (acc[s.editionName] || 0) + s.totalAmountUsd;
      return acc;
    }, {});
    const maxRevenue = Math.max(...Object.values(groups), 1);
    return Object.entries(groups)
      .map(([edition, revenue], i) => ({
        edition,
        revenue: Math.round(revenue * 100) / 100,
        percentage: Math.round((revenue / maxRevenue) * 100),
        color: EDITION_CHART_COLORS[i % EDITION_CHART_COLORS.length],
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [subscriptions]);

  // ── Upcoming Renewals (sorted by nearest) ──
  const upcomingRenewals = useMemo(() => {
    const now = new Date();
    return subscriptions
      .filter((s) => {
        if (!s.endDate) return false;
        if (s.status !== "Active" && s.status !== "Trialing") return false;
        const end = new Date(s.endDate);
        const daysLeft = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
        return daysLeft > 0 && daysLeft <= 30;
      })
      .map((s) => ({
        ...s.data,
        daysLeft: Math.ceil(
          (new Date(s.endDate!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => a.daysLeft - b.daysLeft);
  }, [subscriptions]);

  // ── Filtered list ──
  const filtered = useMemo(() => {
    return subscriptions.filter((s) => {
      if (statusFilter !== "all" && s.status !== statusFilter) return false;
      if (typeFilter !== "all" && s.type !== typeFilter) return false;
      if (
        search &&
        !s.editionName.toLowerCase().includes(search.toLowerCase()) &&
        !s.tenantName.toLowerCase().includes(search.toLowerCase())
      )
        return false;
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
    statusDistribution,
    typeDistribution,
    revenueByEdition,
    upcomingRenewals,
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
