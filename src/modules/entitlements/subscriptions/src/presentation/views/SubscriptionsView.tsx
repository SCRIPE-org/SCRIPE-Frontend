/**
 * Subscriptions View
 *
 * Tenant-scoped view showing subscription history with full lifecycle actions:
 * Assign, Change, Revoke, Suspend, Resume, Cancel, Convert Trial, Resync.
 *
 * Refactored: all dialogs extracted to individual component files.
 * This view only defines the CrudConfig and composes the dialog components.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction, CustomAction } from "@core/crud/components/generic-crud-view";
import { useSubscriptionsViewModel } from "../viewmodels/useSubscriptionsViewModel";
import { useEditionsViewModel } from "@modules/entitlements/editions/src/presentation/viewmodels/useEditionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { format } from "date-fns";
import {
  XCircle, PauseCircle, PlayCircle, Ban, ArrowRightLeft,
  RotateCcw, Shield, Tag, DollarSign, CreditCard, ExternalLink, XSquare,
} from "lucide-react";
import type { SubscriptionListItem } from "../../domain/entities/Subscription";
import { useModuleLocales } from "@core/hooks/use-module-locales";

// ── Constants ──
import {
  STATUS_VARIANTS, TYPE_VARIANTS,
  STATUS_KEY_MAP, TYPE_KEY_MAP,
} from "../constants";

// ── Dialog Components ──
import { AssignDialog } from "../components/AssignDialog";
import { ChangeDialog } from "../components/ChangeDialog";
import { SuspendDialog } from "../components/SuspendDialog";
import { CancelDialog } from "../components/CancelDialog";
import { ConvertDialog } from "../components/ConvertDialog";
import { CheckoutDialog } from "../components/CheckoutDialog";
import { CancelStripeDialog } from "../components/CancelStripeDialog";

/* ============================================
 * VIEWMODEL ADAPTER
 * ============================================ */

function useSubscriptionsCrudAdapter(tenantId: string) {
  const vm = useSubscriptionsViewModel(tenantId);
  const totalCount = vm.items?.length ?? 0;

  return {
    ...vm,
    loading: vm.isLoading,
    error: vm.error ? (vm.error as Error).message : null,
    refresh: () => { },
    refreshItems: () => { },
    selectedItems: [] as string[],
    setSelectedItems: () => { },
    searchValue: "",
    handleSearchChange: () => { },
    isCreateModalOpen: false,
    setIsCreateModalOpen: () => { },
    // Explicit pagination so GenericCrudView footer renders correct counts
    totalCount,
    page: 1,
    pageSize: totalCount || 1,
    totalPages: 1,
  };
}

/* ============================================
 * COLUMN RENDERERS
 * ============================================ */

function AmountCell({ item }: { item: SubscriptionListItem }) {
  if (!item.totalAmount || !item.currency) {
    return <span className="text-muted-foreground">—</span>;
  }
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: item.currency,
    minimumFractionDigits: 2,
  }).format(item.totalAmount);
  const hasDiscount = item.promotionDiscount != null && item.promotionDiscount > 0;

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1.5">
        <span className="tabular-nums text-sm font-medium">{formatted}</span>
        <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
          {item.currency}
        </Badge>
      </div>
      {hasDiscount && item.baseAmount != null && (
        <span className="text-[10px] text-muted-foreground">
          <span className="line-through">
            {new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency, minimumFractionDigits: 2 }).format(item.baseAmount)}
          </span>
          {" "}
          <span className="text-green-600">-{new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency, minimumFractionDigits: 2 }).format(item.promotionDiscount!)}</span>
        </span>
      )}
    </div>
  );
}

function PromoCell({ item }: { item: SubscriptionListItem }) {
  if (!item.appliedPromoCode) {
    return <span className="text-muted-foreground">—</span>;
  }
  return (
    <div className="flex items-center gap-1.5">
      <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
        <Tag className="h-3 w-3 me-0.5" />
        {item.appliedPromoCode}
      </Badge>
      {item.promotionDiscount != null && item.promotionDiscount > 0 && (
        <span className="text-[10px] text-green-600">-{item.promotionDiscount}%</span>
      )}
    </div>
  );
}

function RefundCell({ item, t }: { item: SubscriptionListItem; t: (key: string) => string }) {
  if (!item.refundType || item.refundType === "None") {
    return <span className="text-muted-foreground">—</span>;
  }
  const variant = item.refundType === "Full" ? "destructive" as const : "secondary" as const;
  return (
    <div className="flex flex-col gap-0.5">
      <Badge variant={variant} className="text-[10px] px-1.5 py-0">
        <DollarSign className="h-3 w-3 me-0.5" />
        {item.refundType === "Full"
          ? (t("entSubscriptions.fullRefund") || "Full Refund")
          : (t("entSubscriptions.proRataRefund") || "Pro-Rata")}
      </Badge>
      {item.refundAmount != null && item.refundAmount > 0 && item.currency && (
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency, minimumFractionDigits: 2 }).format(item.refundAmount)}
        </span>
      )}
    </div>
  );
}

