/**
 * useConnectViewModel
 * Manages Stripe Connect account lifecycle:
 * - List all tenant accounts (paginated)
 * - Create Express account + open onboarding URL
 * - Refresh onboarding link
 * - Open Stripe Express dashboard
 * - Update per-tenant commission rate override
 */
"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { ConnectAccount, ConnectAccountListItem } from "../../domain/entities/ConnectAccount";

const QUERY_KEY = ["entitlements", "stripe-connect", "accounts"];

export function useConnectViewModel() {
  const { connectRepository } = entitlementsContainer;
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();
  const queryClient = useQueryClient();

  // ── Pagination state ──────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");

  // ── Selected account for detail panel ────────────────────────────────────
  const [selectedAccount, setSelectedAccount] = useState<ConnectAccountListItem | null>(null);
  const [detailAccount, setDetailAccount] = useState<ConnectAccount | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // ── Commission rate edit state ────────────────────────────────────────────
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [rateTarget, setRateTarget] = useState<ConnectAccountListItem | null>(null);

  // ── List query ────────────────────────────────────────────────────────────
  const listQuery = useQuery({
    queryKey: [...QUERY_KEY, page, pageSize, search],
    queryFn: () => connectRepository.getAccounts({ page, pageSize, search: search || undefined }),
    staleTime: 30_000,
  });

  // ── Detail query (lazy — only fires when selectedAccount is set) ──────────
  const detailQuery = useQuery({
    queryKey: [...QUERY_KEY, "detail", selectedAccount?.id],
    queryFn: async () => {
      if (!selectedAccount?.id) return null;
      return connectRepository.getAccount(selectedAccount.id);
    },
    enabled: !!selectedAccount?.id,
    staleTime: 15_000,
  });

  // Sync detail query result into local state via useEffect (never setState during render)
  useEffect(() => {
    if (detailQuery.data !== undefined) {
      setDetailAccount(detailQuery.data ?? null);
    }
  }, [detailQuery.data]);

  // ── Create account mutation ───────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (tenantId: string) => connectRepository.createAccount(tenantId),
    onSuccess: (result) => {
      success({
        title: t("entitlements.stripeConnect.created"),
        description: t("entitlements.stripeConnect.createdDesc"),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      // Redirect to Stripe's hosted onboarding
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

  // ── Refresh onboarding link mutation ─────────────────────────────────────
  const refreshLinkMutation = useMutation({
    mutationFn: (tenantId: string) => connectRepository.refreshOnboardingLink(tenantId),
    onSuccess: (url) => {
      success({
        title: t("entitlements.stripeConnect.refreshed"),
        description: t("entitlements.stripeConnect.refreshedDesc"),
      });
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

  // ── Dashboard link mutation ───────────────────────────────────────────────
  const dashboardLinkMutation = useMutation({
    mutationFn: (tenantId: string) => connectRepository.getDashboardLink(tenantId),
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

  // ── Update commission rate mutation ───────────────────────────────────────
  const updateRateMutation = useMutation({
    mutationFn: ({ tenantId, rate }: { tenantId: string; rate: number | null }) =>
      connectRepository.updateCommissionRate(tenantId, rate),
    onSuccess: (_data, variables) => {
      const isCleared = variables.rate === null;
      success({
        title: isCleared
          ? t("entitlements.stripeConnect.commissionRateCleared")
          : t("entitlements.stripeConnect.commissionRateUpdated"),
        description: isCleared
          ? t("entitlements.stripeConnect.commissionRateClearedDesc")
          : t("entitlements.stripeConnect.commissionRateUpdatedDesc"),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      setIsRateDialogOpen(false);
      setRateTarget(null);
    },
    onError: () => {
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.commissionRateFailed"),
      });
    },
  });

  // ── Public actions ────────────────────────────────────────────────────────
  const openDetail = (account: ConnectAccountListItem) => {
    setSelectedAccount(account);
    setIsDetailOpen(true);
  };

  const closeDetail = () => {
    setIsDetailOpen(false);
    setSelectedAccount(null);
    setDetailAccount(null);
  };

  const openRateDialog = (account: ConnectAccountListItem) => {
    setRateTarget(account);
    setIsRateDialogOpen(true);
  };

  const closeRateDialog = () => {
    setIsRateDialogOpen(false);
    setRateTarget(null);
  };

  return {
    // List state
    accounts: listQuery.data?.items ?? [],
    totalCount: listQuery.data?.totalCount ?? 0,
    totalPages: Math.ceil((listQuery.data?.totalCount ?? 0) / pageSize),
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    page,
    pageSize,
    search,
    setPage,
    setSearch,

    // Detail panel
    selectedAccount,
    detailAccount,
    isDetailOpen,
    isDetailLoading: detailQuery.isLoading,
    openDetail,
    closeDetail,

    // Actions
    createAccount: (tenantId: string) => createMutation.mutate(tenantId),
    isCreating: createMutation.isPending,

    refreshLink: (tenantId: string) => refreshLinkMutation.mutate(tenantId),
    isRefreshing: refreshLinkMutation.isPending,

    openDashboard: (tenantId: string) => dashboardLinkMutation.mutate(tenantId),
    isOpeningDashboard: dashboardLinkMutation.isPending,

    // Commission rate
    isRateDialogOpen,
    rateTarget,
    openRateDialog,
    closeRateDialog,
    updateRate: (tenantId: string, rate: number | null) =>
      updateRateMutation.mutate({ tenantId, rate }),
    isUpdatingRate: updateRateMutation.isPending,

    /**
     * Server-side tenant search for the onboarding picker.
     * Returns GenericSelect-compatible { value, label } options.
     * Filters System/root tenant server-side (never client-side).
     */
    handleTenantSearch: async (query: string) => {
      try {
        const tenants = await connectRepository.searchEligibleTenants(query || undefined);
        return tenants.map((t) => ({
          value: t.id,
          label: `${t.name} (${t.code})`,
        }));
      } catch {
        return [];
      }
    },
  };
}
