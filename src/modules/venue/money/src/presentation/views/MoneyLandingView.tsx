"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Lock, RefreshCw } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueMoneyNav } from "@modules/venue";
import { useMoneyLandingViewModel } from "../viewmodels/useMoneyLandingViewModel";
import { DailyShiftSummaryCard } from "../components/landing/DailyShiftSummaryCard";
import { MoneyKpiGrid } from "../components/landing/MoneyKpiGrid";
import { MoneyLandingHeader } from "../components/landing/MoneyLandingHeader";
import { OutstandingReceivablesCard } from "../components/landing/OutstandingReceivablesCard";
import { PaymentMethodsCard } from "../components/landing/PaymentMethodsCard";
import { RecentPaymentsCard } from "../components/landing/RecentPaymentsCard";
import { ResourcePerformanceCard } from "../components/landing/ResourcePerformanceCard";
import { RevenueTrendCard } from "../components/landing/RevenueTrendCard";
import { TimeOfDayDistributionCard } from "../components/landing/TimeOfDayDistributionCard";

/**
 * Money & Commercials workspace overview dashboard.
 */
export function MoneyLandingView() {
  useModuleLocales(() => import("../../../locales"), "venue.money");
  const { t, direction } = useI18n();
  const router = useRouter();

  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canViewPayments = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canCreatePayment = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE);
  const canUpdateAllocations = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENT_ALLOCATIONS_UPDATE);
  const canRecordPayment = canCreatePayment && canUpdateAllocations;

  useEffect(() => {
    if (canViewReceivables && !canViewPayments) {
      router.replace("/venue/money/receivables");
    } else if (!canViewReceivables && canViewPayments) {
      router.replace("/venue/money/payments");
    }
  }, [canViewReceivables, canViewPayments, router]);

  const vm = useMoneyLandingViewModel({
    canViewReceivables,
    canViewPayments,
    errorDescriptionMessage: t("money.error.description"),
  });

  if (!canViewReceivables && !canViewPayments) {
    return (
      <div className="space-y-6" dir={direction} data-testid="venue-money-denied">
        <EmptyState
          icon={Lock}
          title={t("money.permission.title")}
          description={t("money.permission.description")}
        />
      </div>
    );
  }

  if ((canViewReceivables && !canViewPayments) || (!canViewReceivables && canViewPayments)) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner showText={false} />
      </div>
    );
  }

  const unallocatedCount = vm.summary?.unallocatedPaymentsCount ?? 0;

  return (
    <div className="space-y-6" dir={direction} data-testid="venue-money-landing">
      <VenueMoneyNav />

      <MoneyLandingHeader
        dateFilter={vm.dateFilter}
        onDateFilterChange={vm.setDateFilter}
        loading={vm.loading}
        onRefresh={() => void vm.loadAllData()}
        canViewReceivables={canViewReceivables}
        canViewPayments={canViewPayments}
        canRecordPayment={canRecordPayment}
      />

      {vm.summaryError && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertDescription className="flex items-center justify-between">
            <span>{vm.summaryError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void vm.loadAllData()}
              className="h-7 gap-1.5 text-xs"
            >
              <RefreshCw className="size-3" aria-hidden="true" />
              <span>{t("money.retry")}</span>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <MoneyKpiGrid summary={vm.summary} currency={vm.currency} />

      {vm.dateFilter === "today" && (
        <DailyShiftSummaryCard
          summary={vm.summary}
          currency={vm.currency}
          channels={vm.dailyShiftChannels}
          canRecordPayment={canRecordPayment}
          canViewPayments={canViewPayments}
        />
      )}

      {unallocatedCount > 0 && (
        <Alert variant="default" className="border-warning/30 bg-warning/10 text-warning">
          <AlertCircle className="size-4 text-warning" aria-hidden="true" />
          <AlertDescription className="flex items-center justify-between text-xs">
            <span>
              {t("money.landing.exceptions.unallocatedBanner", { count: unallocatedCount })}
            </span>
            <Button asChild size="sm" variant="outline" className="h-7 border-warning/40 text-xs">
              <Link href="/venue/money/payments">
                <span>{t("money.landing.tables.allocateAction")}</span>
              </Link>
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <RevenueTrendCard
        trendBuckets={vm.trendBuckets}
        loading={vm.trendLoading}
        error={vm.trendError}
        onRetry={() => void vm.loadAllData()}
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ResourcePerformanceCard
          resourcePerformance={vm.resourcePerformance}
          loading={vm.resourceLoading}
          error={vm.resourceError}
        />
        <TimeOfDayDistributionCard
          timeOfDayBuckets={vm.timeOfDayBuckets}
          loading={vm.timeLoading}
          error={vm.timeError}
        />
      </div>

      <PaymentMethodsCard
        paymentMethods={vm.paymentMethods}
        totalCount={vm.totalPaymentMethodCount}
        loading={vm.methodsLoading}
        error={vm.methodsError}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <OutstandingReceivablesCard
          outstandingInvoices={vm.outstandingInvoices}
          loading={vm.tablesLoading}
          error={vm.tablesError}
          canRecordPayment={canRecordPayment}
        />
        <RecentPaymentsCard
          payments={vm.payments}
          loading={vm.tablesLoading}
          error={vm.tablesError}
          canUpdateAllocations={canUpdateAllocations}
        />
      </div>
    </div>
  );
}
