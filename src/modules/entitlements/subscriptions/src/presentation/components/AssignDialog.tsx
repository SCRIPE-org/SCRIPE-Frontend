/**
 * Assign Subscription Dialog
 *
 * Allows admins to assign a new subscription to a tenant.
 * Supports edition selection, billing cycle, promotions, skip-payment, and currency.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import { DatePicker } from "@core/ui/date-picker";
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
import { Shield } from "lucide-react";
import type { SubscriptionEditionDialogProps } from "../types";
import { SubscriptionTypeSelect } from "./SubscriptionTypeSelect";
import { PromotionPicker } from "./PromotionPicker";
import { CurrencySelect } from "./CurrencySelect";

export function AssignDialog({ vm, editionsVm }: SubscriptionEditionDialogProps) {
  const { t } = useI18n();

  const selectedEd = (editionsVm.items ?? []).find((ed) => ed.id === vm.selectedEditionId) ?? null;

  return (
    <Dialog open={vm.showAssignDialog} onOpenChange={vm.setShowAssignDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("entSubscriptions.assign")}</DialogTitle>
          <DialogDescription>{t("entSubscriptions.assignDesc")}</DialogDescription>
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

          {/* End Date */}
          {vm.subscriptionType !== "Lifetime" && (
            <div className="space-y-2">
              <Label>{t("entSubscriptions.endDate") || "End Date"}</Label>
              <DatePicker
                value={vm.endDate}
                onChange={(v) => vm.setEndDate(v)}
                placeholder={t("entSubscriptions.endDate") || "End Date"}
              />
            </div>
          )}

          {/* Expiry Behavior */}
          {vm.subscriptionType !== "Lifetime" && (
            <div className="space-y-2">
              <Label>{t("entSubscriptions.expiryBehavior") || "On Expiry"}</Label>
              <GenericSelect
                type="single"
                options={[
                  {
                    value: "Fallback",
                    label: `↓ ${t("entSubscriptions.fallback") || "Fallback to lower edition"}`,
                  },
                  {
                    value: "Suspend",
                    label: `⏸ ${t("entSubscriptions.suspendOnExpiry") || "Suspend tenant"}`,
                  },
                ]}
                value={vm.expiryBehavior}
                onValueChange={(v: string) => vm.setExpiryBehavior(v)}
              />
            </div>
          )}

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

          {/* Skip Payment */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox
                id="assign-skip-payment"
                checked={vm.skipPayment}
                onCheckedChange={(checked) => vm.setSkipPayment(!!checked)}
              />
              <Label htmlFor="assign-skip-payment" className="cursor-pointer text-sm font-medium">
                {t("entSubscriptions.skipPayment") || "Skip Payment"}
              </Label>
            </div>
            <p className="ms-6 text-xs text-muted-foreground">
              {t("entSubscriptions.skipPaymentDesc") ||
                "Activates the subscription without payment processing. Use for demos or manual billing."}
            </p>
            {vm.skipPayment && (
              <div className="ms-6 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-800 dark:bg-amber-950/30">
                <Shield className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <span className="text-xs text-amber-700 dark:text-amber-400">
                  {t("entSubscriptions.skipPaymentWarning") ||
                    "This subscription will not auto-renew. No Stripe customer is created. Use manual invoicing for future billing."}
                </span>
              </div>
            )}
          </div>

          {/* Currency */}
          <CurrencySelect value={vm.currency} onValueChange={vm.setCurrency} />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.setShowAssignDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={vm.submitAssign}
            disabled={!vm.selectedEditionId}
            loading={vm.isAssigning}
          >
            {t("entSubscriptions.assign")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
