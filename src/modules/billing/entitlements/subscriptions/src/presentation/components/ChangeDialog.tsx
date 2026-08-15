/**
 * Change Subscription Dialog
 *
 * Allows admins to switch a tenant to a different edition/plan.
 * Supports edition selection, billing cycle, promotions, and currency.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { AlertTriangle } from "lucide-react";
import type { SubscriptionEditionDialogProps } from "../types";
import { SubscriptionTypeSelect } from "./SubscriptionTypeSelect";
import { PromotionPicker } from "./PromotionPicker";
import { CurrencySelect } from "./CurrencySelect";

/**
 * Presentation UI component rendering the change dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ChangeDialog({ vm, editionsVm }: SubscriptionEditionDialogProps) {
  const { t } = useI18n();

  const selectedEd =
    (editionsVm.allEditionsForSelect ?? []).find((ed) => ed.id === vm.selectedEditionId) ?? null;

  return (
    <Dialog open={vm.showChangeDialog} onOpenChange={vm.setShowChangeDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("entSubscriptions.change")}</DialogTitle>
          <DialogDescription>{t("entSubscriptions.changeDesc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Edition — searchable GenericSelect */}
          <div className="space-y-2">
            <Label>{t("entitlements.editions.editionName")}</Label>
            <GenericSelect
              type="searchable"
              options={(editionsVm.allEditionsForSelect ?? []).map((ed) => ({
                value: ed.id,
                label: ed.displayNameEn || ed.name,
              }))}
              value={vm.selectedEditionId}
              onValueChange={(v: string) => vm.setSelectedEditionId(v)}
              placeholder={t("entitlements.editions.editionName")}
            />
          </div>

          {/* Type — filtered by selected edition billing controls */}
          <div className="space-y-2">
            <Label>{t("tenant.subscriptionType")}</Label>
            <SubscriptionTypeSelect
              value={vm.subscriptionType}
              onValueChange={vm.setSubscriptionType}
              edition={selectedEd}
            />
          </div>

          {/* Promotion Picker */}
          {vm.selectedEditionId && (
            <PromotionPicker
              isLoading={vm.isLoadingPromotions}
              promotions={vm.availablePromotions}
              selectedPromotionId={vm.selectedPromotionId}
              onPromotionChange={vm.setSelectedPromotionId}
              selectedPromotion={vm.selectedPromotion}
              requiresPromoCode={vm.requiresPromoCode}
              promoCode={vm.promoCode}
              onPromoCodeChange={vm.setPromoCode}
            />
          )}

          {/* Currency */}
          <CurrencySelect value={vm.currency} onValueChange={vm.setCurrency} />

          {/* Downgrade Impact Warning */}
          {vm.isLoadingDowngradeImpact && vm.selectedEditionId && (
            <div className="flex items-center gap-2 text-sm text-nx-ink-2">
              <LoadingSpinner size="inline" />
              {t("entSubscriptions.checkingDowngradeImpact")}
            </div>
          )}
          {vm.downgradeImpact?.hasOverflow && (
            <div className="rounded-nx-lg border border-destructive/40 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className="mt-0.5 h-5 w-5 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-destructive">
                    {t("entSubscriptions.downgradeWarning")}
                  </p>
                  <p className="text-xs text-nx-ink-3">
                    {t("entSubscriptions.downgradeWarningDesc")}
                  </p>
                  <ul className="space-y-1">
                    {vm.downgradeImpact.overflows.map((ov) => (
                      <li key={ov.featureName} className="flex items-center gap-2 text-xs">
                        <span className="font-medium capitalize">{ov.resourceType}</span>
                        <span className="text-nx-ink-3">
                          {t("entSubscriptions.downgradeOverflowDetail", {
                            current: ov.currentCount,
                            limit: ov.newLimit,
                            excess: ov.overflowCount,
                          })}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.setShowChangeDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={vm.submitChange}
            disabled={!vm.selectedEditionId}
            loading={vm.isChanging}
          >
            {t("entSubscriptions.change")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
