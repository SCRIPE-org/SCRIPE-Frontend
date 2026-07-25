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
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { SubscriptionDialogProps } from "../types";
import { RefundOptions } from "./RefundOptions";

/**
 * Presentation UI component rendering the cancel dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function CancelDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();

  return (
    <AlertDialog open={vm.showCancelDialog} onOpenChange={vm.setShowCancelDialog}>
      <AlertDialogContent
        // A cancel in flight stops being dismissable: Escape used to be able
        // to close this over a pending mutation with no UI left to report
        // whether the cancellation actually completed.
        onEscapeKeyDown={(event) => {
          if (vm.isCanceling) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t("entSubscriptions.cancel")}</AlertDialogTitle>
          <AlertDialogDescription>{t("entSubscriptions.cancelDesc")}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("entSubscriptions.reason")}</Label>
            <Textarea
              value={vm.cancelReason}
              onChange={(e) => vm.setCancelReason(e.target.value)}
              placeholder={t("entSubscriptions.cancelReasonPlaceholder")}
              rows={3}
              disabled={vm.isCanceling}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="use-fallback-cancel"
              checked={vm.useFallback}
              onCheckedChange={(v) => vm.setUseFallback(!!v)}
              disabled={vm.isCanceling}
            />
            <Label htmlFor="use-fallback-cancel" className="text-sm font-normal">
              {t("entSubscriptions.useFallback")}
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

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => vm.setShowCancelDialog(false)}
            disabled={vm.isCanceling}
          >
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={vm.submitCancel} loading={vm.isCanceling}>
            {t("entSubscriptions.cancel")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
