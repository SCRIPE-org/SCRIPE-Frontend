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
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@core/ui/dialog";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Label } from "@core/ui/label";
import { Loader2 } from "lucide-react";
import type { SubscriptionEditionDialogProps } from "../types";
import { SubscriptionTypeSelect } from "./SubscriptionTypeSelect";
import { PromotionPicker } from "./PromotionPicker";
import { CurrencySelect } from "./CurrencySelect";

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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.setShowChangeDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={vm.submitChange} disabled={!vm.selectedEditionId} loading={vm.isChanging}>
            {t("entSubscriptions.change")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
