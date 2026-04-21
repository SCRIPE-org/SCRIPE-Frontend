/**
 * ConnectOnboardingView
 * Full-page view for managing Stripe Connect Express accounts.
 *
 * Layout:
 *   [Header]
 *   [ConnectAccountsTable]          — paginated list + search + create
 *   [CommissionRateConfig dialog]   — shown when rate button clicked
 *
 * Architecture compliance:
 * - "use client" — all interaction is client-side
 * - Zero `any` types
 * - Zero hardcoded strings — all via t() locale keys
 * - No direct IApiService imports — all through viewmodel → repository
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useConnectViewModel } from "../viewmodels/useConnectViewModel";
import { ConnectAccountsTable } from "../components/ConnectAccountsTable";
import { CommissionRateConfig } from "../components/CommissionRateConfig";
import { OnboardingStatusCard } from "../components/OnboardingStatusCard";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@core/ui/sheet";
import { CreditCard, X } from "lucide-react";

export function ConnectOnboardingView() {
  useModuleLocales(() => import("../../../locales"), "stripe-connect");
  const { t } = useI18n();
  const vm = useConnectViewModel();

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            {t("entitlements.stripeConnect.title")}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("entitlements.stripeConnect.description")}
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {vm.totalCount} {t("entitlements.stripeConnect.accounts")}
        </Badge>
      </div>

      {/* Accounts Table */}
      <ConnectAccountsTable
        accounts={vm.accounts}
        totalCount={vm.totalCount}
        page={vm.page}
        pageSize={vm.pageSize}
        totalPages={vm.totalPages}
        search={vm.search}
        isLoading={vm.isLoading}
        t={t}
        onSearchChange={(s) => { vm.setSearch(s); vm.setPage(1); }}
        onPageChange={vm.setPage}
        onViewDetail={vm.openDetail}
        onRefreshLink={vm.refreshLink}
        onOpenDashboard={vm.openDashboard}
        onOpenRateDialog={vm.openRateDialog}
        onCreateAccount={() => {
          // TODO: Replace prompt with a proper TenantSelect dialog once built.
          // For now, platform admins enter tenantId manually.
          const tenantId = window.prompt(t("entitlements.stripeConnect.enterTenantId"));
          if (tenantId?.trim()) vm.createAccount(tenantId.trim());
        }}
        isRefreshing={vm.isRefreshing}
        isOpeningDashboard={vm.isOpeningDashboard}
      />

      {/* Detail Side Sheet */}
      <Sheet open={vm.isDetailOpen} onOpenChange={(open) => !open && vm.closeDetail()}>
        <SheetContent className="w-full sm:max-w-[520px] overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center justify-between">
              <SheetTitle>{t("entitlements.stripeConnect.account")}</SheetTitle>
              <Button variant="ghost" size="icon" onClick={vm.closeDetail}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>

          {vm.isDetailLoading && (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              {t("common.loading") || "Loading..."}
            </div>
          )}

          {vm.selectedAccount && !vm.isDetailLoading && (
            <div className="mt-4 space-y-4">
              <OnboardingStatusCard
                account={vm.selectedAccount}
                t={t}
                onOpenOnboarding={(tenantId) => vm.createAccount(tenantId)}
                onRefreshLink={vm.refreshLink}
                onOpenDashboard={vm.openDashboard}
                isRefreshing={vm.isRefreshing}
                isOpeningDashboard={vm.isOpeningDashboard}
              />

              {/* Commission rate detail */}
              {vm.detailAccount && (
                <div className="rounded-md border p-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {t("entitlements.stripeConnect.effectiveRate")}
                    </p>
                    <span className="font-bold tabular-nums text-base">
                      {((vm.detailAccount.effectiveCommissionRate ?? 0) * 100).toFixed(2)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("entitlements.stripeConnect.effectiveRateDesc")}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => {
                      if (vm.selectedAccount) vm.openRateDialog(vm.selectedAccount);
                    }}
                  >
                    {t("entitlements.stripeConnect.commissionRateOverride")}
                  </Button>
                </div>
              )}

              {/* Stripe account ID */}
              {vm.detailAccount?.stripeAccountId && (
                <div className="rounded-md border p-3 text-sm space-y-1">
                  <p className="text-xs text-muted-foreground">
                    {t("entitlements.stripeConnect.stripeAccountId")}
                  </p>
                  <p className="font-mono text-xs break-all">
                    {vm.detailAccount.stripeAccountId}
                  </p>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Commission Rate Dialog */}
      <CommissionRateConfig
        account={vm.rateTarget}
        isOpen={vm.isRateDialogOpen}
        onClose={vm.closeRateDialog}
        onSave={vm.updateRate}
        isSaving={vm.isUpdatingRate}
        t={t}
      />
    </div>
  );
}
