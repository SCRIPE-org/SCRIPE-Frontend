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
import { AlertTriangle, Loader2 } from "lucide-react";
import type { SubscriptionEditionDialogProps } from "../types";
import { SubscriptionTypeSelect } from "./SubscriptionTypeSelect";
import { PromotionPicker } from "./PromotionPicker";
import { CurrencySelect } from "./CurrencySelect";

/**
 * React presentation component representing the change dialog UI element.
 */
export function ChangeDialog({ vm, editionsVm }: SubscriptionEditionDialogProps) {
  const { t } = useI18n();

  const selectedEd = (editionsVm.items ?? []).find((ed) => ed.id === vm.selectedEditionId) ?? null;

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
              options={(editionsVm.items ?? []).map((ed) => ({
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
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("entSubscriptions.checkingDowngradeImpact") || "Checking downgrade impact..."}
            </div>
          )}
          {vm.downgradeImpact?.hasOverflow && (
            <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-destructive">
                    {t("entSubscriptions.downgradeWarning") ||
                      "Downgrade Warning: Resource Limits Exceeded"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("entSubscriptions.downgradeWarningDesc") ||
                      "Switching to this edition will exceed the following resource limits:"}
                  </p>
                  <ul className="space-y-1">
                    {vm.downgradeImpact.overflows.map((ov) => (
                      <li key={ov.featureName} className="flex items-center gap-2 text-xs">
                        <span className="font-medium capitalize">{ov.resourceType}</span>
                        <span className="text-muted-foreground">
                          {t("entSubscriptions.downgradeOverflowDetail", {
                            current: ov.currentCount,
                            limit: ov.newLimit,
                            excess: ov.overflowCount,
                          }) ||
                            `Current: ${ov.currentCount} / New limit: ${ov.newLimit} (${ov.overflowCount} excess)`}
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
