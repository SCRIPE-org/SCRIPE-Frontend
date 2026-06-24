/**
 * TenantStripeConnectView
 *
 * Full-page tenant self-service view for Stripe Connect Express account management.
 * Supports three states:
 *   1. Not Onboarded — hero CTA with steps explanation
 *   2. Pending/Restricted — stepper progress with action buttons
 *   3. Complete — dashboard overview with KPIs and quick actions
 *
 * Architecture:
 *   - Uses useTenantConnectViewModel (DI-injected, JWT-resolved tenant)
 *   - No tenantId params needed — backend resolves from JWT context
 *   - All translations via useI18n()
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useTenantConnectViewModel } from "../viewmodels/useTenantConnectViewModel";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import { CreditCard, AlertTriangle, RefreshCw, CheckCircle2 } from "lucide-react";

import { StripeConnectHero } from "../components/StripeConnectHero";
import { StripeOnboardingStepper } from "../components/StripeOnboardingStepper";
import { StripeAccountKpis } from "../components/StripeAccountKpis";
import { StripeTransactionsLog } from "../components/StripeTransactionsLog";

/**
 * Presentation UI component rendering the tenant stripe connect view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantStripeConnectView() {
  useModuleLocales(() => import("../../../locales"), "stripe-connect");
  const { t } = useI18n();
  const vm = useTenantConnectViewModel();

  if (vm.isLoading) return <LoadingSkeleton />;

  if (vm.isError) {
    return (
      <div className="mx-auto max-w-4xl p-4 sm:p-6">
        <Card className="border-red-200 shadow-sm dark:border-red-800">
          <CardContent className="flex flex-col items-center justify-center space-y-4 py-16 text-center">
            <div className="rounded-2xl bg-red-50 p-5 dark:bg-red-900/20">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
                {t("entitlements.tenantConnect.errorTitle") || "Unable to Load Account"}
              </h2>
              <p className="mx-auto max-w-md text-sm text-muted-foreground">
                {t("entitlements.tenantConnect.errorDesc") ||
                  "We couldn't load your payment account information. You may not have permission to access this page, or there was a network issue."}
              </p>
            </div>
            <Button
              variant="outline"
              className="mt-2 gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry") || "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold tracking-tight">
            <div className="rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 p-2 dark:from-violet-500/20 dark:to-indigo-500/20">
              <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            {t("entitlements.tenantConnect.pageTitle") || "Payment Account"}
          </h1>
          <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
            {t("entitlements.tenantConnect.pageDesc") ||
              "Set up and manage your Stripe Connect Express account to receive automated payouts from your sales."}
          </p>
        </div>
        {vm.account?.isComplete && (
          <Badge
            variant="outline"
            className="border-emerald-200 bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
          >
            <CheckCircle2 className="mr-1 inline h-3 w-3" />
            {t("entitlements.tenantConnect.verified") || "Verified"}
          </Badge>
        )}
      </div>

      {/* State-Based Content */}
      {!vm.account ? (
        <StripeConnectHero onOnboard={vm.onboard} isOnboarding={vm.isOnboarding} />
      ) : vm.account.isComplete ? (
        <div className="space-y-6">
          <StripeAccountKpis
            account={vm.account}
            onOpenDashboard={vm.openDashboard}
            isOpeningDashboard={vm.isOpeningDashboard}
            onSync={vm.syncFromStripe}
            isSyncing={vm.isSyncing}
          />
          <StripeTransactionsLog
            transactions={vm.transactions}
            isLoading={vm.isLoadingTransactions}
            page={vm.txnPage}
            pageSize={vm.txnPageSize}
            status={vm.txnStatus}
            type={vm.txnType}
            setPage={vm.setTxnPage}
            setStatus={vm.setTxnStatus}
            setType={vm.setTxnType}
          />
        </div>
      ) : (
        <StripeOnboardingStepper
          account={vm.account}
          onOnboard={vm.onboard}
          onRefreshLink={vm.refreshLink}
          isOnboarding={vm.isOnboarding}
          isRefreshing={vm.isRefreshing}
        />
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