/* ============================================
 * VIEW
 * ============================================ */

interface SubscriptionsViewProps {
  tenantId: string;
}

export function SubscriptionsView({ tenantId }: SubscriptionsViewProps) {
  useModuleLocales(() => import("../../../../locales"), "entitlements-shared");
  const { t, language } = useI18n();
  const vm = useSubscriptionsCrudAdapter(tenantId);
  const editionsVm = useEditionsViewModel();

  const config: CrudConfig<SubscriptionListItem> = useMemo(
    () => ({
      titleKey: "entSubscriptions.title",
      subtitleKey: "entSubscriptions.description",
      hideAddButton: true,
      hideActionsColumn: true,
      columns: [
        {
          key: "editionName",
          label: t("entitlements.editions.editionName"),
          sortable: false,
          render: (value: string, item: SubscriptionListItem) => (
            <div className="flex items-center gap-2">
              <span>{value}</span>
              {item.isDowngraded && (
                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                  {t("entSubscriptions.downgraded") || "Downgraded"}
                </Badge>
              )}
            </div>
          ),
        },
        {
          key: "type",
          label: t("tenant.subscriptionType"),
          render: (value: string) => (
            <Badge variant={TYPE_VARIANTS[value] ?? "outline"}>
              {t(`entSubscriptions.${TYPE_KEY_MAP[value] ?? value}`) || value}
            </Badge>
          ),
        },
        {
          key: "status",
          label: t("common.status"),
          render: (value: string) => (
            <Badge variant={STATUS_VARIANTS[value] ?? "outline"}>
              {t(`entSubscriptions.${STATUS_KEY_MAP[value] ?? value}`) || value}
            </Badge>
          ),
        },
        {
          key: "totalAmount",
          label: t("entitlements.pricing.amount") || "Amount",
          render: (_value: unknown, item: SubscriptionListItem) => (
            <AmountCell item={item} />
          ),
        },
        {
          key: "endDate",
          label: t("entSubscriptions.endDate") || "End Date",
          render: (value?: string) =>
            value ? format(new Date(value), "MMM d, yyyy") : "∞",
          hideOnMobile: true,
        },
        {
          key: "expiryBehavior",
          label: t("entSubscriptions.expiryBehavior") || "On Expiry",
          render: (value: string) => (
            <Badge variant="outline" className="text-xs">
              {value === "Fallback" ? "↓ Fallback" : "⏸ Suspend"}
            </Badge>
          ),
          hideOnMobile: true,
        },
        {
          key: "appliedPromoCode",
          label: t("entitlements.promotions.promoCode") || "Promo",
          render: (_value: unknown, item: SubscriptionListItem) => (
            <PromoCell item={item} />
          ),
          hideOnMobile: true,
        },
        {
          key: "refundType",
          label: t("entSubscriptions.refundType") || "Refund",
          render: (_value: unknown, item: SubscriptionListItem) => (
            <RefundCell item={item} t={t} />
          ),
          hideOnMobile: true,
        },
        {
          key: "startDate",
          label: t("common.createdAt"),
          render: (value: string) =>
            value ? format(new Date(value), "MMM d, yyyy") : "-",
          hideOnMobile: true,
        },
      ],

      getActions: (): CrudAction<SubscriptionListItem>[] => [
        {
          label: t("entSubscriptions.revoke"),
          icon: <XCircle className="h-4 w-4" />,
          variant: "ghost",
          className: "text-destructive",
          onClick: (item: SubscriptionListItem) => vm.revokeSubscription(item.id),
          show: (item: SubscriptionListItem) =>
            item.status === "Active" || item.status === "Trialing",
          loading: vm.isRevoking,
          confirmTitle: t("entSubscriptions.revoke"),
          confirmDescription:
            t("entSubscriptions.revokeDesc") ||
            "Are you sure you want to revoke this subscription?",
          confirmVariant: "destructive",
        },
      ],

      customActions: buildCustomActions(vm, t),

      customFooterContent: (
        <>
          <AssignDialog vm={vm} editionsVm={editionsVm} />
          <ChangeDialog vm={vm} editionsVm={editionsVm} />
          <SuspendDialog vm={vm} />
          <CancelDialog vm={vm} />
          <ConvertDialog vm={vm} editionsVm={editionsVm} />
          <CheckoutDialog vm={vm} />
          <CancelStripeDialog vm={vm} />
        </>
      ),
    }),
    [t, vm, editionsVm, language]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}

/* ============================================
 * CUSTOM ACTIONS BUILDER
 * ============================================ */

function buildCustomActions(
  vm: ReturnType<typeof useSubscriptionsCrudAdapter>,
  t: (key: string) => string,
): CustomAction[] {
  const actions: CustomAction[] = [];

  if (vm.hasActiveSubscription) {
    // Change plan
    actions.push({
      label: t("entSubscriptions.change"),
      icon: <ArrowRightLeft className="h-4 w-4" />,
      variant: "outline",
      onClick: async () => vm.setShowChangeDialog(true),
    });
    // Suspend
    actions.push({
      label: t("entSubscriptions.suspend") || "Suspend",
      icon: <PauseCircle className="h-4 w-4" />,
      variant: "outline",
      onClick: async () => vm.setShowSuspendDialog(true),
    });
    // Cancel
    actions.push({
      label: t("entSubscriptions.cancel") || "Cancel",
      icon: <Ban className="h-4 w-4" />,
      variant: "outline",
      onClick: async () => vm.setShowCancelDialog(true),
    });
    // Convert Trial (only if trialing)
    if (vm.isTrialing) {
      actions.push({
        label: t("entSubscriptions.convertTrial") || "Convert Trial",
        icon: <Shield className="h-4 w-4" />,
        variant: "default",
        onClick: async () => vm.setShowConvertDialog(true),
      });
    }
  } else if (vm.hasPendingPaymentSubscription) {
    // PendingPayment — show payment link + revoke
    actions.push({
      label: t("billing.actions.generateLink") || "Generate Link",
      icon: <CreditCard className="h-4 w-4" />,
      variant: "default",
      onClick: async () => vm.generatePaymentLink(),
      loading: vm.isSendingPaymentLink,
    });
    actions.push({
      label: t("billing.actions.generateAndSend") || "Generate & Send",
      icon: <CreditCard className="h-4 w-4" />,
      variant: "outline",
      onClick: async () => vm.sendPaymentLink(),
      loading: vm.isSendingPaymentLink,
    });
    actions.push({
      label: t("entSubscriptions.revoke") || "Revoke",
      icon: <Ban className="h-4 w-4" />,
      variant: "outline",
      className: "text-destructive",
      onClick: async () => vm.setShowCancelDialog(true),
    });
  } else if (vm.hasSuspendedSubscription) {
    // Resume
    actions.push({
      label: t("entSubscriptions.resume") || "Resume",
      icon: <PlayCircle className="h-4 w-4" />,
      variant: "default",
      onClick: async () => vm.resumeSubscription(),
      loading: vm.isResuming,
    });
  }

  // Assign — always available when no active subscription
  if (!vm.hasActiveSubscription && !vm.hasPendingPaymentSubscription && !vm.hasSuspendedSubscription) {
    actions.unshift({
      label: t("entSubscriptions.assign"),
      icon: <PlayCircle className="h-4 w-4" />,
      variant: "default",
      onClick: async () => vm.setShowAssignDialog(true),
    });
  }

  // Resync — always if any subscription exists
  if (vm.hasActiveSubscription || vm.hasSuspendedSubscription) {
    actions.push({
      label: t("entSubscriptions.resync") || "Resync",
      icon: <RotateCcw className="h-4 w-4" />,
      variant: "outline",
      onClick: async () => vm.resyncPermissions(),
      loading: vm.isResyncing,
    });
  }

  // Billing actions (only for PAID active subscriptions)
  if (vm.hasActiveSubscription && !vm.isFreeEdition) {
    actions.push({
      label: t("billing.actions.generateLink") || "Generate Link",
      icon: <CreditCard className="h-4 w-4" />,
      variant: "outline",
      onClick: async () => vm.generatePaymentLink(),
      loading: vm.isSendingPaymentLink,
    });
    actions.push({
      label: t("billing.actions.generateAndSend") || "Generate & Send",
      icon: <CreditCard className="h-4 w-4" />,
      variant: "outline",
      onClick: async () => vm.sendPaymentLink(),
      loading: vm.isSendingPaymentLink,
    });

    // Open Billing Portal (only if tenant has Stripe customer)
    if (vm.activeSubscription?.hasStripeCustomer) {
      actions.push({
        label: t("billing.actions.openPortal") || "Open Billing Portal",
        icon: <ExternalLink className="h-4 w-4" />,
        variant: "outline",
        onClick: async () => vm.openBillingPortal(),
        loading: vm.isOpeningPortal,
      });
    }

    // Cancel Stripe Subscription (only if tenant has Stripe subscription)
    if (vm.activeSubscription?.hasStripeSubscription) {
      actions.push({
        label: t("billing.actions.cancelStripe") || "Cancel Stripe",
        icon: <XSquare className="h-4 w-4" />,
        variant: "outline",
        className: "text-destructive",
        onClick: async () => vm.setShowCancelStripeDialog(true),
      });
    }
  }

  return actions;
}
