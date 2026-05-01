/**
 * Suspend Subscription Dialog
 *
 * Allows admins to temporarily suspend a tenant's subscription.
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

export function SuspendDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();

  return (
    <Dialog open={vm.showSuspendDialog} onOpenChange={vm.setShowSuspendDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("entSubscriptions.suspend") || "Suspend Subscription"}</DialogTitle>
          <DialogDescription>
            {t("entSubscriptions.suspendDesc") || "Temporarily suspend this tenant's subscription."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("entSubscriptions.reason") || "Reason"}</Label>
            <Textarea
              value={vm.suspendReason}
              onChange={(e) => vm.setSuspendReason(e.target.value)}
              placeholder={
                t("entSubscriptions.reasonPlaceholder") ||
                "e.g., Payment overdue, Terms violation..."
              }
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="use-fallback-suspend"
              checked={vm.useFallback}
              onCheckedChange={(v) => vm.setUseFallback(!!v)}
            />
            <Label htmlFor="use-fallback-suspend" className="text-sm font-normal">
              {t("entSubscriptions.useFallback") ||
                "Downgrade to fallback edition instead of full suspend"}
            </Label>
          </div>

          <RefundOptions
            refundType={vm.refundType}
            onRefundTypeChange={vm.setRefundType}
            customRefundAmount={vm.customRefundAmount}
            onCustomRefundAmountChange={vm.setCustomRefundAmount}
            idPrefix="suspend"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => vm.setShowSuspendDialog(false)}>
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={vm.submitSuspend}
            loading={vm.isSuspending}
            disabled={!vm.suspendReason.trim()}
          >
            {t("entSubscriptions.suspend") || "Suspend"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
