/**
 * Change Currency Dialog
 *
 * Allows admins to change the billing currency for a tenant's active subscription.
 * Calls POST /tenants/{tenantId}/subscription/change-currency.
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
import { Label } from "@core/ui/label";
import { DollarSign } from "lucide-react";
import type { SubscriptionDialogProps } from "../types";
import { CurrencySelect } from "./CurrencySelect";

export function ChangeCurrencyDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={vm.showCurrencyDialog} onOpenChange={vm.setShowCurrencyDialog}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>
                {t("entSubscriptions.changeCurrency") || "Change Billing Currency"}
              </DialogTitle>
              <DialogDescription className="mt-0.5">
                {t("entSubscriptions.changeCurrencyDesc") ||
                  "Switch the billing currency for this tenant's subscription. All pricing will be recalculated."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("tenant.currency") || "New Currency"}</Label>
            <CurrencySelect value={vm.newCurrency} onValueChange={vm.setNewCurrency} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.setShowCurrencyDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            onClick={vm.submitChangeCurrency}
            disabled={!vm.newCurrency}
            loading={vm.isChangingCurrency}
          >
            {t("entSubscriptions.changeCurrency") || "Change Currency"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
