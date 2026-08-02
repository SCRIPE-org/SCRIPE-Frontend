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
import { PageHeader } from "@core/ui/page-header";
import { Badge } from "@core/ui/badge";
import { ErrorMessage } from "@core/ui/error-message";
import { Skeleton } from "@core/ui/skeleton";
import { CreditCard, CheckCircle2 } from "lucide-react";

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
        <ErrorMessage
          fullHeight
          message={t("entitlements.tenantConnect.errorDesc")}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <PageHeader
        icon={CreditCard}
        title={t("entitlements.tenantConnect.pageTitle")}
        description={t("entitlements.tenantConnect.pageDesc")}
        badges={
          vm.account?.isComplete && (
            <Badge variant="success">
              <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
              {t("entitlements.tenantConnect.verified")}
            </Badge>
          )
        }
      />

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
        <Skeleton shape="title" className="h-8 w-64" />
        <Skeleton shape="text" className="w-96" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-nx-lg" />
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-nx-lg" />
        <Skeleton className="h-24 rounded-nx-lg" />
        <Skeleton className="h-24 rounded-nx-lg" />
        <Skeleton className="h-24 rounded-nx-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-nx-lg" />
    </div>
  );
}
