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
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";
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
    <AlertDialog open={vm.showCancelGatewayDialog} onOpenChange={vm.setShowCancelGatewayDialog}>
      <AlertDialogContent
        className="sm:max-w-md"
        // A gateway cancel in flight stops being dismissable: Escape used to
        // be able to close this over a pending mutation with no UI left to
        // report whether the cancellation actually completed.
        onEscapeKeyDown={(event) => {
          if (vm.isCancelingGateway) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <XSquare className="h-5 w-5" aria-hidden="true" />
            {t("billing.dialogs.cancelTitle")}
          </AlertDialogTitle>
          <AlertDialogDescription>{t("billing.dialogs.cancelDescription")}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-2">
          <RadioGroup
            value={vm.cancelImmediately ? "immediately" : "period-end"}
            onValueChange={(val) => vm.setCancelImmediately(val === "immediately")}
            disabled={vm.isCancelingGateway}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="period-end" id="cancel-period-end" />
              <Label htmlFor="cancel-period-end" className="cursor-pointer">
                {t("billing.actions.cancelAtPeriodEnd")}
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="immediately" id="cancel-immediately" />
              <Label htmlFor="cancel-immediately" className="cursor-pointer text-destructive">
                {t("billing.actions.cancelImmediately")}
              </Label>
            </div>
          </RadioGroup>
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => vm.setShowCancelGatewayDialog(false)}
            disabled={vm.isCancelingGateway}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={vm.submitCancelGateway}
            loading={vm.isCancelingGateway}
          >
            {t("billing.actions.cancelGateway")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
