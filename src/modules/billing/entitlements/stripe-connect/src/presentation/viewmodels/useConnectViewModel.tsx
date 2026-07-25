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
import { Badge, type BadgeProps } from "@core/ui/badge";
import {
  ExternalLink,
  RefreshCw,
  Pencil,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { formatDateUtc } from "@core/common/utils";

// Status → icon + Badge tone. Same triple the account detail card and the
// tenant-facing stepper use, so a "Complete" account reads identically
// wherever it appears.
const STATUS_BADGE: Record<string, { icon: LucideIcon; variant: BadgeProps["variant"] }> = {
  Complete: { icon: CheckCircle2, variant: "success" },
  Pending: { icon: Clock, variant: "warning" },
  Restricted: { icon: AlertTriangle, variant: "destructive" },
};

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
          title: t("entitlements.stripeConnect.onboardingComplete"),
          description: t("entitlements.stripeConnect.alreadyOnboarded"),
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
          label: t("entitlements.stripeConnect.columns.tenant"),
          sortable: true,
        },
        {
          key: "onboardingStatus",
          label: t("entitlements.stripeConnect.statusLabel"),
          render: (val: string) => {
            const status = STATUS_BADGE[val] ?? STATUS_BADGE.Pending;
            const StatusIcon = status.icon;
            return (
              <Badge variant={status.variant}>
                <StatusIcon className="h-3 w-3" aria-hidden="true" />
                {t(`entitlements.stripeConnect.status.${val}`)}
              </Badge>
            );
          },
        },
        {
          key: "flags",
          label: t("entitlements.stripeConnect.capabilities"),
          render: (_val: unknown, row: ConnectAccountListItem) => (
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1">
                {row.chargesEnabled ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
                )}
                <span className="sr-only">{t("entitlements.stripeConnect.chargesEnabled")}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                {row.payoutsEnabled ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden="true" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" aria-hidden="true" />
                )}
                <span className="sr-only">{t("entitlements.stripeConnect.payoutsEnabled")}</span>
              </span>
            </div>
          ),
        },
        {
          key: "rate",
          label: t("entitlements.stripeConnect.effectiveRate"),
          render: (_val: unknown, row: ConnectAccountListItem) => (
            <span className="tabular-nums">{(row.effectiveCommissionRate * 100).toFixed(1)}%</span>
          ),
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (val: string) => formatDateUtc(val),
        },
      ],
      getActions: (
        _vmInstance: unknown,
        tFn: (key: string) => string
      ): CrudAction<ConnectAccountListItem>[] => [
        {
          label: tFn("common.view"),
          onClick: (item: ConnectAccountListItem) => openCustomViewModal(item),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          // Show "Complete Onboarding" for pending, "Refresh Link" for complete
          label: tFn("entitlements.stripeConnect.completeOnboarding"),
          onClick: (item: ConnectAccountListItem) => refreshLinkMutation.mutate(item.tenantId),
          variant: "ghost" as const,
          icon: <RefreshCw className="h-4 w-4" />,
          show: (item: ConnectAccountListItem) => item.onboardingStatus !== "Complete",
          tooltip: tFn("entitlements.stripeConnect.completeOnboardingTooltip"),
        },
        {
          label: tFn("entitlements.stripeConnect.refreshLink"),
          onClick: (item: ConnectAccountListItem) => refreshLinkMutation.mutate(item.tenantId),
          variant: "ghost" as const,
          icon: <RefreshCw className="h-4 w-4" />,
          show: (item: ConnectAccountListItem) => item.onboardingStatus === "Complete",
        },
        {
          // Only show dashboard link for fully onboarded accounts
          label: tFn("entitlements.stripeConnect.dashboardLink"),
          onClick: (item: ConnectAccountListItem) => dashboardLinkMutation.mutate(item.tenantId),
          variant: "ghost" as const,
          icon: <ExternalLink className="h-4 w-4" />,
          show: (item: ConnectAccountListItem) => item.onboardingStatus === "Complete",
          tooltip: tFn("entitlements.stripeConnect.dashboardLinkTooltip"),
        },
        {
          label: tFn("entitlements.stripeConnect.commissionRateOverride"),
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
