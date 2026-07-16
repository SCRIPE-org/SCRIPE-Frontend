/**
 * Cancel Gateway Subscription Dialog
 *
 * Allows admins to cancel a gateway subscription (Stripe, PayPal, Paymob)
 * with options for immediate or end-of-period cancellation.
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
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { XSquare } from "lucide-react";
import type { SubscriptionDialogProps } from "../types";

/**
 * Presentation UI component rendering the cancel gateway dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function CancelGatewayDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={vm.showCancelGatewayDialog} onOpenChange={vm.setShowCancelGatewayDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <XSquare className="h-5 w-5" />
            {t("billing.dialogs.cancelTitle") || "Cancel Subscription"}
          </DialogTitle>
          <DialogDescription>
            {t("billing.dialogs.cancelDescription") || "Choose how you want to cancel."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup
            value={vm.cancelImmediately ? "immediately" : "period-end"}
            onValueChange={(val) => vm.setCancelImmediately(val === "immediately")}
          >
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="period-end" id="cancel-period-end" />
              <Label htmlFor="cancel-period-end" className="cursor-pointer">
                {t("billing.actions.cancelAtPeriodEnd") || "Cancel at Period End"}
              </Label>
            </div>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <RadioGroupItem value="immediately" id="cancel-immediately" />
              <Label htmlFor="cancel-immediately" className="cursor-pointer text-destructive">
                {t("billing.actions.cancelImmediately") || "Cancel Immediately"}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.setShowCancelGatewayDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={vm.submitCancelGateway}
            loading={vm.isCancelingGateway}
          >
            {t("billing.actions.cancelGateway") || "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
