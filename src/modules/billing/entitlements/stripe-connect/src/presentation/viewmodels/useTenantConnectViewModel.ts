/**
 * useTenantConnectViewModel
 * Manages Stripe Connect account lifecycle for the currently logged-in tenant:
 * - View account status
 * - Onboard (create account + get URL)
 * - Refresh onboarding link
 * - Open Stripe Express dashboard
 * - View transaction history with financial summary
 * - Manual sync from Stripe API
 */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { ConnectAccount } from "../../domain/entities/ConnectAccount";

const QUERY_KEY = ["entitlements", "tenant-stripe-connect", "status"];
const TXN_QUERY_KEY = ["entitlements", "tenant-stripe-connect", "transactions"];

/**
 * React hook/ViewModel orchestrating state and data flows for tenant connect view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useTenantConnectViewModel() {
  const { connectRepository } = entitlementsContainer;
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // ── Transaction filter state ──
  const [txnPage, setTxnPage] = useState(1);
  const [txnPageSize] = useState(10);
  const [txnStatus, setTxnStatus] = useState<string | undefined>(undefined);
  const [txnType, setTxnType] = useState<string | undefined>(undefined);
  const [txnFromDate, setTxnFromDate] = useState<string | undefined>(undefined);
  const [txnToDate, setTxnToDate] = useState<string | undefined>(undefined);

  // ── Status query ────────────────────────────────────────────────────────
  const statusQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: async () => {
      try {
        return await connectRepository.getTenantStatus();
      } catch (err: unknown) {
        // If 404, it means the tenant hasn't onboarded yet, which is a normal state.
        const axiosErr = err as { response?: { status?: number } };
        if (axiosErr?.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    staleTime: 15_000,
    retry: false, // Don't retry on 404
  });

  const account: ConnectAccount | null = statusQuery.data || null;

  // ── Transactions query (auto-loads when fully onboarded) ──
  const transactionsQuery = useQuery({
    queryKey: [...TXN_QUERY_KEY, txnPage, txnPageSize, txnStatus, txnType, txnFromDate, txnToDate],
    queryFn: () =>
      connectRepository.getMyTransactions({
        page: txnPage,
        pageSize: txnPageSize,
        status: txnStatus,
        type: txnType,
        fromDate: txnFromDate,
        toDate: txnToDate,
      }),
    enabled: !!account?.isFullyOnboarded,
    staleTime: 30_000,
  });

  // ── Onboard mutation ────────────────────────────────────────────────────
  const onboardMutation = useMutation({
    mutationFn: () => connectRepository.tenantOnboard(),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      if (result.onboardingUrl) {
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

  // ── Refresh link mutation ───────────────────────────────────────────────
  const refreshLinkMutation = useMutation({
    mutationFn: () => connectRepository.tenantRefreshLink(),
    onSuccess: (url) => {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.refreshFailed"),
      });
    },
  });

  // ── Dashboard link mutation ─────────────────────────────────────────────
  const dashboardLinkMutation = useMutation({
    mutationFn: () => connectRepository.tenantDashboard(),
    onSuccess: (url) => {
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.dashboardLinkFailed"),
      });
    },
  });

  // ── Sync mutation ───────────────────────────────────────────────────────
  const syncMutation = useMutation({
    mutationFn: () => connectRepository.syncMyAccount(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: TXN_QUERY_KEY });
      success({
        title: t("entitlements.tenantConnect.syncSuccess"),
        description: t("entitlements.tenantConnect.syncSuccessDesc"),
      });
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.tenantConnect.syncFailed"),
      });
    },
  });

  return {
    account,
    isLoading: statusQuery.isLoading,
    isError: statusQuery.isError,

    // Actions
    onboard: () => onboardMutation.mutate(),
    isOnboarding: onboardMutation.isPending,

    refreshLink: () => refreshLinkMutation.mutate(),
    isRefreshing: refreshLinkMutation.isPending,

    openDashboard: () => dashboardLinkMutation.mutate(),
    isOpeningDashboard: dashboardLinkMutation.isPending,

    // Sync
    syncFromStripe: () => syncMutation.mutate(),
    isSyncing: syncMutation.isPending,

    // Transactions
    transactions: transactionsQuery.data ?? null,
    isLoadingTransactions: transactionsQuery.isLoading,
    txnPage,
    txnPageSize,
    txnStatus,
    txnType,
    txnFromDate,
    txnToDate,
    setTxnPage,
    setTxnStatus,
    setTxnType,
    setTxnFromDate,
    setTxnToDate,
  };
}
