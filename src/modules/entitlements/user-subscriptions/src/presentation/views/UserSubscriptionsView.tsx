/**
 * UserSubscriptions View
 *
 * CRUD view for managing user subscriptions to tenant plans (Tier 2).
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useUserSubscriptionsViewModel } from "../viewmodels/useUserSubscriptionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { UserSubscription } from "../../domain/entities/UserSubscription";
import { Badge } from "@core/ui/badge";
import { Eye, XCircle, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { useModuleLocales } from "@core/hooks/use-module-locales";

export function UserSubscriptionsView() {
  useModuleLocales(() => import("../../../locales"), "user-subscriptions");
  const { t } = useI18n();
  const vm = useUserSubscriptionsViewModel();

  // Tenant context is resolved server-side from JWT — no client-side guard needed.

  const config: CrudConfig<UserSubscription> = useMemo(
    () => {
      const statusMap: Record<string, string> = {
        Free: t("entitlements.userSubscriptions.statusFree") || "Free",
        Trial: t("entitlements.userSubscriptions.statusTrialing") || "Trial",
        Active: t("entitlements.userSubscriptions.statusActive") || "Active",
        PastDue: t("entitlements.userSubscriptions.statusPastDue") || "Past Due",
        Cancelled: t("entitlements.userSubscriptions.statusCancelled") || "Cancelled",
        Expired: t("entitlements.userSubscriptions.statusExpired") || "Expired",
      };
      return {
      titleKey: "entitlements.userSubscriptions.title",
      subtitleKey: "entitlements.userSubscriptions.description",
      resource: "user_subscriptions",
      columns: [
        {
          key: "userId",
          label: t("entitlements.userSubscriptions.user") || "User",
          sortable: true,
          render: (value: string) => (
            <span className="font-mono text-xs truncate max-w-[120px] inline-block" title={value}>
              {value}
            </span>
          ),
        },
        {
          key: "planName",
          label: t("entitlements.userSubscriptions.plan") || "Plan",
          sortable: true,
        },
        {
          key: "status",
          label: t("common.status") || "Status",
          render: (_val: unknown, sub: UserSubscription) => (
            <Badge variant={sub.statusColor}>
              {statusMap[sub.status] || sub.status}
            </Badge>
          ),
        },
        {
          key: "startedAt",
          label: t("entitlements.userSubscriptions.startedAt") || "Started",
          render: (value: string) =>
            value ? format(new Date(value), "MMM d, yyyy") : "-",
        },
        {
          key: "expiresAt",
          label: t("entitlements.userSubscriptions.expiresAt") || "Expires",
          render: (value: string | undefined) =>
            value ? format(new Date(value), "MMM d, yyyy") : "—",
        },
        {
          key: "trialEndsAt",
          label: t("entitlements.userSubscriptions.trialEnds") || "Trial Ends",
          render: (value: string | undefined) =>
            value ? format(new Date(value), "MMM d, yyyy") : "—",
        },
        {
          key: "daysRemaining",
          label: t("entitlements.userSubscriptions.daysRemaining") || "Days Left",
          render: (_val: unknown, sub: UserSubscription) => {
            if (sub.daysRemaining == null) return <span className="text-muted-foreground">—</span>;
            return (
              <Badge variant={sub.isExpiringSoon ? "warning" : "outline"}>
                {sub.daysRemaining}d
              </Badge>
            );
          },
        },
        {
          key: "createdAt",
          label: t("common.createdAt") || "Assigned",
          render: (value: string) =>
            value ? format(new Date(value), "MMM d, yyyy") : "-",
        },
      ],
      createFields: [
        {
          name: "userId",
          label: t("entitlements.userSubscriptions.user") || "User",
          type: "server-select" as const,
          required: true,
          placeholder: t("entitlements.userSubscriptions.userSearchPlaceholder") || "Search by name or email…",
          searchPlaceholder: t("entitlements.userSubscriptions.userSearchPlaceholder") || "Search by name or email…",
          searchType: "server" as const,
          onServerSearch: vm.searchUsers,
          debounceMs: 300,
          noResultsText: t("common.noResults") || "No users found",
          searchingText: t("common.searching") || "Searching…",
          description: t("entitlements.userSubscriptions.userSearchHint") || "Type at least 2 characters to search",
        },
        {
          name: "tenantPlanId",
          label: t("entitlements.userSubscriptions.plan") || "Plan",
          type: "select" as const,
          required: true,
          placeholder: t("entitlements.userSubscriptions.planPlaceholder") || "Select a plan…",
          options: vm.availablePlans,
        },
        {
          name: "isAutoRenew",
          label: t("entitlements.userSubscriptions.autoRenew") || "Auto Renew",
          type: "switch" as const,
          defaultValue: true,
        },
        {
          name: "notes",
          label: t("entitlements.userSubscriptions.notes") || "Notes",
          type: "textarea" as const,
          placeholder: t("entitlements.userSubscriptions.notesPlaceholder") || "Optional admin notes…",
        },
      ],
      getItemDisplayName: (sub: UserSubscription) => `${sub.planName} (${sub.userId})`,
      getActions: (_vmInstance: any, tFn: any): CrudAction<UserSubscription>[] => [
        {
          label: tFn("common.view") || "View",
          onClick: (item: UserSubscription) => _vmInstance.openViewModal(item),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("entitlements.userSubscriptions.cancel") || "Cancel",
          onClick: (item: UserSubscription) => vm.cancelSubscription(item.id),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <XCircle className="h-4 w-4" />,
          show: (item: UserSubscription) => (item.isActive || item.isPastDue) && !item.isCancelled && !item.isExpired,
        },
        {
          label: tFn("entitlements.userSubscriptions.renew") || "Renew",
          onClick: (item: UserSubscription) => vm.renewSubscription(item.id),
          variant: "ghost" as const,
          className: "text-emerald-600 hover:text-emerald-700",
          icon: <RefreshCw className="h-4 w-4" />,
          show: (item: UserSubscription) => item.isCancelled,
        },
      ],
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
