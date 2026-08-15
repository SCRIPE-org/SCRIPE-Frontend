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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { DetailRow } from "@core/ui/detail-row";

/**
 * Presentation UI component rendering the connect onboarding view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
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
            <DialogDescription>
              {t("entitlements.stripeConnect.accountDetailDesc")}
            </DialogDescription>
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

              <div className="rounded-nx-md border border-nx-line bg-nx-surface p-4">
                <DetailRow
                  label={t("entitlements.stripeConnect.effectiveRate")}
                  value={`${((vm.customViewItem.effectiveCommissionRate ?? 0) * 100).toFixed(2)}%`}
                  hint={t("entitlements.stripeConnect.effectiveRateDesc")}
                />
              </div>

              {vm.customViewItem.stripeAccountId && (
                <div className="rounded-nx-md border border-nx-line bg-nx-surface p-4">
                  <DetailRow
                    label={t("entitlements.stripeConnect.stripeAccountId")}
                    value={vm.customViewItem.stripeAccountId}
                    mono
                    copyable={vm.customViewItem.stripeAccountId}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={vm.closeCustomViewModal}>
              {t("common.close")}
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
            <DialogTitle>{t("entitlements.stripeConnect.createAccount")}</DialogTitle>
            <DialogDescription>{t("entitlements.stripeConnect.enterTenantId")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <GenericSelect
              options={[]}
              type="searchable"
              searchType="server"
              placeholder={t("admin.selectTenant")}
              searchPlaceholder={t("common.search")}
              onServerSearch={vm.handleTenantSearch}
              onValueChange={(val: string) => setTargetTenantId(val)}
              value={targetTenantId}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => vm.setCustomCreateModalOpen(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (targetTenantId) {
                  vm.createAccount(targetTenantId);
                  setTargetTenantId(""); // Reset
                }
              }}
              disabled={!targetTenantId || vm.isCreating}
              loading={vm.isCreating}
            >
              {t("common.create")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
