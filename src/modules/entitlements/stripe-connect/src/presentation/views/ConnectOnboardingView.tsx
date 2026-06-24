/**
 * ConnectOnboardingView
 * Full-page view for managing Stripe Connect Express accounts.
 *
 * Rewritten to use the standard SCRIPE GenericCrudView architecture.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useConnectViewModel } from "../viewmodels/useConnectViewModel";
import { CommissionRateConfig } from "../components/CommissionRateConfig";
import { OnboardingStatusCard } from "../components/OnboardingStatusCard";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import { useState } from "react";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@core/ui/dialog";
import { Button } from "@core/ui/button";

/**
 * React presentation component representing the connect onboarding view UI element.
 */
export function ConnectOnboardingView() {
  useModuleLocales(() => import("../../../locales"), "stripe-connect");
  const { t } = useI18n();
  const vm = useConnectViewModel();
  const [targetTenantId, setTargetTenantId] = useState("");

  return (
    <div className="space-y-6">
      <GenericCrudView viewModel={vm} config={vm.getConfigBase()} />

      {/* View Detail Modal - Using custom state to prevent GenericCrudView modal clashes */}
      <Dialog
        open={vm.customViewModalOpen}
        onOpenChange={(open) => !open && vm.closeCustomViewModal()}
      >
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{t("entitlements.stripeConnect.account")}</DialogTitle>
          </DialogHeader>

          {vm.customViewItem && (
            <div className="mt-4 space-y-4">
              <OnboardingStatusCard
                account={vm.customViewItem}
                t={t}
                onOpenOnboarding={(tenantId) => vm.refreshLink(tenantId)}
                onRefreshLink={(tenantId) => vm.refreshLink(tenantId)}
                onOpenDashboard={(tenantId) => vm.openDashboard(tenantId)}
                isRefreshing={vm.isRefreshingLink}
                isOpeningDashboard={vm.isOpeningDashboard}
              />

              <div className="space-y-2 rounded-md border p-4 text-sm">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{t("entitlements.stripeConnect.effectiveRate")}</p>
                  <span className="text-base font-bold tabular-nums">
                    {((vm.customViewItem.effectiveCommissionRate ?? 0) * 100).toFixed(2)}%
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("entitlements.stripeConnect.effectiveRateDesc")}
                </p>
              </div>

              {vm.customViewItem.stripeAccountId && (
                <div className="space-y-1 rounded-md border p-3 text-sm">
                  <p className="text-xs text-muted-foreground">
                    {t("entitlements.stripeConnect.stripeAccountId")}
                  </p>
                  <p className="break-all font-mono text-xs">{vm.customViewItem.stripeAccountId}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={vm.closeCustomViewModal}>
              {t("common.close") || "Close"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Commission Rate Dialog */}
      <CommissionRateConfig
        account={vm.rateTarget}
        isOpen={vm.isRateDialogOpen}
        onClose={vm.closeRateDialog}
        onSave={vm.updateRate}
        isSaving={vm.isUpdatingRate}
        t={t}
      />

      {/* Create Account Dialog */}
      <Dialog open={vm.customCreateModalOpen} onOpenChange={vm.setCustomCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("entitlements.stripeConnect.enterTenantId")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <GenericSelect
              options={[]}
              type="searchable"
              searchType="server"
              placeholder={t("admin.selectTenant") || "Select a tenant..."}
              searchPlaceholder={t("common.search") || "Search tenants..."}
              onServerSearch={vm.handleTenantSearch}
              onValueChange={(val: string) => setTargetTenantId(val)}
              value={targetTenantId}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => vm.setCustomCreateModalOpen(false)}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (targetTenantId) {
                  vm.createAccount(targetTenantId);
                  setTargetTenantId(""); // Reset
                }
              }}
              disabled={!targetTenantId || vm.isCreating}
            >
              {t("common.create") || "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
