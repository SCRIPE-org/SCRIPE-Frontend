/**
 * Cancel Subscription Dialog
 *
 * Allows admins to permanently cancel a tenant's subscription.
 * Supports reason input, fallback downgrade, and refund options.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { SubscriptionDialogProps } from "../types";
import { RefundOptions } from "./RefundOptions";

/**
 * React presentation component representing the cancel dialog UI element.
 */
export function CancelDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={vm.showCancelDialog} onOpenChange={vm.setShowCancelDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("entSubscriptions.cancel") || "Cancel Subscription"}</DialogTitle>
          <DialogDescription>
            {t("entSubscriptions.cancelDesc") || "Permanently cancel this subscription."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("entSubscriptions.reason") || "Reason (optional)"}</Label>
            <Textarea
              value={vm.cancelReason}
              onChange={(e) => vm.setCancelReason(e.target.value)}
              placeholder={
                t("entSubscriptions.cancelReasonPlaceholder") || "Why are you canceling?"
              }
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-fallback-cancel"
              checked={vm.useFallback}
              onCheckedChange={(v) => vm.setUseFallback(!!v)}
            />
            <Label htmlFor="use-fallback-cancel" className="text-sm font-normal">
              {t("entSubscriptions.useFallback") ||
                "Downgrade to fallback edition instead of full cancel"}
            </Label>
          </div>

          <RefundOptions
            refundType={vm.refundType}
            onRefundTypeChange={vm.setRefundType}
            customRefundAmount={vm.customRefundAmount}
            onCustomRefundAmountChange={vm.setCustomRefundAmount}
            idPrefix="cancel"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.setShowCancelDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={vm.submitCancel} loading={vm.isCanceling}>
            {t("entSubscriptions.cancel") || "Cancel Subscription"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
