/**
 * PayoutsView — Thin orchestrator (architecture-compliant)
 *
 * Pattern matches: AdminsView, TenantsView, EditionsView.
 * Each sub-component calls useI18n() internally — t is never passed as a prop.
 * useModuleLocales() is called once here at the top.
 */
"use client";

import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePayoutsViewModel } from "../viewmodels/usePayoutsViewModel";
import { PayoutsHeader }        from "../components/payouts/PayoutsHeader";
import { PayoutsLoadingSkeleton } from "../components/payouts/PayoutsLoadingSkeleton";
import { CommissionHistoryCard } from "../components/payouts/CommissionHistoryCard";
import { AccountStatusCard } from "../components/payouts/AccountStatusCard";
import { PayoutsKpiRow } from "../components/payouts/PayoutsKpiRow";
import { PayoutsEmptyState } from "../components/payouts/PayoutsEmptyState";

export function PayoutsView() {
  useModuleLocales(() => import("../../../locales"), "stripe-connect");
  const vm = usePayoutsViewModel();

  if (vm.isAccountLoading) return <PayoutsLoadingSkeleton />;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <PayoutsHeader account={vm.account} />

      {vm.isNotOnboarded && (
        <PayoutsEmptyState
          isOnboarding={vm.isOnboarding}
          onOnboard={vm.onboard}
        />
      )}

      {vm.account && (
        <>
          <PayoutsKpiRow
            lifetimeGross={vm.lifetimeGross}
            lifetimeFee={vm.lifetimeFee}
            lifetimeNet={vm.lifetimeNet}
            lifetimePaid={vm.lifetimePaid}
            effectiveRate={vm.effectiveRate}
            payoutsEnabled={vm.account.payoutsEnabled}
            chargesEnabled={vm.account.chargesEnabled}
          />

          <AccountStatusCard
            account={vm.account}
            isOnboarding={vm.isOnboarding}
            isRefreshing={vm.isRefreshing}
            isOpeningDashboard={vm.isOpeningDashboard}
            onOnboard={vm.onboard}
            onRefreshLink={vm.refreshLink}
            onOpenDashboard={vm.openDashboard}
          />
        </>
      )}

      {vm.account?.tenantId && (
        <CommissionHistoryCard
          commissions={vm.commissions}
          totalCount={vm.totalCount}
          page={vm.page}
          totalPages={vm.totalPages}
          filter={vm.filter}
          isLoading={vm.isCommissionsLoading}
          onPageChange={vm.setPage}
          onFilterChange={vm.setFilter}
          onClearFilter={vm.clearFilter}
        />
      )}
    </div>
  );
}
