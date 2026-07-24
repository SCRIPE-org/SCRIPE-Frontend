/**
 * Subscriptions View — Tenant Subscription Dashboard
 *
 * Thin composition layer (~80 lines) that orchestrates sub-components.
 * All heavy rendering is extracted into the subscription-detail/ folder.
 *
 * Architecture: View → ViewModel → Repository → Service
 *
 * @module entitlements/subscriptions
 */
"use client";

import { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useSubscriptionsViewModel } from "../viewmodels/useSubscriptionsViewModel";
import { useEditionsViewModel } from "@modules/entitlements/core";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useBreadcrumbOverride } from "@core/hooks/use-breadcrumb-override";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { ArrowLeft, Package, Zap } from "lucide-react";

// ── Sub-components ──
import {
  HeroCard,
  PlanDetailsCard,
  BillingCard,
  StripeCard,
  HistorySection,
  DowngradeNotice,
} from "../components/subscription-detail";

// ── Dialog Components ──
import { AssignDialog } from "../components/AssignDialog";
import { ChangeDialog } from "../components/ChangeDialog";
import { SuspendDialog } from "../components/SuspendDialog";
import { CancelDialog } from "../components/CancelDialog";
import { ConvertDialog } from "../components/ConvertDialog";
import { CheckoutDialog } from "../components/CheckoutDialog";
import { CancelGatewayDialog } from "../components/CancelGatewayDialog";
import { GatewaySelectionDialog } from "../components/GatewaySelectionDialog";
import { ChangeCurrencyDialog } from "../components/ChangeCurrencyDialog";

interface SubscriptionsViewProps {
  tenantId: string;
}

/**
 * Presentation UI component rendering the subscriptions view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SubscriptionsView({ tenantId }: SubscriptionsViewProps) {
  useModuleLocales(() => import("../../../../core/locales"), "entitlements-shared");
  const { t, direction } = useI18n();
  const router = useRouter();
  const queryClient = useQueryClient();
  const vm = useSubscriptionsViewModel(tenantId);
  const editionsVm = useEditionsViewModel();

  // Derive the "current" subscription (priority: active > pending > suspended > first)
  const currentSub = useMemo(() => {
    if (!vm.items?.length) return null;
    return (
      vm.items.find((s) => s.status === "Active" || s.status === "Trialing") ??
      vm.items.find((s) => s.status === "PendingPayment") ??
      vm.items.find((s) => s.status === "Suspended") ??
      vm.items[0]
    );
  }, [vm.items]);

  useBreadcrumbOverride(currentSub ? currentSub.editionName : t("entSubscriptions.title"));

  // A failed fetch has no bearing on whether the tenant actually holds a
  // subscription — retrying re-hits the same query the view model owns.
  const retryFetch = useCallback(() => {
    queryClient.refetchQueries({ queryKey: ["entitlements", "subscriptions", tenantId] });
  }, [queryClient, tenantId]);

  // ── Loading Skeleton ──
  if (vm.isLoading) {
    return (
      <div className="space-y-6 p-1" dir={direction}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-nx-control" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-56 w-full rounded-nx-lg" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-48 rounded-nx-lg" />
          <Skeleton className="h-48 rounded-nx-lg" />
          <Skeleton className="h-48 rounded-nx-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1" dir={direction}>
      {/* ── Page Header ── */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-nx-control"
          onClick={() => router.back()}
          aria-label={t("common.back")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-nx-ink">
            {t("entSubscriptions.title")}
          </h1>
          <p className="text-sm text-nx-ink-2">{t("entSubscriptions.description")}</p>
        </div>
      </div>

      {/* ── Content ── */}
      {vm.error ? (
        <ErrorMessage message={t("entSubscriptions.loadError")} onRetry={retryFetch} />
      ) : currentSub ? (
        <>
          <HeroCard sub={currentSub} vm={vm} t={t} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <PlanDetailsCard sub={currentSub} t={t} />
            <BillingCard sub={currentSub} t={t} />
            <StripeCard sub={currentSub} vm={vm} t={t} />
          </div>

          <DowngradeNotice sub={currentSub} t={t} />

          {vm.items && vm.items.length > 1 && (
            <HistorySection items={vm.items} currentId={currentSub.id} t={t} />
          )}
        </>
      ) : (
        <EmptyState
          icon={Package}
          title={t("entSubscriptions.noSubscriptions")}
          description={t("entSubscriptions.assignDesc")}
          action={
            <Button size="lg" className="gap-2" onClick={() => vm.setShowAssignDialog(true)}>
              <Zap className="h-5 w-5" aria-hidden="true" />
              {t("entSubscriptions.assign")}
            </Button>
          }
        />
      )}

      {/* ── Dialogs ── */}
      <AssignDialog vm={vm} editionsVm={editionsVm} />
      <ChangeDialog vm={vm} editionsVm={editionsVm} />
      <SuspendDialog vm={vm} />
      <CancelDialog vm={vm} />
      <ConvertDialog vm={vm} editionsVm={editionsVm} />
      <CheckoutDialog vm={vm} />
      <CancelGatewayDialog vm={vm} />
      <ChangeCurrencyDialog vm={vm} />
      <GatewaySelectionDialog
        open={vm.showGatewayDialog}
        onOpenChange={vm.setShowGatewayDialog}
        onSelect={vm.handleGatewaySelected}
      />
    </div>
  );
}
