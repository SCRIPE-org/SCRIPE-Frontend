/**
 * usePayoutsViewModel
 *
 * Tenant-facing payouts & commission history viewmodel.
 *
 * Data flow:
 *   PayoutsView → usePayoutsViewModel
 *     → connectRepository.getTenantStatus()        (no tenantId needed — JWT-resolved)
 *     → connectRepository.getTenantCommissions()   (tenantId from account response)
 *
 * Architecture:
 * - "use client"
 * - All data via entitlementsContainer DI — no direct service/API imports
 * - Zero `any` types
 */
"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";

const ACCOUNT_KEY = ["entitlements", "stripe-connect", "tenant", "status"];
const COMMISSIONS_KEY = ["entitlements", "stripe-connect", "tenant", "commissions"];

/**
 * Type declaration definition describing the schema of payouts filter.
 */
export type PayoutsFilter = {
  status?: string;
  fromDate?: string;
  toDate?: string;
};

/**
 * React hook/ViewModel managing logic, state, and repository queries for payouts view model.
 */
export function usePayoutsViewModel() {
  const { connectRepository } = entitlementsContainer;
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();

  // ── Pagination & filters ───────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);
  const [filter, setFilter] = useState<PayoutsFilter>({});

  // ── Account status ─────────────────────────────────────────────────────────
  const accountQuery = useQuery({
    queryKey: ACCOUNT_KEY,
    queryFn: () => connectRepository.getTenantStatus(),
    retry: false, // 404 means "not onboarded yet" — don't retry
    staleTime: 30_000,
  });

  // account is null when 404 (not onboarded)
  const account = accountQuery.data ?? null;
  const isNotOnboarded = accountQuery.isError || (accountQuery.isSuccess && !account);

  // ── Commission history ─────────────────────────────────────────────────────
  // Only runs once the account is loaded and we have the tenantId
  const commissionsQuery = useQuery({
    queryKey: [...COMMISSIONS_KEY, account?.tenantId, page, pageSize, filter],
    queryFn: async () => {
      if (!account?.tenantId) return { items: [], totalCount: 0 };
      return connectRepository.getTenantCommissions(account.tenantId, {
        page,
        pageSize,
        status: filter.status || undefined,
        fromDate: filter.fromDate || undefined,
        toDate: filter.toDate || undefined,
      });
    },
    enabled: !!account?.tenantId,
    staleTime: 20_000,
  });

  // ── Onboard mutation ───────────────────────────────────────────────────────
  const onboardMutation = useMutation({
    mutationFn: () => connectRepository.tenantOnboard(),
    onSuccess: (result: { accountId: string; onboardingUrl: string; status: string }) => {
      success({
        title: t("entitlements.stripeConnect.created"),
        description: t("entitlements.stripeConnect.createdDesc"),
      });
      if (result?.onboardingUrl) {
        window.open(result.onboardingUrl, "_blank", "noopener,noreferrer");
      }
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.createFailed"),
      });
    },
  });

  // ── Refresh link mutation ──────────────────────────────────────────────────
  const refreshLinkMutation = useMutation({
    mutationFn: () => connectRepository.tenantRefreshLink(),
    onSuccess: (url: string) => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.refreshFailed"),
      });
    },
  });

  // ── Dashboard link mutation ────────────────────────────────────────────────
  const dashboardMutation = useMutation({
    mutationFn: () => connectRepository.tenantDashboard(),
    onSuccess: (url: string) => {
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.dashboardLinkFailed"),
      });
    },
  });

  // ── Computed summary ───────────────────────────────────────────────────────
  const commissions = commissionsQuery.data?.items ?? [];
  const totalCount = commissionsQuery.data?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // Lifetime summary from account entity
  const lifetimeGross = account?.totalPayoutsAmount ?? 0;
  const lifetimePaid = account?.totalPayoutsCount ?? 0;
  const effectiveRate = account?.effectiveCommissionRate ?? 0;
  const lifetimeFee = lifetimeGross * effectiveRate;
  const lifetimeNet = lifetimeGross - lifetimeFee;

  return {
    // Account
    account,
    isAccountLoading: accountQuery.isLoading,
    isNotOnboarded,
    isFullyOnboarded: account?.isFullyOnboarded ?? false,

    // Commission table
    commissions,
    totalCount,
    totalPages,
    page,
    pageSize,
    setPage,
    isCommissionsLoading: commissionsQuery.isLoading,

    // Filters
    filter,
    setFilter: (f: Partial<PayoutsFilter>) => setFilter((prev) => ({ ...prev, ...f })),
    clearFilter: () => setFilter({}),

    // Lifetime summary
    lifetimeGross,
    lifetimeFee,
    lifetimeNet,
    lifetimePaid,
    effectiveRate,

    // Actions
    onboard: () => onboardMutation.mutate(),
    isOnboarding: onboardMutation.isPending,
    refreshLink: () => refreshLinkMutation.mutate(),
    isRefreshing: refreshLinkMutation.isPending,
    openDashboard: () => dashboardMutation.mutate(),
    isOpeningDashboard: dashboardMutation.isPending,
  };
}
