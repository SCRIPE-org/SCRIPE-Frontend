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

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSubscriptionsViewModel } from "../viewmodels/useSubscriptionsViewModel";
import { useEditionsViewModel } from "@modules/entitlements/core";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useBreadcrumbOverride } from "@core/hooks/use-breadcrumb-override";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { ArrowLeft } from "lucide-react";

// ── Sub-components ──
import {
  HeroCard,
  PlanDetailsCard,
  BillingCard,
  StripeCard,
  HistorySection,
  EmptyState,
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

  useBreadcrumbOverride(
    currentSub ? currentSub.editionName : t("entSubscriptions.title") || "Subscription Details"
  );

  // ── Loading Skeleton ──
  if (vm.isLoading) {
    return (
      <div className="space-y-6 p-1" dir={direction}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-7 w-48" />
        </div>
        <Skeleton className="h-56 w-full rounded-2xl" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
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
          className="h-9 w-9 cursor-pointer rounded-lg"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("entSubscriptions.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("entSubscriptions.description")}</p>
        </div>
      </div>

      {/* ── Content ── */}
      {currentSub ? (
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
        <EmptyState vm={vm} t={t} />
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
