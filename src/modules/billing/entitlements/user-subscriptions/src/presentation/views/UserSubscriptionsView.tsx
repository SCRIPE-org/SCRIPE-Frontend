/* eslint-disable react-hooks/exhaustive-deps */
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
import { formatUtc } from "@core/common/utils";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { SubscriptionDetailModal } from "../components/SubscriptionDetailModal";

/**
 * Presentation UI component rendering the user subscriptions view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
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
      Free: t("entitlements.userSubscriptions.statusFree"),
      Trial: t("entitlements.userSubscriptions.statusTrialing"),
      Active: t("entitlements.userSubscriptions.statusActive"),
      PastDue: t("entitlements.userSubscriptions.statusPastDue"),
      Cancelled: t("entitlements.userSubscriptions.statusCancelled"),
      Expired: t("entitlements.userSubscriptions.statusExpired"),
      PendingPayment: t("entitlements.userSubscriptions.statusPendingPayment"),
    };
    return {
      titleKey: "entitlements.userSubscriptions.title",
      subtitleKey: "entitlements.userSubscriptions.description",
      resource: "user_subscriptions",
      entityTypeKey: "entitlements.user-subscription",
      columns: [
        {
          key: "userName",
          label: t("entitlements.userSubscriptions.user"),
          sortable: true,
          render: (_val: unknown, sub: UserSubscription) => (
            <div className="flex min-w-[120px] flex-col gap-0.5">
              <div className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-nx-ink-3" />
                <span className="max-w-[180px] truncate text-sm font-medium">
                  {sub.userName || t("entitlements.userSubscriptions.detailUnknownUser")}
                </span>
              </div>
              {sub.userEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3 shrink-0 text-nx-ink-3" />
                  <span className="max-w-[180px] truncate text-xs text-nx-ink-3">
                    {sub.userEmail}
                  </span>
                </div>
              )}
            </div>
          ),
        },
        {
          key: "planName",
          label: t("entitlements.userSubscriptions.plan"),
          sortable: true,
          render: (value: string) => <span className="font-medium">{value}</span>,
        },
        {
          key: "status",
          label: t("common.status"),
          render: (_val: unknown, sub: UserSubscription) => (
            <Badge variant={sub.statusColor}>{statusMap[sub.status] || sub.status}</Badge>
          ),
        },
        {
          key: "startedAt",
          label: t("entitlements.userSubscriptions.startedAt"),
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-"),
        },
        {
          key: "expiresAt",
          label: t("entitlements.userSubscriptions.expiresAt"),
          render: (value: string | undefined) => (value ? formatUtc(value, "MMM d, yyyy") : "∞"),
        },
        {
          key: "daysRemaining",
          label: t("entitlements.userSubscriptions.daysRemaining"),
          render: (_val: unknown, sub: UserSubscription) => {
            if (sub.daysRemaining == null) return <span className="text-nx-ink-3">∞</span>;
            return (
              <Badge variant={sub.isExpiringSoon ? "warning" : "outline"}>
                {sub.daysRemaining}d
              </Badge>
            );
          },
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-"),
        },
      ],
      createFields: [
        {
          name: "userId",
          label: t("entitlements.userSubscriptions.user"),
          type: "server-select" as const,
          required: true,
          placeholder: t("entitlements.userSubscriptions.userSearchPlaceholder"),
          searchPlaceholder: t("entitlements.userSubscriptions.userSearchPlaceholder"),
          searchType: "server" as const,
          onServerSearch: vm.searchUsers,
          debounceMs: 300,
          noResultsText: t("common.noResults"),
          searchingText: t("common.searching"),
          description: t("entitlements.userSubscriptions.userSearchHint"),
        },
        {
          name: "tenantPlanId",
          label: t("entitlements.userSubscriptions.plan"),
          type: "select" as const,
          required: true,
          placeholder: t("entitlements.userSubscriptions.planPlaceholder"),
          options: vm.availablePlans,
        },
        {
          name: "billingCycle",
          label: t("entitlements.userSubscriptions.billingCycle"),
          type: "select" as const,
          placeholder: t("entitlements.userSubscriptions.billingCyclePlaceholder"),
          options: [
            {
              value: "Monthly",
              label: t("entitlements.userSubscriptions.billingCycleMonthly"),
            },
            {
              value: "Yearly",
              label: t("entitlements.userSubscriptions.billingCycleYearly"),
            },
            {
              value: "Lifetime",
              label: t("entitlements.userSubscriptions.billingCycleLifetime"),
            },
          ],
        },
        {
          name: "isAutoRenew",
          label: t("entitlements.userSubscriptions.autoRenew"),
          type: "switch" as const,
          defaultValue: true,
        },
        {
          name: "promotionCode",
          label: t("entitlements.userSubscriptions.promotionCode"),
          type: "text" as const,
          placeholder: t("entitlements.userSubscriptions.promotionCodePlaceholder"),
        },
        {
          name: "notes",
          label: t("entitlements.userSubscriptions.notes"),
          type: "textarea" as const,
          placeholder: t("entitlements.userSubscriptions.notesPlaceholder"),
        },
      ],
      editFields: (sub: UserSubscription) => [
        {
          name: "newTenantPlanId",
          label: t("entitlements.userSubscriptions.plan"),
          type: "select" as const,
          required: true,
          defaultValue: sub?.tenantPlanId,
          placeholder: t("entitlements.userSubscriptions.planPlaceholder"),
          options: vm.availablePlans,
        },
        {
          name: "billingCycle",
          label: t("entitlements.userSubscriptions.billingCycle"),
          type: "select" as const,
          required: true,
          defaultValue: sub?.billingCycle ?? "Monthly",
          options: [
            {
              value: "Monthly",
              label: t("entitlements.userSubscriptions.billingCycleMonthly"),
            },
            {
              value: "Yearly",
              label: t("entitlements.userSubscriptions.billingCycleYearly"),
            },
            {
              value: "Lifetime",
              label: t("entitlements.userSubscriptions.billingCycleLifetime"),
            },
          ],
        },
        {
          name: "reason",
          label: t("entitlements.userSubscriptions.changePlanReason"),
          type: "textarea" as const,
          placeholder: t("entitlements.userSubscriptions.changePlanReasonPlaceholder"),
        },
      ],
      getItemDisplayName: (sub: UserSubscription) =>
        sub.userName ? `${sub.planName} — ${sub.userName}` : `${sub.planName} (${sub.userId})`,
      getActions: (
        _vmInstance: ReturnType<typeof useUserSubscriptionsViewModel>,
        tFn: (key: string) => string
      ): CrudAction<UserSubscription>[] => [
        {
          label: tFn("common.view"),
          onClick: (item: UserSubscription) => openDetail(item),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("entitlements.userSubscriptions.changePlan"),
          onClick: (item: UserSubscription) => vm.openEditModal?.(item),
          variant: "ghost" as const,
          className: "text-info hover:text-info/80",
          icon: <ArrowLeftRight className="h-4 w-4" />,
          show: (item: UserSubscription) => item.isActive || item.isTrialing,
        },
        {
          label: tFn("entitlements.userSubscriptions.cancel"),
          onClick: (item: UserSubscription) => vm.cancelSubscription(item.id),
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/80",
          icon: <XCircle className="h-4 w-4" />,
          show: (item: UserSubscription) =>
            (item.isActive || item.isPastDue) && !item.isCancelled && !item.isExpired,
        },
        {
          label: tFn("entitlements.userSubscriptions.renew"),
          onClick: (item: UserSubscription) => vm.renewSubscription(item.id),
          variant: "ghost" as const,
          className: "text-success hover:text-success/80",
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
