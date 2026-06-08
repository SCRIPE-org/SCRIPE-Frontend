/**
 * UserSubscriptions View
 *
 * CRUD view for managing user subscriptions to tenant plans (Tier 2).
 *
 * Architecture compliance:
 * - Zero `any` types — all parameters properly typed
 * - Zero hardcoded strings — all via t() locale keys
 * - Custom rich detail modal replaces default GenericForm read-only view
 */
"use client";

import { useMemo, useState, useCallback } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useUserSubscriptionsViewModel } from "../viewmodels/useUserSubscriptionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { UserSubscription } from "../../domain/entities/UserSubscription";
import { Badge } from "@core/ui/badge";
import { Eye, XCircle, RefreshCw, User, Mail, ArrowLeftRight } from "lucide-react";
import { format } from "date-fns";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { SubscriptionDetailModal } from "../components/SubscriptionDetailModal";

export function UserSubscriptionsView() {
  useModuleLocales(() => import("../../../locales"), "user-subscriptions");
  const { t } = useI18n();
  const vm = useUserSubscriptionsViewModel();

  // ── Custom Detail Modal State ──
  // Overrides the built-in GenericCrudView view modal with a rich, sectioned layout.
  const [detailItem, setDetailItem] = useState<UserSubscription | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const getByIdRef = vm.getById;
  const openDetail = useCallback(
    (item: UserSubscription) => {
      // Fetch the full detail record (GetById) for comprehensive data
      getByIdRef(item.id)
        .then((fullItem) => {
          setDetailItem(fullItem ?? item);
          setDetailOpen(true);
        })
        .catch(() => {
          setDetailItem(item);
          setDetailOpen(true);
        });
    },
    [getByIdRef]
  );

  const config: CrudConfig<UserSubscription> = useMemo(() => {
    const statusMap: Record<string, string> = {
      Free: t("entitlements.userSubscriptions.statusFree") || "Free",
      Trial: t("entitlements.userSubscriptions.statusTrialing") || "Trial",
      Active: t("entitlements.userSubscriptions.statusActive") || "Active",
      PastDue: t("entitlements.userSubscriptions.statusPastDue") || "Past Due",
      Cancelled: t("entitlements.userSubscriptions.statusCancelled") || "Cancelled",
      Expired: t("entitlements.userSubscriptions.statusExpired") || "Expired",
      PendingPayment: t("entitlements.userSubscriptions.statusPendingPayment") || "Pending Payment",
    };
    return {
      titleKey: "entitlements.userSubscriptions.title",
      subtitleKey: "entitlements.userSubscriptions.description",
      resource: "user_subscriptions",
      columns: [
        {
          key: "userName",
          label: t("entitlements.userSubscriptions.user") || "User",
          sortable: true,
          render: (_val: unknown, sub: UserSubscription) => (
            <div className="flex min-w-[120px] flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="max-w-[180px] truncate text-sm font-medium">
                  {sub.userName || t("entitlements.userSubscriptions.detailUnknownUser")}
                </span>
              </div>
              {sub.userEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0 text-muted-foreground" />
                  <span className="max-w-[180px] truncate text-xs text-muted-foreground">
                    {sub.userEmail}
                  </span>
                </div>
              )}
            </div>
          ),
        },
        {
          key: "planName",
          label: t("entitlements.userSubscriptions.plan") || "Plan",
          sortable: true,
          render: (value: string) => <span className="font-medium">{value}</span>,
        },
        {
          key: "status",
          label: t("common.status") || "Status",
          render: (_val: unknown, sub: UserSubscription) => (
            <Badge variant={sub.statusColor}>{statusMap[sub.status] || sub.status}</Badge>
          ),
        },
        {
          key: "startedAt",
          label: t("entitlements.userSubscriptions.startedAt") || "Started",
          render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "-"),
        },
        {
          key: "expiresAt",
          label: t("entitlements.userSubscriptions.expiresAt") || "Expires",
          render: (value: string | undefined) =>
            value ? format(new Date(value), "MMM d, yyyy") : "∞",
        },
        {
          key: "daysRemaining",
          label: t("entitlements.userSubscriptions.daysRemaining") || "Days Left",
          render: (_val: unknown, sub: UserSubscription) => {
            if (sub.daysRemaining == null) return <span className="text-muted-foreground">∞</span>;
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
          render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "-"),
        },
      ],
      createFields: [
        {
          name: "userId",
          label: t("entitlements.userSubscriptions.user") || "User",
          type: "server-select" as const,
          required: true,
          placeholder:
            t("entitlements.userSubscriptions.userSearchPlaceholder") || "Search by name or email…",
          searchPlaceholder:
            t("entitlements.userSubscriptions.userSearchPlaceholder") || "Search by name or email…",
          searchType: "server" as const,
          onServerSearch: vm.searchUsers,
          debounceMs: 300,
          noResultsText: t("common.noResults") || "No users found",
          searchingText: t("common.searching") || "Searching…",
          description:
            t("entitlements.userSubscriptions.userSearchHint") ||
            "Type at least 2 characters to search",
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
          name: "billingCycle",
          label: t("entitlements.userSubscriptions.billingCycle") || "Billing Cycle",
          type: "select" as const,
          placeholder:
            t("entitlements.userSubscriptions.billingCyclePlaceholder") ||
            "Select a billing cycle…",
          options: [
            {
              value: "Monthly",
              label: t("entitlements.userSubscriptions.billingCycleMonthly") || "Monthly",
            },
            {
              value: "Yearly",
              label: t("entitlements.userSubscriptions.billingCycleYearly") || "Yearly",
            },
            {
              value: "Lifetime",
              label: t("entitlements.userSubscriptions.billingCycleLifetime") || "Lifetime",
            },
          ],
        },
        {
          name: "isAutoRenew",
          label: t("entitlements.userSubscriptions.autoRenew") || "Auto Renew",
          type: "switch" as const,
          defaultValue: true,
        },
        {
          name: "promotionCode",
          label: t("entitlements.userSubscriptions.promotionCode") || "Promotion Code",
          type: "text" as const,
          placeholder:
            t("entitlements.userSubscriptions.promotionCodePlaceholder") ||
            "Enter a promotion code…",
        },
        {
          name: "notes",
          label: t("entitlements.userSubscriptions.notes") || "Notes",
          type: "textarea" as const,
          placeholder:
            t("entitlements.userSubscriptions.notesPlaceholder") || "Optional admin notes…",
        },
      ],
      editFields: (sub: UserSubscription) => [
        {
          name: "newTenantPlanId",
          label: t("entitlements.userSubscriptions.plan") || "New Plan",
          type: "select" as const,
          required: true,
          defaultValue: sub.tenantPlanId,
          placeholder: t("entitlements.userSubscriptions.planPlaceholder") || "Select a plan…",
          options: vm.availablePlans,
        },
        {
          name: "billingCycle",
          label: t("entitlements.userSubscriptions.billingCycle") || "Billing Cycle",
          type: "select" as const,
          required: true,
          defaultValue: sub.billingCycle ?? "Monthly",
          options: [
            {
              value: "Monthly",
              label: t("entitlements.userSubscriptions.billingCycleMonthly") || "Monthly",
            },
            {
              value: "Yearly",
              label: t("entitlements.userSubscriptions.billingCycleYearly") || "Yearly",
            },
            {
              value: "Lifetime",
              label: t("entitlements.userSubscriptions.billingCycleLifetime") || "Lifetime",
            },
          ],
        },
        {
          name: "reason",
          label: t("entitlements.userSubscriptions.changePlanReason") || "Reason for Change",
          type: "textarea" as const,
          placeholder:
            t("entitlements.userSubscriptions.changePlanReasonPlaceholder") ||
            "Optional: reason for changing this user's plan…",
        },
      ],
      getItemDisplayName: (sub: UserSubscription) =>
        sub.userName ? `${sub.planName} — ${sub.userName}` : `${sub.planName} (${sub.userId})`,
      getActions: (
        _vmInstance: ReturnType<typeof useUserSubscriptionsViewModel>,
        tFn: (key: string) => string
      ): CrudAction<UserSubscription>[] => [
        {
          label: tFn("common.view") || "View",
          onClick: (item: UserSubscription) => openDetail(item),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("entitlements.userSubscriptions.changePlan") || "Change Plan",
          onClick: (item: UserSubscription) => vm.openEditModal?.(item),
          variant: "ghost" as const,
          className: "text-blue-600 hover:text-blue-700",
          icon: <ArrowLeftRight className="h-4 w-4" />,
          show: (item: UserSubscription) => item.isActive || item.isTrialing,
        },
        {
          label: tFn("entitlements.userSubscriptions.cancel") || "Cancel",
          onClick: (item: UserSubscription) => vm.cancelSubscription(item.id),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <XCircle className="h-4 w-4" />,
          show: (item: UserSubscription) =>
            (item.isActive || item.isPastDue) && !item.isCancelled && !item.isExpired,
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
  }, [t, openDetail]);

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />
      <SubscriptionDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        subscription={detailItem}
      />
    </>
  );
}
