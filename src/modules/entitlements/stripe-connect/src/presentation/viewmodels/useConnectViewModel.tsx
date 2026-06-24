// FILE-EXCEPTION: file length
/**
 * useConnectViewModel
 * Refactored to use GenericCrudView engine.
 */
"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { entitlementsContainer } from "@modules/entitlements/di";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useCrudViewModel } from "@core/crud/hooks/useCrudViewModel";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import type { ConnectAccountListItem } from "../../domain/entities/ConnectAccount";
import { ExternalLink, RefreshCw, Pencil, Eye } from "lucide-react";

const QUERY_KEY = ["entitlements", "stripe-connect", "accounts"];

/**
 * React hook/ViewModel orchestrating state and data flows for connect view model.
 * Manages TanStack Query hooks, query cache keys, and repository fetch requests.
 */
export function useConnectViewModel() {
  const { connectRepository } = entitlementsContainer;
  const { success, error } = useEnhancedToast();
  const { t } = useI18n();

  // 1. Generic CRUD Engine (Read-only list, custom create/update)
  const vm = useCrudViewModel<ConnectAccountListItem>(
    QUERY_KEY,
    {
      getAll: async (params) => {
        const res = await connectRepository.getAccounts({
          page: params.page,
          pageSize: params.pageSize,
          search: params.search || undefined,
        });
        return {
          items: res.items,
          pagination: {
            itemsCount: res.totalCount,
            pageSize: params.pageSize,
            page: params.page,
            pagesCount: Math.ceil(res.totalCount / params.pageSize),
          },
        };
      },
    },
    { initialPageSize: 20 }
  );

  // ── Custom State ────────────────────────────────────────────────────────
  const [isRateDialogOpen, setIsRateDialogOpen] = useState(false);
  const [rateTarget, setRateTarget] = useState<ConnectAccountListItem | null>(null);

  // Avoid clashing with GenericCrudView's default modals
  const [customCreateModalOpen, setCustomCreateModalOpen] = useState(false);
  const [customViewModalOpen, setCustomViewModalOpen] = useState(false);
  const [customViewItem, setCustomViewItem] = useState<ConnectAccountListItem | null>(null);

  const openCustomViewModal = (item: ConnectAccountListItem) => {
    setCustomViewItem(item);
    setCustomViewModalOpen(true);
  };

  const closeCustomViewModal = () => {
    setCustomViewModalOpen(false);
    setTimeout(() => setCustomViewItem(null), 200);
  };

  // ── Custom Mutations ──────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (tenantId: string) => connectRepository.createAccount(tenantId),
    onSuccess: (result) => {
      success({
        title: t("entitlements.stripeConnect.created"),
        description: t("entitlements.stripeConnect.createdDesc"),
      });
      vm.refresh();
      setCustomCreateModalOpen(false);
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

  const refreshLinkMutation = useMutation({
    mutationFn: (tenantId: string) => connectRepository.refreshOnboardingLink(tenantId),
    onSuccess: (url) => {
      success({
        title: t("entitlements.stripeConnect.refreshed"),
        description: t("entitlements.stripeConnect.refreshedDesc"),
      });
      vm.refresh();
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    },
    onError: (err: unknown) => {
      // 409 Conflict = backend self-heal found account is already fully onboarded
      const axiosErr = err as { response?: { status?: number } };
      if (axiosErr?.response?.status === 409) {
        success({
          title: t("entitlements.stripeConnect.onboardingComplete") || "Onboarding Complete",
          description:
            t("entitlements.stripeConnect.alreadyOnboarded") ||
            "Account is already fully onboarded.",
        });
        vm.refresh();
        closeCustomViewModal();
        return;
      }
      error({
        title: t("common.error"),
        description: t("entitlements.stripeConnect.refreshFailed"),
      });
    },
  });

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
      vm.refresh();
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

  // ── Column Definitions ────────────────────────────────────────────────────
  const getConfigBase = () => {
    const config: CrudConfig<ConnectAccountListItem> = {
      titleKey: "entitlements.stripeConnect.accounts",
      subtitleKey: "entitlements.stripeConnect.accountsDesc",
      resource: "stripe_connect",
      columns: [
        {
          key: "tenantName",
          label: t("entitlements.stripeConnect.columns.tenant") || "Tenant",
          sortable: true,
        },
        {
          key: "onboardingStatus",
          label: t("entitlements.stripeConnect.statusLabel") || "Status",
          render: (val: string) => {
            const map: Record<string, { label: string; className: string }> = {
              Complete: {
                label: val,
                className: "bg-green-500/20 text-green-400 border border-green-500/30",
              },
              Pending: {
                label: val,
                className: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
              },
              Restricted: {
                label: val,
                className: "bg-red-500/20 text-red-400 border border-red-500/30",
              },
            };
            const style = map[val] ?? {
              label: val,
              className: "bg-muted text-muted-foreground border border-border",
            };
            return (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.className}`}
              >
                {val === "Complete" && "✓"}
                {val === "Pending" && "⏳"}
                {val === "Restricted" && "⚠️"}
                {style.label}
              </span>
            );
          },
        },
        {
          key: "flags",
          label: t("entitlements.stripeConnect.capabilities") || "Capabilities",
          render: (_val: unknown, row: ConnectAccountListItem) =>
            `${row.chargesEnabled ? "💳" : "❌"} / ${row.payoutsEnabled ? "🏦" : "❌"}`,
        },
        {
          key: "rate",
          label: t("entitlements.stripeConnect.effectiveRate") || "Rate",
          render: (_val: unknown, row: ConnectAccountListItem) =>
            `${(row.effectiveCommissionRate * 100).toFixed(1)}%`,
        },
        {
          key: "createdAt",
          label: t("common.createdAt") || "Created At",
          render: (val: string) => new Date(val).toLocaleDateString(),
        },
      ],
      getActions: (
        _vmInstance: unknown,
        tFn: (key: string) => string
      ): CrudAction<ConnectAccountListItem>[] => [
        {
          label: tFn("common.view") || "View",
          onClick: (item: ConnectAccountListItem) => openCustomViewModal(item),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          // Show "Complete Onboarding" for pending, "Refresh Link" for complete
          label: tFn("entitlements.stripeConnect.completeOnboarding") || "Complete Onboarding",
          onClick: (item: ConnectAccountListItem) => refreshLinkMutation.mutate(item.tenantId),
          variant: "ghost" as const,
          icon: <RefreshCw className="h-4 w-4" />,
          show: (item: ConnectAccountListItem) => item.onboardingStatus !== "Complete",
          tooltip: "Opens Stripe Express onboarding to complete account setup",
        },
        {
          label: tFn("entitlements.stripeConnect.refreshLink") || "Refresh Link",
          onClick: (item: ConnectAccountListItem) => refreshLinkMutation.mutate(item.tenantId),
          variant: "ghost" as const,
          icon: <RefreshCw className="h-4 w-4" />,
          show: (item: ConnectAccountListItem) => item.onboardingStatus === "Complete",
        },
        {
          // Only show dashboard link for fully onboarded accounts
          label: tFn("entitlements.stripeConnect.dashboardLink") || "Open Dashboard",
          onClick: (item: ConnectAccountListItem) => dashboardLinkMutation.mutate(item.tenantId),
          variant: "ghost" as const,
          icon: <ExternalLink className="h-4 w-4" />,
          show: (item: ConnectAccountListItem) => item.onboardingStatus === "Complete",
          tooltip: "Opens Stripe Express dashboard (only available after onboarding is complete)",
        },
        {
          label: tFn("entitlements.stripeConnect.commissionRateOverride") || "Override Rate",
          onClick: (item: ConnectAccountListItem) => {
            setRateTarget(item);
            setIsRateDialogOpen(true);
          },
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
        },
      ],
      onCreateClick: () => setCustomCreateModalOpen(true),
    };
    return config;
  };

  return {
    ...vm,
    getConfigBase,

    // Custom logic overrides
    createAccount: (tenantId: string) => createMutation.mutate(tenantId),
    isCreating: createMutation.isPending,
    refreshLink: (tenantId: string) => refreshLinkMutation.mutate(tenantId),
    isRefreshingLink: refreshLinkMutation.isPending,
    openDashboard: (tenantId: string) => dashboardLinkMutation.mutate(tenantId),
    isOpeningDashboard: dashboardLinkMutation.isPending,

    // Custom Modals
    customCreateModalOpen,
    setCustomCreateModalOpen,
    customViewModalOpen,
    setCustomViewModalOpen,
    customViewItem,
    closeCustomViewModal,

    // Dialogs specific state
    isRateDialogOpen,
    rateTarget,
    closeRateDialog: () => {
      setIsRateDialogOpen(false);
      setRateTarget(null);
    },
    updateRate: (tenantId: string, rate: number | null) =>
      updateRateMutation.mutate({ tenantId, rate }),
    isUpdatingRate: updateRateMutation.isPending,

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
